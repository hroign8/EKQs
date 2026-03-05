import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const revalidate = 30

/**
 * GET /api/contestants/top
 * Public endpoint — returns the top contestants ranked by total verified votes.
 * Query params: limit (default 3, max 10)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '3', 10)))

  try {
    // Aggregate total verified votes per contestant
    const voteTotals = await prisma.vote.groupBy({
      by: ['contestantId'],
      _sum: { votesCount: true },
      where: { verified: true },
      orderBy: { _sum: { votesCount: 'desc' } },
      take: limit,
    })

    if (voteTotals.length === 0) {
      // Fallback: return top contestants by rank if no votes exist yet
      const fallback = await prisma.contestant.findMany({
        where: { isActive: true },
        orderBy: { rank: 'asc' },
        take: limit,
        select: { id: true, name: true, country: true, gender: true, image: true },
      })

      const response = NextResponse.json(
        fallback.map((c, i) => ({ ...c, totalVotes: 0, position: i + 1 })),
      )
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
      return response
    }

    // Fetch contestant details for the top IDs
    const topIds = voteTotals.map((v) => v.contestantId)
    const contestants = await prisma.contestant.findMany({
      where: { id: { in: topIds }, isActive: true },
      select: { id: true, name: true, country: true, gender: true, image: true },
    })

    // Merge and maintain vote-count order
    const contestantMap = new Map(contestants.map((c) => [c.id, c]))
    const result = voteTotals
      .map((v, i) => {
        const c = contestantMap.get(v.contestantId)
        if (!c) return null
        return {
          id: c.id,
          name: c.name,
          country: c.country,
          gender: c.gender,
          image: c.image,
          totalVotes: v._sum.votesCount || 0,
          position: i + 1,
        }
      })
      .filter(Boolean)

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
    return response
  } catch (error) {
    console.error('Failed to fetch top contestants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
