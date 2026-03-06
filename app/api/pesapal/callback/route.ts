import { NextRequest, NextResponse } from 'next/server'
import { getTransactionStatus } from '@/lib/pesapal'
import { prisma } from '@/lib/db'
import { sendVoteConfirmationEmail } from '@/lib/email'
import { createRateLimiter } from '@/lib/rate-limit'

const callbackLimiter = createRateLimiter('pesapal-callback', 30, 60_000)

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * GET /api/pesapal/callback
 * Handles the redirect after PesaPal payment.
 * Also updates the database directly — the IPN may arrive late or not at all,
 * so we reconcile the transaction status here to avoid stale pending records.
 *
 * Because mobile-money payments (and some card gateways) take a few seconds to
 * finalise after the redirect, we retry the status check up to 3 times with a
 * short delay if the first response is still "pending" (status_code 0).
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'anonymous'
    const rl = await callbackLimiter.check(ip)
    if (!rl.allowed) {
      return NextResponse.redirect(new URL('/vote?payment=error', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get('OrderTrackingId')

    if (!orderTrackingId) {
      return NextResponse.redirect(new URL('/vote?payment=error', request.url))
    }

    // Validate format to prevent injection
    if (!/^[a-zA-Z0-9-]+$/.test(orderTrackingId)) {
      return NextResponse.redirect(new URL('/vote?payment=error', request.url))
    }

    // Retry up to 3 times if payment is still pending (status_code 0).
    // Mobile-money payments often finalise seconds after the redirect.
    let status = await getTransactionStatus(orderTrackingId)
    if (status.status_code === 0) {
      for (let attempt = 0; attempt < 3; attempt++) {
        await sleep(3000)
        status = await getTransactionStatus(orderTrackingId)
        if (status.status_code !== 0) break
      }
    }

    // ── Reconcile DB (idempotent — safe even if IPN already processed it) ──
    const existingTx = await prisma.pesapalTransaction.findUnique({
      where: { orderTrackingId },
      select: { statusCode: true, transactionType: true },
    })

    // Terminal states: 1=completed, 2=failed, 3=reversed. We intentionally exclude
    // 4 (cancelled/pending) so a later successful payment can still be reconciled.
    const isAlreadyTerminal = existingTx && ['1', '2', '3'].includes(existingTx.statusCode || '')

    if (!isAlreadyTerminal) {
      // Update transaction record if it exists; skip if not (vote was created without a
      // matching tx record — DB inconsistency — but we still want to verify the vote).
      if (existingTx) {
        await prisma.pesapalTransaction.update({
          where: { orderTrackingId },
          data: {
            status: status.payment_status_description,
            statusCode: String(status.status_code),
            paymentMethod: status.payment_method || undefined,
            pesapalTransactionId: status.confirmation_code || undefined,
          },
        })
      }

      if (status.status_code === 1) {
        // Payment succeeded — determine type from transaction record or from whichever
        // related record exists (votes take priority in ambiguous cases).
        const txType = existingTx?.transactionType
        if (!txType || txType === 'vote') {
          const votes = await prisma.vote.findMany({
            where: { transactionId: orderTrackingId, verified: false },
            include: { contestant: true, category: true, user: true },
          })
          if (votes.length > 0) {
            await prisma.vote.updateMany({
              where: { transactionId: orderTrackingId },
              data: { verified: true },
            })
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
        }
        if (!txType || txType === 'ticket') {
          await prisma.ticketPurchase.updateMany({
            where: { transactionId: orderTrackingId, status: 'pending' },
            data: { status: 'confirmed' },
          })
        }
      } else if (status.status_code === 2 || status.status_code === 3) {
        // Only remove/fail on explicit failure (2) or reversal (3) — not on 4 (pending/cancelled)
        // to avoid destroying a vote that may still complete.
        const txType = existingTx?.transactionType
        if (!txType || txType === 'vote') {
          await prisma.vote.deleteMany({
            where: { transactionId: orderTrackingId, verified: false },
          })
        }
        if (!txType || txType === 'ticket') {
          await prisma.ticketPurchase.updateMany({
            where: { transactionId: orderTrackingId, status: 'pending' },
            data: { status: 'failed' },
          })
        }
      }
    }

    // ── Redirect user ──
    if (status.status_code === 1) {
      return NextResponse.redirect(new URL('/vote?payment=success', request.url))
    } else if (status.status_code === 0) {
      // Still pending after retries — payment may complete via IPN or manual verification.
      // Show "processing" instead of "failed" so the voter knows their payment is being processed.
      return NextResponse.redirect(new URL('/vote?payment=processing', request.url))
    } else {
      return NextResponse.redirect(
        new URL(`/vote?payment=failed&reason=${encodeURIComponent(status.payment_status_description)}`, request.url)
      )
    }
  } catch (error) {
    console.error('PesaPal callback error:', error)
    return NextResponse.redirect(new URL('/vote?payment=error', request.url))
  }
}
