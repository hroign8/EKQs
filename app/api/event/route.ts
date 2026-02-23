import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic so Vercel never statically caches a 404 from build time.
export const dynamic = 'force-dynamic'

/**
 * GET /api/event
 * Public endpoint — returns the active event data.
 */
export async function GET() {
  try {
    // Find the most recent event regardless of isActive — the old toggle
    // logic could have set isActive:false, so we can't filter by it here.
    const event = await prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!event) {
      return NextResponse.json({ error: 'No active event found' }, { status: 404 })
    }

    // Run both aggregations in parallel.
    // uniqueVoters: use a MongoDB aggregation pipeline so we count distinct
    // userIds server-side instead of pulling all groups into JS memory.
    const [totalVotesResult, uniqueVoterDoc] = await Promise.all([
      prisma.vote.aggregate({
        _sum: { votesCount: true },
        where: { verified: true },
      }),
      prisma.$runCommandRaw({
        aggregate: 'vote',
        pipeline: [
          { $match: { verified: true } },
          { $group: { _id: '$userId' } },
          { $count: 'count' },
        ],
        cursor: {},
      }) as Promise<{ cursor: { firstBatch: Array<{ count: number }> } }>,
    ])

    const uniqueVoterCount = uniqueVoterDoc?.cursor?.firstBatch?.[0]?.count ?? 0

    const response = NextResponse.json({
      id: event.id,
      name: event.name,
      tagline: event.tagline,
      startDate: event.startDate,
      endDate: event.endDate,
      votingStart: event.votingStart,
      votingEnd: event.votingEnd,
      isActive: event.isActive,
      votingOpen: event.votingOpen,
      totalVotes: totalVotesResult._sum.votesCount || 0,
      uniqueVoters: uniqueVoterCount,
      votePrice: event.votePrice,
    })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
