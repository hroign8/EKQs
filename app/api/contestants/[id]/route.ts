import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isValidObjectId } from '@/lib/validations'
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter('contestant-detail', 60, 60_000)

/**
 * GET /api/contestants/[id]
 * Public endpoint — returns a single contestant with vote counts.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous'
    const check = await limiter.check(ip)
    if (!check.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { id } = await params

    // Validate ObjectId format to prevent malformed query errors
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid contestant ID' }, { status: 400 })
    }

    const contestant = await prisma.contestant.findUnique({
      where: { id },
    })

    if (!contestant || !contestant.isActive) {
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 })
    }

    const voteCounts = await prisma.vote.groupBy({
      by: ['categoryId'],
      _sum: { votesCount: true },
      where: { contestantId: id, verified: true },
    })

    const categories = await prisma.votingCategory.findMany({
      where: { isActive: true },
    })

    const votes: Record<string, number> = {}
    for (const cat of categories) {
      const found = voteCounts.find((vc: { categoryId: string }) => vc.categoryId === cat.id)
      votes[cat.slug] = found?._sum.votesCount || 0
    }

    return NextResponse.json({
      id: contestant.id,
      name: contestant.name,
      country: contestant.country,
      gender: contestant.gender,
      image: contestant.image,
      description: contestant.description,
      rank: contestant.rank,
      votes,
    })
  } catch (error) {
    console.error('Failed to fetch contestant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
