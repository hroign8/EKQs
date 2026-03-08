import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { isValidObjectId } from '@/lib/validations'

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
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { id, banned, banReason } = await request.json()
    if (!id || typeof id !== 'string') return errorResponse('User ID is required')
    if (!isValidObjectId(id)) return errorResponse('Invalid user ID format', 400)

    // Prevent admin from banning themselves
    if (session!.user.id === id && banned) {
      return errorResponse('You cannot ban your own account', 400)
    }

    // Prevent admin from banning other admins
    if (banned) {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
      if (target?.role === 'admin') {
        return errorResponse('Cannot ban another admin account', 403)
      }
    }

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
