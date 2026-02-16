import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/packages
 * Public endpoint — returns all active voting packages.
 */
export async function GET() {
  try {
    const packages = await prisma.votingPackage.findMany({
      where: { isActive: true },
      orderBy: { votes: 'asc' },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Failed to fetch packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
