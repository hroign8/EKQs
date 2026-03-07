import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

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
      uniqueVoterCount,
      recentVotesRaw,
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
      // Count distinct voters without loading all rows into memory
      prisma.vote.groupBy({
        by: ['userId'],
        where: { verified: true },
      }).then(groups => groups.length),
      // Fetch recent votes without include to avoid orphaned-relation crashes
      prisma.vote.findMany({
        where: { verified: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.ticketPurchase.aggregate({
        _sum: { quantity: true, totalAmount: true },
        where: { status: 'confirmed' },
      }),
      prisma.contactMessage.count({ where: { read: false } }),
    ])

    // Batch-load relations for the 10 recent votes
    const cIds = [...new Set(recentVotesRaw.map(v => v.contestantId))]
    const catIds = [...new Set(recentVotesRaw.map(v => v.categoryId))]
    const uIds = [...new Set(recentVotesRaw.map(v => v.userId))]

    const [rvContestants, rvCategories, rvUsers] = await Promise.all([
      prisma.contestant.findMany({ where: { id: { in: cIds } }, select: { id: true, name: true } }),
      prisma.votingCategory.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } }),
      prisma.user.findMany({ where: { id: { in: uIds } }, select: { id: true, email: true } }),
    ])

    const cMap = new Map(rvContestants.map(c => [c.id, c.name]))
    const catMap = new Map(rvCategories.map(c => [c.id, c.name]))
    const uMap = new Map(rvUsers.map(u => [u.id, u.email]))

    return NextResponse.json({
      contestants: contestantCount,
      totalVotes: totalVotes._sum.votesCount || 0,
      totalRevenue: totalRevenue._sum.amountPaid || 0,
      uniqueVoters: uniqueVoterCount,
      ticketsSold: ticketsSold._sum.quantity || 0,
      ticketRevenue: ticketsSold._sum.totalAmount || 0,
      unreadMessages: contactMessages,
      recentVotes: recentVotesRaw.map(v => ({
        id: v.id,
        contestant: cMap.get(v.contestantId) ?? 'Deleted',
        category: catMap.get(v.categoryId) ?? 'Deleted',
        voterEmail: uMap.get(v.userId) ?? 'deleted',
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
