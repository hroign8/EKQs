import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/contestants
 * Public endpoint — returns paginated active contestants with aggregated vote counts.
 * Query params: page (default 1), limit (default 50, max 100)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
  const skip = (page - 1) * limit

  try {
    const [contestants, total] = await Promise.all([
      prisma.contestant.findMany({
        where: { isActive: true },
        orderBy: { rank: 'asc' },
        skip,
        take: limit,
      }),
      prisma.contestant.count({ where: { isActive: true } }),
    ])

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

    return NextResponse.json({
      contestants: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch contestants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
