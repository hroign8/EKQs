import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter('categories', 60, 60_000)

// Categories change very rarely — cache for 5 minutes.
export const revalidate = 300

/**
 * GET /api/categories
 * Public endpoint — returns all active voting categories.
 */
export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous'
    const check = await limiter.check(ip)
    if (!check.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const categories = await prisma.votingCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    const response = NextResponse.json(categories)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
