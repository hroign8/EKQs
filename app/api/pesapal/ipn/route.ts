import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTransactionStatus } from '@/lib/pesapal'
import { sendVoteConfirmationEmail } from '@/lib/email'

/**
 * GET /api/pesapal/ipn
 * PesaPal Instant Payment Notification handler.
 * Called by PesaPal when a payment status changes.
 */
export async function GET(request: NextRequest) {
  try {
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

    // Update transaction record
    await prisma.pesapalTransaction.update({
      where: { orderTrackingId },
      data: {
        status: status.payment_status_description,
        statusCode: String(status.status_code),
        paymentMethod: status.payment_method,
        pesapalTransactionId: status.confirmation_code,
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

        await prisma.vote.updateMany({
          where: { transactionId: orderTrackingId },
          data: { verified: true },
        })

        // Send confirmation emails
        for (const vote of votes) {
          void sendVoteConfirmationEmail(
            vote.user.email,
            vote.contestant.name,
            vote.category.name,
            vote.votesCount,
            vote.amountPaid
          )
        }
      } else if (transaction.transactionType === 'ticket') {
        // Mark ticket purchase as confirmed
        await prisma.ticketPurchase.updateMany({
          where: { transactionId: orderTrackingId },
          data: { status: 'confirmed' },
        })
      }
    }
    // Handle failed/reversed/cancelled ticket payments (status_code 2=failed, 3=reversed, 4=cancelled)
    else if (status.status_code >= 2) {
      const transaction = await prisma.pesapalTransaction.findUnique({
        where: { orderTrackingId },
      })
      if (transaction?.transactionType === 'ticket') {
        await prisma.ticketPurchase.updateMany({
          where: { transactionId: orderTrackingId, status: 'pending' },
          data: { status: 'failed' },
        })
      }
    }

    return NextResponse.json({
      orderNotificationType: 'IPNCHANGE',
      orderTrackingId,
      orderMerchantReference,
      status: status.payment_status_description,
    })
  } catch (error) {
    console.error('PesaPal IPN error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
