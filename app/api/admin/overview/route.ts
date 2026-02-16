import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'

/**
 * GET /api/admin/overview
 * Admin endpoint — returns dashboard overview stats.
 */
export async function GET(_request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [
      contestantCount,
      totalVotes,
      totalRevenue,
      uniqueVoters,
      recentVotes,
      ticketsSold,
      contactMessages,
    ] = await Promise.all([
      prisma.contestant.count({ where: { isActive: true } }),
      prisma.vote.aggregate({
        _sum: { votesCount: true },
        where: { verified: true },
      }),
      prisma.vote.aggregate({
        _sum: { amountPaid: true },
        where: { verified: true },
      }),
      prisma.vote.findMany({
        where: { verified: true },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.vote.findMany({
        where: { verified: true },
        include: {
          contestant: { select: { name: true } },
          category: { select: { name: true } },
          user: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.ticketPurchase.aggregate({
        _sum: { quantity: true, totalAmount: true },
        where: { status: 'confirmed' },
      }),
      prisma.contactMessage.count({ where: { read: false } }),
    ])

    return NextResponse.json({
      contestants: contestantCount,
      totalVotes: totalVotes._sum.votesCount || 0,
      totalRevenue: totalRevenue._sum.amountPaid || 0,
      uniqueVoters: uniqueVoters.length,
      ticketsSold: ticketsSold._sum.quantity || 0,
      ticketRevenue: ticketsSold._sum.totalAmount || 0,
      unreadMessages: contactMessages,
      recentVotes: recentVotes.map((v: { id: string; contestant: { name: string }; category: { name: string }; user: { email: string }; votesCount: number; amountPaid: number; createdAt: Date }) => ({
        id: v.id,
        contestant: v.contestant.name,
        category: v.category.name,
        voterEmail: v.user.email,
        votesCount: v.votesCount,
        amountPaid: v.amountPaid,
        time: v.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('Admin overview fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
