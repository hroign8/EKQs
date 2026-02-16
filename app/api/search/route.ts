import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/search?q=query
 * Search contestants by name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ contestants: [] })
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
