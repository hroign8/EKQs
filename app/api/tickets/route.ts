import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, errorResponse } from '@/lib/api-utils'
import { ticketPurchaseSchema } from '@/lib/validations'
import { submitOrder, registerIPN } from '@/lib/pesapal'
import { randomUUID } from 'crypto'

/**
 * POST /api/tickets
 * Authenticated endpoint — initiates a ticket purchase.
 */
export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const parsed = ticketPurchaseSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const { ticketTypeId, quantity } = parsed.data

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    })

    if (!ticketType || !ticketType.isActive) {
      return errorResponse('Ticket type not found')
    }

    const totalAmount = ticketType.price * quantity
    const merchantReference = `TKT-${randomUUID().slice(0, 8).toUpperCase()}`

    const publicBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : null) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3001'

    const callbackUrl = `${publicBase}/api/pesapal/callback`
    const ipnUrl = process.env.PESAPAL_IPN_URL?.startsWith('http://localhost')
      ? `${publicBase}/api/pesapal/ipn`
      : process.env.PESAPAL_IPN_URL || `${publicBase}/api/pesapal/ipn`

    let ipnId: string

    try {
      ipnId = await registerIPN(ipnUrl)
    } catch (pesapalErr) {
      console.error('PesaPal IPN registration failed:', pesapalErr)
      return errorResponse('Payment provider is not configured', 503)
    }

    const order = await submitOrder({
      merchantReference,
      amount: totalAmount,
      description: `${quantity}x ${ticketType.name} ticket(s) - Eritrean Kings & Queens`,
      callbackUrl,
      ipnId,
      email: session!.user.email,
      firstName: session!.user.name?.split(' ')[0],
      lastName: session!.user.name?.split(' ').slice(1).join(' '),
    })

    await prisma.pesapalTransaction.create({
      data: {
        orderTrackingId: order.order_tracking_id,
        merchantReference,
        transactionType: 'ticket',
        amount: totalAmount,
        description: `${quantity}x ${ticketType.name} ticket(s)`,
      },
    })

    await prisma.ticketPurchase.create({
      data: {
        userId: session!.user.id,
        ticketTypeId,
        quantity,
        totalAmount,
        transactionId: order.order_tracking_id,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      redirectUrl: order.redirect_url,
      orderTrackingId: order.order_tracking_id,
    })
  } catch (error) {
    console.error('Failed to purchase ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/tickets
 * Public endpoint — returns available ticket types.
 */
export async function GET() {
  try {
    const ticketTypes = await prisma.ticketType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(ticketTypes)
  } catch (error) {
    console.error('Failed to fetch ticket types:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
