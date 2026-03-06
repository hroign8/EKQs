import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTransactionStatus } from '@/lib/pesapal'
import { sendVoteConfirmationEmail } from '@/lib/email'
import { createRateLimiter } from '@/lib/rate-limit'

// Rate limit IPN callbacks to prevent abuse (100 per minute per IP should be generous for legitimate use)
const ipnLimiter = createRateLimiter('pesapal-ipn', 100, 60_000)

/**
 * GET /api/pesapal/ipn
 * PesaPal Instant Payment Notification handler.
 * Called by PesaPal when a payment status changes.
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = await ipnLimiter.check(ip)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get('OrderTrackingId')
    const orderMerchantReference = searchParams.get('OrderMerchantReference')

    if (!orderTrackingId || !orderMerchantReference) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Validate parameter format (alphanumeric + hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(orderTrackingId)) {
      return NextResponse.json({ error: 'Invalid tracking ID format' }, { status: 400 })
    }

    // Get transaction status from PesaPal
    const status = await getTransactionStatus(orderTrackingId)

    console.warn(`[IPN] Received for ${orderTrackingId}: status_code=${status.status_code}, description=${status.payment_status_description}`)

    // Idempotency: skip re-processing only for completed/failed/reversed — not 4 (pending/cancelled)
    // so that a payment that was initially pending can still be reconciled if PesaPal retries the IPN.
    const existingTx = await prisma.pesapalTransaction.findUnique({
      where: { orderTrackingId },
      select: { statusCode: true },
    })
    if (existingTx && ['1', '2', '3'].includes(existingTx.statusCode || '')) {
      return NextResponse.json({
        orderNotificationType: 'IPNCHANGE',
        orderTrackingId,
        orderMerchantReference,
        status: 'already_processed',
      })
    }

    // Update transaction record (use updateMany to avoid throwing if record is missing)
    await prisma.pesapalTransaction.updateMany({
      where: { orderTrackingId },
      data: {
        status: status.payment_status_description,
        statusCode: String(status.status_code),
        paymentMethod: status.payment_method || undefined,
        pesapalTransactionId: status.confirmation_code || undefined,
      },
    })

    // If payment is completed (status_code 1 = completed)
    if (status.status_code === 1) {
      const transaction = await prisma.pesapalTransaction.findUnique({
        where: { orderTrackingId },
      })

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      // Verify the paid amount matches the expected amount to prevent payment fraud
      if (status.amount !== undefined && Number(status.amount) < transaction.amount) {
        console.error('IPN amount mismatch', {
          expected: transaction.amount,
          received: status.amount,
          orderTrackingId,
        })
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
      }

      if (transaction.transactionType === 'vote') {
        // Mark associated votes as verified
        const votes = await prisma.vote.findMany({
          where: { transactionId: orderTrackingId, verified: false },
          include: {
            contestant: true,
            category: true,
            user: true,
          },
        })

        const updated = await prisma.vote.updateMany({
          where: { transactionId: orderTrackingId, verified: false },
          data: { verified: true },
        })

        // Only send emails if we actually verified new votes (prevents duplicates
        // when both IPN and callback fire concurrently for the same transaction).
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
      } else if (transaction.transactionType === 'ticket') {
        // Mark ticket purchase as confirmed
        await prisma.ticketPurchase.updateMany({
          where: { transactionId: orderTrackingId },
          data: { status: 'confirmed' },
        })
      }
    }
    // Handle failed/reversed/cancelled payments (status_code 2=failed, 3=reversed)
    // We do NOT act on status_code 4 here — treat it as still-pending so a retry can verify it.
    else if (status.status_code === 2 || status.status_code === 3) {
      const transaction = await prisma.pesapalTransaction.findUnique({
        where: { orderTrackingId },
      })
      if (transaction?.transactionType === 'ticket') {
        await prisma.ticketPurchase.updateMany({
          where: { transactionId: orderTrackingId, status: 'pending' },
          data: { status: 'failed' },
        })
      } else if (transaction?.transactionType === 'vote') {
        // Remove unverified vote records for failed/cancelled payments
        await prisma.vote.deleteMany({
          where: { transactionId: orderTrackingId, verified: false },
        })
      }
    }

    // Return sanitized status (don't reflect raw PesaPal description to prevent XSS)
    const safeStatuses: Record<number, string> = { 0: 'pending', 1: 'completed', 2: 'failed', 3: 'reversed', 4: 'cancelled' }
    return NextResponse.json({
      orderNotificationType: 'IPNCHANGE',
      orderTrackingId,
      orderMerchantReference,
      status: safeStatuses[status.status_code] ?? 'unknown',
    })
  } catch (error) {
    console.error('PesaPal IPN error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
