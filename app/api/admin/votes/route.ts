import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { manualVoteSchema } from '@/lib/validations'

/**
 * GET /api/admin/votes
 * Admin endpoint — returns the vote log with pagination and filtering.
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const contestantId = searchParams.get('contestantId')
    const categoryId = searchParams.get('categoryId')
    const verified = searchParams.get('verified')

    const where: Record<string, unknown> = {}
    if (contestantId) where.contestantId = contestantId
    if (categoryId) where.categoryId = categoryId
    if (verified !== null && verified !== undefined && verified !== '') {
      where.verified = verified === 'true'
    }

    const [votes, total] = await Promise.all([
      prisma.vote.findMany({
        where,
        include: {
          contestant: { select: { name: true } },
          category: { select: { name: true } },
          user: { select: { email: true, name: true } },
          package: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vote.count({ where }),
    ])

    return NextResponse.json({
      votes: votes.map((v: { id: string; createdAt: Date; user: { email: string; name: string | null }; contestant: { name: string }; category: { name: string }; package: { name: string }; votesCount: number; amountPaid: number; verified: boolean }) => ({
        id: v.id,
        time: v.createdAt.toISOString(),
        voterEmail: v.user.email,
        voterName: v.user.name,
        contestant: v.contestant.name,
        category: v.category.name,
        packageName: v.package.name,
        votesCount: v.votesCount,
        amountPaid: v.amountPaid,
        verified: v.verified,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Admin votes fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/votes
 * Admin endpoint — manually record a vote on behalf of a voter.
 */
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = manualVoteSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { voterEmail, contestantId, categoryId, packageId } = result.data

  try {
    // Resolve the user by email (or create a stub if absent)
    let user = await prisma.user.findUnique({ where: { email: voterEmail } })
    if (!user) {
      return NextResponse.json({ error: 'No account found for that email address' }, { status: 404 })
    }

    // Fetch the package for vote count and price
    const pkg = await prisma.votingPackage.findUnique({ where: { id: packageId } })
    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ error: 'Package not found or inactive' }, { status: 404 })
    }

    const vote = await prisma.vote.create({
      data: {
        userId: user.id,
        contestantId,
        categoryId,
        packageId,
        votesCount: pkg.votes,
        amountPaid: pkg.price,
        verified: true, // admin-entered votes are trusted
      },
    })

    return NextResponse.json({ success: true, voteId: vote.id }, { status: 201 })
  } catch (err) {
    console.error('Admin manual vote error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}