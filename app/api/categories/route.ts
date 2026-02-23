import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Categories change very rarely — cache for 5 minutes.
export const revalidate = 300

/**
 * GET /api/categories
 * Public endpoint — returns all active voting categories.
 */
export async function GET() {
  try {
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
