import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { eventSchema } from '@/lib/validations'

/**
 * GET /api/admin/event
 * Admin endpoint — returns the active event configuration.
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const event = await prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(event)
  } catch (err) {
    console.error('Admin event fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/event
 * Admin endpoint — creates or updates the event configuration.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = eventSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    // Deactivate all other events and create the new one atomically
    const event = await prisma.$transaction(async (tx) => {
      await tx.event.updateMany({
        data: { isActive: false },
      })
      return tx.event.create({
        data: {
          ...parsed.data,
          isActive: true,
          votePrice: parsed.data.votePrice ?? 0.30,
        },
      })
    })

    return NextResponse.json(event, { status: 201 })
  } catch (err) {
    console.error('Admin event create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/event
 * Admin endpoint — updates the active event.
 */
export async function PUT(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = eventSchema.partial().safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    // Find the most recent event regardless of isActive so the route works even
    // if a previous toggle accidentally set isActive to false.
    const activeEvent = await prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!activeEvent) {
      return errorResponse('No active event found', 404)
    }

    // When re-opening voting, also restore isActive so the event is visible
    // to any other queries that still rely on that field.
    const updateData = { ...parsed.data }
    if (parsed.data.votingOpen === true) {
      Object.assign(updateData, { isActive: true })
    }

    const event = await prisma.event.update({
      where: { id: activeEvent.id },
      data: updateData,
    })

    return NextResponse.json(event)
  } catch (err) {
    console.error('Admin event update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
