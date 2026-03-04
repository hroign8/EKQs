import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter('packages', 60, 60_000)

/**
 * GET /api/packages
 * Public endpoint — returns all active voting packages.
 */
export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous'
    const check = await limiter.check(ip)
    if (!check.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

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
