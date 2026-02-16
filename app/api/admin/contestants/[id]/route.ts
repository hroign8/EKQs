import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { contestantSchema } from '@/lib/validations'

/**
 * PUT /api/admin/contestants/[id]
 * Admin endpoint — updates a contestant.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = contestantSchema.partial().safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const existing = await prisma.contestant.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Contestant not found', 404)
    }

    const contestant = await prisma.contestant.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(contestant)
  } catch (err) {
    console.error('Admin contestant update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/contestants/[id]
 * Admin endpoint — soft-deletes a contestant (sets isActive to false).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const existing = await prisma.contestant.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Contestant not found', 404)
    }

    await prisma.contestant.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin contestant delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
