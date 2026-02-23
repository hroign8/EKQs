import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { manualVoteSchema } from '@/lib/validations'
import { getTransactionStatus } from '@/lib/pesapal'

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

/**
 * PATCH /api/admin/votes
 * Admin endpoint — re-checks PesaPal for all pending vote transactions
 * and verifies any that have been completed.
 */
export async function PATCH() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    // Find all unverified votes that have a PesaPal transaction ID
    const pendingVotes = await prisma.vote.findMany({
      where: { verified: false, transactionId: { not: null } },
      select: { id: true, transactionId: true },
    })

    // Also clean up orphaned votes (no transactionId) older than 1 hour
    // These are votes where the user never completed the payment redirect
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const orphanedResult = await prisma.vote.deleteMany({
      where: {
        verified: false,
        transactionId: null,
        createdAt: { lt: oneHourAgo },
      },
    })

    if (pendingVotes.length === 0) {
      const msg = orphanedResult.count > 0
        ? `Removed ${orphanedResult.count} abandoned vote(s) with no payment`
        : 'No pending votes to check'
      return NextResponse.json({
        verified: 0, checked: 0, removed: orphanedResult.count, message: msg,
      })
    }

    // Deduplicate by transactionId (multiple votes can share one transaction)
    const uniqueTransactionIds = Array.from(new Set(
      pendingVotes.map(v => v.transactionId).filter((t): t is string => !!t)
    ))

    let verifiedCount = 0
    let removedCount = 0
    const errors: string[] = []

    for (const orderTrackingId of uniqueTransactionIds) {
      try {
        const status = await getTransactionStatus(orderTrackingId)

        // Update the PesaPal transaction record
        await prisma.pesapalTransaction.updateMany({
          where: { orderTrackingId },
          data: {
            status: status.payment_status_description,
            statusCode: String(status.status_code),
            paymentMethod: status.payment_method || undefined,
            pesapalTransactionId: status.confirmation_code || undefined,
          },
        })

        // status_code 1 = completed
        if (status.status_code === 1) {
          const result = await prisma.vote.updateMany({
            where: { transactionId: orderTrackingId, verified: false },
            data: { verified: true },
          })
          verifiedCount += result.count
        }
        // status_code 2 = failed, 3 = reversed, 4 = cancelled/invalid
        // Remove vote records for failed/cancelled payments — they never counted
        else if (status.status_code >= 2) {
          const result = await prisma.vote.deleteMany({
            where: { transactionId: orderTrackingId, verified: false },
          })
          removedCount += result.count
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`Failed to check transaction ${orderTrackingId}:`, msg)
        errors.push(`${orderTrackingId}: ${msg}`)
      }
    }

    const totalRemoved = removedCount + orphanedResult.count
    const parts: string[] = []
    if (verifiedCount > 0) parts.push(`Verified ${verifiedCount} vote(s)`)
    if (totalRemoved > 0) parts.push(`Removed ${totalRemoved} failed/cancelled vote(s)`)
    if (parts.length === 0) parts.push(`Checked ${uniqueTransactionIds.length} transaction(s), no changes`)

    return NextResponse.json({
      checked: uniqueTransactionIds.length,
      verified: verifiedCount,
      removed: totalRemoved,
      errors: errors.length > 0 ? errors : undefined,
      message: parts.join('. '),
    })
  } catch (err) {
    console.error('Admin verify pending error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}