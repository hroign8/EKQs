import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { getTransactionStatus } from '@/lib/pesapal'

/**
 * GET /api/admin/tickets
 * Admin endpoint — returns all ticket types (including inactive) and purchase stats.
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [ticketTypes, purchases] = await Promise.all([
      prisma.ticketType.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { purchases: true } },
        },
      }),
      prisma.ticketPurchase.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          ticketType: { select: { id: true, name: true, price: true } },
        },
      }),
    ])

    const types = ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      features: t.features,
      icon: t.icon,
      popular: t.popular,
      isActive: t.isActive,
      sortOrder: t.sortOrder,
      purchaseCount: t._count.purchases,
      createdAt: t.createdAt,
    }))

    const purchasesList = purchases.map((p) => ({
      id: p.id,
      userName: p.user.name || 'Unknown',
      userEmail: p.user.email,
      ticketType: p.ticketType.name,
      quantity: p.quantity,
      totalAmount: p.totalAmount,
      status: p.status,
      transactionId: p.transactionId,
      createdAt: p.createdAt,
    }))

    return NextResponse.json({ types, purchases: purchasesList })
  } catch (err) {
    console.error('Admin tickets fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/tickets
 * Admin endpoint — creates a new ticket type.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { name, price, features, icon, popular, sortOrder } = body

    if (!name || typeof name !== 'string') {
      return errorResponse('Ticket name is required')
    }
    if (typeof price !== 'number' || price < 0) {
      return errorResponse('Valid price is required')
    }

    const ticket = await prisma.ticketType.create({
      data: {
        name: name.trim(),
        price,
        features: Array.isArray(features) ? features : [],
        icon: icon || 'ticket',
        popular: popular === true,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    })

    return NextResponse.json({ ...ticket, purchaseCount: 0 }, { status: 201 })
  } catch (err) {
    console.error('Admin ticket create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/tickets
 * Admin endpoint — updates a ticket type.
 */
export async function PUT(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id || typeof id !== 'string') {
      return errorResponse('Ticket type ID is required')
    }

    const existing = await prisma.ticketType.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Ticket type not found', 404)
    }

    const data: Record<string, unknown> = {}
    if (typeof updates.name === 'string') data.name = updates.name.trim()
    if (typeof updates.price === 'number') data.price = updates.price
    if (Array.isArray(updates.features)) data.features = updates.features
    if (typeof updates.icon === 'string') data.icon = updates.icon
    if (typeof updates.popular === 'boolean') data.popular = updates.popular
    if (typeof updates.isActive === 'boolean') data.isActive = updates.isActive
    if (typeof updates.sortOrder === 'number') data.sortOrder = updates.sortOrder

    if (Object.keys(data).length === 0) {
      return errorResponse('No valid fields to update')
    }

    const updated = await prisma.ticketType.update({
      where: { id },
      data,
      include: { _count: { select: { purchases: true } } },
    })

    return NextResponse.json({
      ...updated,
      purchaseCount: updated._count.purchases,
      _count: undefined,
    })
  } catch (err) {
    console.error('Admin ticket update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/tickets?id=...
 * Admin endpoint — deletes a ticket type.
 */
export async function DELETE(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('Ticket type ID is required')
    }

    const existing = await prisma.ticketType.findUnique({
      where: { id },
      include: { _count: { select: { purchases: true } } },
    })
    if (!existing) {
      return errorResponse('Ticket type not found', 404)
    }
    if (existing._count.purchases > 0) {
      return errorResponse('Cannot delete a ticket type that has purchases. Deactivate it instead.')
    }

    await prisma.ticketType.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin ticket delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/tickets
 * Admin endpoint — verifies pending ticket purchases by checking PesaPal status.
 * Follows the same pattern as PATCH /api/admin/votes.
 */
export async function PATCH() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    // Find all pending ticket purchases that have a PesaPal transaction ID
    const pendingPurchases = await prisma.ticketPurchase.findMany({
      where: { status: 'pending', transactionId: { not: null } },
      select: { id: true, transactionId: true },
    })

    // Clean up orphaned purchases (no transactionId) older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const orphanedResult = await prisma.ticketPurchase.deleteMany({
      where: {
        status: 'pending',
        transactionId: null,
        createdAt: { lt: oneHourAgo },
      },
    })

    if (pendingPurchases.length === 0) {
      const msg = orphanedResult.count > 0
        ? `Removed ${orphanedResult.count} abandoned ticket purchase(s) with no payment`
        : 'No pending ticket purchases to check'
      return NextResponse.json({
        verified: 0, checked: 0, removed: orphanedResult.count, message: msg,
      })
    }

    // Deduplicate by transactionId
    const uniqueTransactionIds = Array.from(new Set(
      pendingPurchases.map(p => p.transactionId).filter((t): t is string => !!t)
    ))

    let verifiedCount = 0
    let removedCount = 0
    const errors: string[] = []

    for (const orderTrackingId of uniqueTransactionIds) {
      try {
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

        // status_code 1 = completed
        if (status.status_code === 1) {
          const result = await prisma.ticketPurchase.updateMany({
            where: { transactionId: orderTrackingId, status: 'pending' },
            data: { status: 'confirmed' },
          })
          verifiedCount += result.count
        }
        // status_code 2 = failed, 3 = reversed, 4 = cancelled
        else if (status.status_code >= 2) {
          const result = await prisma.ticketPurchase.updateMany({
            where: { transactionId: orderTrackingId, status: 'pending' },
            data: { status: 'failed' },
          })
          removedCount += result.count
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`Failed to check ticket transaction ${orderTrackingId}:`, msg)
        errors.push(`${orderTrackingId}: ${msg}`)
      }
    }

    const totalRemoved = removedCount + orphanedResult.count
    const parts: string[] = []
    if (verifiedCount > 0) parts.push(`Confirmed ${verifiedCount} ticket purchase(s)`)
    if (totalRemoved > 0) parts.push(`Marked ${removedCount} as failed, removed ${orphanedResult.count} abandoned`)
    if (parts.length === 0) parts.push(`Checked ${uniqueTransactionIds.length} transaction(s), no changes`)

    return NextResponse.json({
      checked: uniqueTransactionIds.length,
      verified: verifiedCount,
      removed: totalRemoved,
      errors: errors.length > 0 ? errors : undefined,
      message: parts.join('. '),
    })
  } catch (err) {
    console.error('Admin verify pending tickets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
