import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { contestantSchema } from '@/lib/validations'

/**
 * GET /api/admin/contestants
 * Admin endpoint — returns all contestants (including inactive).
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const contestants = await prisma.contestant.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(contestants)
  } catch (err) {
    console.error('Admin contestants fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/contestants
 * Admin endpoint — creates a new contestant.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = contestantSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const contestant = await prisma.contestant.create({
      data: parsed.data,
    })

    return NextResponse.json(contestant, { status: 201 })
  } catch (err) {
    console.error('Admin contestant create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
