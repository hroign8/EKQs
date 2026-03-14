import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { errorResponse } from '@/lib/api-utils'
import { isValidObjectId } from '@/lib/validations'

/**
 * GET /api/tickets/validate?id={ticketPurchaseId}
 * Public endpoint — validates a ticket purchase by ID.
 * Returns ticket details, holder info, and current status.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return errorResponse('Ticket ID is required')
  }
  if (!isValidObjectId(id)) {
    return errorResponse('Invalid ticket ID format')
  }

  try {
    const ticket = await prisma.ticketPurchase.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ticketType: { select: { id: true, name: true, price: true } },
      },
    })

    if (!ticket) {
      return errorResponse('Ticket not found', 404)
    }

    return NextResponse.json({
      id: ticket.id,
      status: ticket.status,
      ticketName: ticket.ticketType.name,
      quantity: ticket.quantity,
      totalAmount: ticket.totalAmount,
      holderName: ticket.user.name,
      holderEmail: ticket.user.email,
      purchasedAt: ticket.createdAt,
      transactionId: ticket.transactionId,
    })
  } catch (err) {
    console.error('Ticket validate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
