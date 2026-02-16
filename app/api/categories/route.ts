import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
