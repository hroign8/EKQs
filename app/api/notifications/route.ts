import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = {
      userId: session.user.id,
      ...(unreadOnly ? { read: false } : {}),
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, markAllRead } = body

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    if (id) {
      await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
