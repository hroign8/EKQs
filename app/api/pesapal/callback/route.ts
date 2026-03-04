import { NextRequest, NextResponse } from 'next/server'
import { getTransactionStatus } from '@/lib/pesapal'
import { prisma } from '@/lib/db'
import { sendVoteConfirmationEmail } from '@/lib/email'

/**
 * GET /api/pesapal/callback
 * Handles the redirect after PesaPal payment.
 * Also updates the database directly — the IPN may arrive late or not at all,
 * so we reconcile the transaction status here to avoid stale pending records.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get('OrderTrackingId')

    if (!orderTrackingId) {
      return NextResponse.redirect(new URL('/vote?payment=error', request.url))
    }

    // Validate format to prevent injection
    if (!/^[a-zA-Z0-9-]+$/.test(orderTrackingId)) {
      return NextResponse.redirect(new URL('/vote?payment=error', request.url))
    }

    const status = await getTransactionStatus(orderTrackingId)

    // ── Reconcile DB (idempotent — safe even if IPN already processed it) ──
    const existingTx = await prisma.pesapalTransaction.findUnique({
      where: { orderTrackingId },
      select: { statusCode: true, transactionType: true },
    })

    // Only update if not already in a terminal state
    if (existingTx && !['1', '2', '3', '4'].includes(existingTx.statusCode || '')) {
      await prisma.pesapalTransaction.update({
        where: { orderTrackingId },
        data: {
          status: status.payment_status_description,
          statusCode: String(status.status_code),
          paymentMethod: status.payment_method || undefined,
          pesapalTransactionId: status.confirmation_code || undefined,
        },
      })

      if (status.status_code === 1) {
        // Payment succeeded
        if (existingTx.transactionType === 'vote') {
          const votes = await prisma.vote.findMany({
            where: { transactionId: orderTrackingId, verified: false },
            include: { contestant: true, category: true, user: true },
          })
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
        } else if (existingTx.transactionType === 'ticket') {
          await prisma.ticketPurchase.updateMany({
            where: { transactionId: orderTrackingId },
            data: { status: 'confirmed' },
          })
        }
      } else if (status.status_code >= 2) {
        // Payment failed / reversed / cancelled
        if (existingTx.transactionType === 'vote') {
          await prisma.vote.deleteMany({
            where: { transactionId: orderTrackingId, verified: false },
          })
        } else if (existingTx.transactionType === 'ticket') {
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
