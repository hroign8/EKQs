import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'

/**
 * GET /api/admin/users
 * Admin endpoint — returns all registered users with vote and ticket counts.
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: {
          select: {
            votes: true,
            tickets: true,
          },
        },
      },
    })

    return NextResponse.json(users)
  } catch (err) {
    console.error('Admin users fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users
 * Admin endpoint — ban or unban a user.
 */
export async function PATCH(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id, banned, banReason } = await request.json()
    if (!id) return errorResponse('User ID is required')

    const user = await prisma.user.update({
      where: { id },
      data: {
        banned: !!banned,
        banReason: banned ? (banReason || 'Banned by admin') : null,
      },
      select: { id: true, banned: true, banReason: true },
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error('Admin user update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
