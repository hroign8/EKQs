import { NextRequest, NextResponse } from 'next/server'
import { getTransactionStatus } from '@/lib/pesapal'

/**
 * GET /api/pesapal/callback
 * Handles the redirect after PesaPal payment.
 * Redirects the user back to the app with payment status.
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

    // status_code 1 = completed, 2 = failed, 3 = reversed
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
