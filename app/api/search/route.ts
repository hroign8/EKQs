import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter('search', 30, 60_000) // 30 per minute

/**
 * GET /api/search?q=query
 * Search contestants by name
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'anonymous'
    const check = await limiter.check(ip)
    if (!check.allowed) {
      return NextResponse.json({ contestants: [], error: 'Too many requests' }, { status: 429 })
    }
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ contestants: [] })
    }

    // Prevent DoS via excessively long search queries
    if (query.length > 100) {
      return NextResponse.json({ contestants: [], error: 'Search query too long' }, { status: 400 })
    }

    const contestants = await prisma.contestant.findMany({
      where: {
        isActive: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        country: true,
        image: true,
      },
      take: 5,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ contestants })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
