import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/event
 * Public endpoint — returns the active event data.
 */
export async function GET() {
  try {
    const event = await prisma.event.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!event) {
      return NextResponse.json({ error: 'No active event found' }, { status: 404 })
    }

    // Get aggregate stats
    const [totalVotesResult, uniqueVoterCount] = await Promise.all([
      prisma.vote.aggregate({
        _sum: { votesCount: true },
        where: { verified: true },
      }),
      prisma.vote.groupBy({
        by: ['userId'],
        where: { verified: true },
      }).then(groups => groups.length),
    ])

    return NextResponse.json({
      id: event.id,
      name: event.name,
      tagline: event.tagline,
      startDate: event.startDate,
      endDate: event.endDate,
      votingStart: event.votingStart,
      votingEnd: event.votingEnd,
      isActive: event.isActive,
      totalVotes: totalVotesResult._sum.votesCount || 0,
      uniqueVoters: uniqueVoterCount,
      votePrice: event.votePrice,
    })
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
