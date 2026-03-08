import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTransactionStatus } from '@/lib/pesapal'
import { sendVoteConfirmationEmail } from '@/lib/email'

/**
 * GET /api/cron/reconcile-payments
 *
 * Automated cron endpoint that checks all pending PesaPal transactions
 * and verifies any that have been completed. This ensures votes and ticket
 * purchases are confirmed even if the IPN callback was missed or delayed.
 *
 * Secured via CRON_SECRET to prevent unauthorized invocations.
 * Called by Vercel Cron every 5 minutes.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access — fail closed if unset
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── Reconcile pending VOTES ──────────────────────────────
    const pendingVotes = await prisma.vote.findMany({
      where: { verified: false, transactionId: { not: null } },
      select: { id: true, transactionId: true },
    })

    const uniqueVoteTxIds = Array.from(new Set(
      pendingVotes.map(v => v.transactionId).filter((t): t is string => !!t)
    ))

    let votesVerified = 0
    let votesRemoved = 0
    const errors: string[] = []
    const startTime = Date.now()
    const TIME_BUDGET_MS = 50_000
    const BATCH_SIZE = 5

    for (let i = 0; i < uniqueVoteTxIds.length; i += BATCH_SIZE) {
      if (Date.now() - startTime > TIME_BUDGET_MS) {
        errors.push(`Time limit reached — checked ${i} of ${uniqueVoteTxIds.length} vote transactions`)
        break
      }

      const batch = uniqueVoteTxIds.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(async (orderTrackingId) => {
          const status = await getTransactionStatus(orderTrackingId)

          // Update the PesaPal transaction record
          await prisma.pesapalTransaction.updateMany({
            where: { orderTrackingId },
            data: {
              status: status.payment_status_description,
              statusCode: String(status.status_code),
              paymentMethod: status.payment_method || undefined,
              pesapalTransactionId: status.confirmation_code || undefined,
            },
          })

          if (status.status_code === 1) {
            // Payment completed — verify the votes
            const votes = await prisma.vote.findMany({
              where: { transactionId: orderTrackingId, verified: false },
              include: { contestant: true, category: true, user: true },
            })

            const updated = await prisma.vote.updateMany({
              where: { transactionId: orderTrackingId, verified: false },
              data: { verified: true },
            })

            // Only send emails if we actually verified new votes (prevents duplicates
            // when cron and IPN/callback fire concurrently for the same transaction).
            if (updated.count > 0) {
              for (const vote of votes) {
                void sendVoteConfirmationEmail(
                  vote.user.email,
                  vote.contestant.name,
                  vote.category.name,
                  vote.votesCount,
                  vote.amountPaid
                )
              }
            }

            return { verified: updated.count, removed: 0 }
          } else if (status.status_code === 2 || status.status_code === 3) {
            // Payment failed (2) or reversed (3) — remove unverified votes
            const result = await prisma.vote.deleteMany({
              where: { transactionId: orderTrackingId, verified: false },
            })
            return { verified: 0, removed: result.count }
          }
          // status_code 0 or 4 = still pending, leave as-is
          return { verified: 0, removed: 0 }
        })
      )

      for (let j = 0; j < results.length; j++) {
        const r = results[j]
        if (r.status === 'fulfilled') {
          votesVerified += r.value.verified
          votesRemoved += r.value.removed
        } else {
          const msg = r.reason instanceof Error ? r.reason.message : String(r.reason)
          console.error(`[Cron] Failed to check vote tx ${batch[j]}:`, msg)
          errors.push(`${batch[j]}: ${msg}`)
        }
      }
    }

    // ── Reconcile pending TICKETS ────────────────────────────
    let ticketsConfirmed = 0

    if (Date.now() - startTime < TIME_BUDGET_MS) {
      const pendingTickets = await prisma.ticketPurchase.findMany({
        where: { status: 'pending', transactionId: { not: null } },
        select: { id: true, transactionId: true },
      })

      const uniqueTicketTxIds = Array.from(new Set(
        pendingTickets.map(t => t.transactionId).filter((t): t is string => !!t)
      ))

      for (let i = 0; i < uniqueTicketTxIds.length; i += BATCH_SIZE) {
        if (Date.now() - startTime > TIME_BUDGET_MS) break

        const batch = uniqueTicketTxIds.slice(i, i + BATCH_SIZE)
        const results = await Promise.allSettled(
          batch.map(async (orderTrackingId) => {
            const status = await getTransactionStatus(orderTrackingId)

            await prisma.pesapalTransaction.updateMany({
              where: { orderTrackingId },
              data: {
                status: status.payment_status_description,
                statusCode: String(status.status_code),
                paymentMethod: status.payment_method || undefined,
                pesapalTransactionId: status.confirmation_code || undefined,
              },
            })

            if (status.status_code === 1) {
              const result = await prisma.ticketPurchase.updateMany({
                where: { transactionId: orderTrackingId, status: 'pending' },
                data: { status: 'confirmed' },
              })
              return result.count
            } else if (status.status_code === 2 || status.status_code === 3) {
              await prisma.ticketPurchase.updateMany({
                where: { transactionId: orderTrackingId, status: 'pending' },
                data: { status: 'failed' },
              })
            }
            return 0
          })
        )

        for (let j = 0; j < results.length; j++) {
          const r = results[j]
          if (r.status === 'fulfilled') {
            ticketsConfirmed += r.value
          } else {
            const msg = r.reason instanceof Error ? r.reason.message : String(r.reason)
            console.error(`[Cron] Failed to check ticket tx ${batch[j]}:`, msg)
          }
        }
      }
    }

    // ── Clean up orphaned votes (no transactionId, older than 1 hour) ──
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const orphaned = await prisma.vote.deleteMany({
      where: {
        verified: false,
        transactionId: null,
        createdAt: { lt: oneHourAgo },
      },
    })

    console.log(
      `[Cron] Reconciliation: ${votesVerified} votes verified, ${votesRemoved} votes removed, ` +
      `${ticketsConfirmed} tickets confirmed, ${orphaned.count} orphaned cleaned up`
    )

    return NextResponse.json({
      votesVerified,
      votesRemoved,
      ticketsConfirmed,
      orphanedCleaned: orphaned.count,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('[Cron] Reconciliation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
