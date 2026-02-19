import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/contestants
 * Public endpoint — returns all active contestants with aggregated vote counts.
 */
export async function GET() {
  try {
    const contestants = await prisma.contestant.findMany({
      where: { isActive: true },
      orderBy: { rank: 'asc' },
    })

    // Aggregate votes per contestant per category
    const voteCounts = await prisma.vote.groupBy({
      by: ['contestantId', 'categoryId'],
      _sum: { votesCount: true },
      where: { verified: true },
    })

    const categories = await prisma.votingCategory.findMany({
      where: { isActive: true },
    })

    // Build a lookup: contestantId -> { categorySlug: totalVotes }
    const categoryMap = new Map<string, string>(categories.map((c: { id: string; slug: string }) => [c.id, c.slug] as [string, string]))
    const voteMap = new Map<string, Record<string, number>>()

    for (const vc of voteCounts) {
      const slug = categoryMap.get(vc.categoryId)
      if (!slug) continue
      if (!voteMap.has(vc.contestantId)) {
        voteMap.set(vc.contestantId, {})
      }
      voteMap.get(vc.contestantId)![slug] = vc._sum.votesCount || 0
    }

    // Build default vote structure from categories
    const defaultVotes: Record<string, number> = {}
    for (const cat of categories) {
      defaultVotes[cat.slug] = 0
    }

    const result = contestants.map((c: { id: string; name: string; country: string; gender: string; image: string; description: string; rank: number | null }) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      gender: c.gender,
      image: c.image,
      description: c.description,
      rank: c.rank,
      votes: { ...defaultVotes, ...(voteMap.get(c.id) || {}) },
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch contestants:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 })
  }
}
