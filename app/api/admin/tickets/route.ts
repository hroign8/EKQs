import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'

/**
 * GET /api/admin/tickets
 * Admin endpoint — returns all ticket types (including inactive) and purchase stats.
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const ticketTypes = await prisma.ticketType.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { purchases: true } },
      },
    })

    const result = ticketTypes.map((t) => ({
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

    return NextResponse.json(result)
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
