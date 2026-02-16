import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'

/**
 * GET /api/admin/revenue
 * Admin endpoint — returns revenue analytics.
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') || '30', 10)))
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Overall revenue stats
    const [voteRevenue, ticketRevenue, recentVotes, totalVoters] = await Promise.all([
      prisma.vote.aggregate({
        _sum: { amountPaid: true },
        _count: true,
        where: { verified: true },
      }),
      prisma.ticketPurchase.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { status: 'confirmed' },
      }),
      prisma.vote.aggregate({
        _sum: { amountPaid: true, votesCount: true },
        _count: true,
        where: { verified: true, createdAt: { gte: since } },
      }),
      prisma.vote.findMany({
        where: { verified: true },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ])

    // Revenue by package
    const revenueByPackage = await prisma.vote.groupBy({
      by: ['packageId'],
      _sum: { amountPaid: true, votesCount: true },
      _count: true,
      where: { verified: true },
    })

    const packages = await prisma.votingPackage.findMany()
    const packageMap = new Map(packages.map((p: { id: string; name: string }) => [p.id, p.name]))

    // Revenue by contestant
    const revenueByContestant = await prisma.vote.groupBy({
      by: ['contestantId'],
      _sum: { amountPaid: true, votesCount: true },
      _count: true,
      where: { verified: true },
    })

    const contestants = await prisma.contestant.findMany({
      select: { id: true, name: true },
    })
    const contestantMap = new Map(contestants.map((c: { id: string; name: string }) => [c.id, c.name]))

    return NextResponse.json({
      overview: {
        totalVoteRevenue: voteRevenue._sum.amountPaid || 0,
        totalTicketRevenue: ticketRevenue._sum.totalAmount || 0,
        totalRevenue: (voteRevenue._sum.amountPaid || 0) + (ticketRevenue._sum.totalAmount || 0),
        totalVoteTransactions: voteRevenue._count,
        totalTicketTransactions: ticketRevenue._count,
        uniqueVoters: totalVoters.length,
      },
      recentPeriod: {
        days,
        revenue: recentVotes._sum.amountPaid || 0,
        votes: recentVotes._sum.votesCount || 0,
        transactions: recentVotes._count,
      },
      byPackage: revenueByPackage.map((r: { packageId: string; _sum: { amountPaid: number | null; votesCount: number | null }; _count: number }) => ({
        packageName: packageMap.get(r.packageId) || 'Unknown',
        revenue: r._sum.amountPaid || 0,
        votes: r._sum.votesCount || 0,
        transactions: r._count,
      })),
      byContestant: revenueByContestant.map((r: { contestantId: string; _sum: { amountPaid: number | null; votesCount: number | null }; _count: number }) => ({
        contestantName: contestantMap.get(r.contestantId) || 'Unknown',
        revenue: r._sum.amountPaid || 0,
        votes: r._sum.votesCount || 0,
        transactions: r._count,
      })),
    })
  } catch (err) {
    console.error('Admin revenue fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
