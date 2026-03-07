import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { manualVoteSchema, isValidObjectId } from '@/lib/validations'
import { getTransactionStatus } from '@/lib/pesapal'

// Prevent Next.js from caching admin data responses
export const dynamic = 'force-dynamic'

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
    if (contestantId) {
      if (!isValidObjectId(contestantId)) return NextResponse.json({ error: 'Invalid contestant ID' }, { status: 400 })
      where.contestantId = contestantId
    }
    if (categoryId) {
      if (!isValidObjectId(categoryId)) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
      where.categoryId = categoryId
    }
    if (verified !== null && verified !== undefined && verified !== '') {
      where.verified = verified === 'true'
    }

    // Run count + stats first (lightweight indexed queries), then paginated data
    const verifiedWhere = { ...where, verified: true }
    const pendingWhere = { ...where, verified: false }

    const [total, verifiedCount, pendingCount, verifiedAgg, pendingAgg] = await Promise.all([
      prisma.vote.count({ where }),
      prisma.vote.count({ where: verifiedWhere }),
      prisma.vote.count({ where: pendingWhere }),
      prisma.vote.aggregate({ where: verifiedWhere, _sum: { amountPaid: true, votesCount: true } }),
      prisma.vote.aggregate({ where: pendingWhere, _sum: { amountPaid: true, votesCount: true } }),
    ])

    const verifiedRevenue = verifiedAgg._sum.amountPaid ?? 0
    const pendingRevenue = pendingAgg._sum.amountPaid ?? 0
    const totalVotesCount = (verifiedAgg._sum.votesCount ?? 0) + (pendingAgg._sum.votesCount ?? 0)

    // Paginated vote list — fetch without include to avoid failures from orphaned relations
    const rawVotes = await prisma.vote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Batch-load related records so missing ones return null instead of crashing
    const contestantIds = [...new Set(rawVotes.map(v => v.contestantId))]
    const categoryIds = [...new Set(rawVotes.map(v => v.categoryId))]
    const userIds = [...new Set(rawVotes.map(v => v.userId))]
    const packageIds = [...new Set(rawVotes.map(v => v.packageId))]

    const [contestants, categories, users, packages] = await Promise.all([
      prisma.contestant.findMany({ where: { id: { in: contestantIds } }, select: { id: true, name: true } }),
      prisma.votingCategory.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } }),
      prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, name: true } }),
      prisma.votingPackage.findMany({ where: { id: { in: packageIds } }, select: { id: true, name: true } }),
    ])

    const contestantMap = new Map(contestants.map(c => [c.id, c.name]))
    const categoryMap = new Map(categories.map(c => [c.id, c.name]))
    const userMap = new Map(users.map(u => [u.id, u]))
    const packageMap = new Map(packages.map(p => [p.id, p.name]))

    return NextResponse.json({
      votes: rawVotes.map(v => {
        const user = userMap.get(v.userId)
        return {
          id: v.id,
          time: v.createdAt.toISOString(),
          voterEmail: user?.email ?? 'deleted',
          voterName: user?.name ?? null,
          contestant: contestantMap.get(v.contestantId) ?? 'Deleted',
          category: categoryMap.get(v.categoryId) ?? 'Deleted',
          packageName: packageMap.get(v.packageId) ?? 'Deleted',
          votesCount: v.votesCount,
          amountPaid: v.amountPaid,
          verified: v.verified,
          country: v.country ?? undefined,
        }
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        verifiedCount,
        pendingCount,
        verifiedRevenue,
        pendingRevenue,
        totalVotesCount,
      },
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

    // Validate contestant and category exist
    const [contestantExists, categoryExists] = await Promise.all([
      prisma.contestant.findUnique({ where: { id: contestantId }, select: { id: true, isActive: true } }),
      prisma.votingCategory.findUnique({ where: { id: categoryId }, select: { id: true, isActive: true } }),
    ])
    if (!contestantExists || !contestantExists.isActive) {
      return NextResponse.json({ error: 'Contestant not found or inactive' }, { status: 404 })
    }
    if (!categoryExists || !categoryExists.isActive) {
      return NextResponse.json({ error: 'Category not found or inactive' }, { status: 404 })
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
 *
 * Query params:
 *   ?txId=<orderTrackingId> — check a single transaction (diagnostic mode)
 */
export async function PATCH(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    // ── Single-transaction diagnostic mode ──
    const singleTxId = request.nextUrl.searchParams.get('txId')
    if (singleTxId) {
      if (!/^[a-zA-Z0-9-]+$/.test(singleTxId)) {
        return NextResponse.json({ error: 'Invalid transaction ID format' }, { status: 400 })
      }
      const status = await getTransactionStatus(singleTxId)
      const dbRecord = await prisma.pesapalTransaction.findUnique({
        where: { orderTrackingId: singleTxId },
      })
      return NextResponse.json({
        pesapalResponse: {
          status_code: status.status_code,
          payment_status_description: status.payment_status_description,
          payment_method: status.payment_method,
          amount: status.amount,
          currency: status.currency,
          confirmation_code: status.confirmation_code,
          payment_account: status.payment_account,
          created_date: status.created_date,
          message: status.message,
          error: status.error,
        },
        dbRecord: dbRecord ? {
          orderTrackingId: dbRecord.orderTrackingId,
          merchantReference: dbRecord.merchantReference,
          amount: dbRecord.amount,
          status: dbRecord.status,
          statusCode: dbRecord.statusCode,
          transactionType: dbRecord.transactionType,
          createdAt: dbRecord.createdAt,
        } : null,
      })
    }

    // ── Bulk reconciliation ──
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
    const statusBreakdown: Record<number, number> = {}
    const samplePending: { txId: string; description: string; amount: number; method: string }[] = []
    const startTime = Date.now()
    const TIME_BUDGET_MS = 50_000 // stop before 60s function timeout
    const BATCH_SIZE = 5

    for (let i = 0; i < uniqueTransactionIds.length; i += BATCH_SIZE) {
      if (Date.now() - startTime > TIME_BUDGET_MS) {
        errors.push(`Time limit reached — checked ${i} of ${uniqueTransactionIds.length} transactions`)
        break
      }

      const batch = uniqueTransactionIds.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(async (orderTrackingId) => {
          const status = await getTransactionStatus(orderTrackingId)

          console.log(`[Reconcile] ${orderTrackingId}: status_code=${status.status_code}, description=${status.payment_status_description}, amount=${status.amount}, method=${status.payment_method}, confirmation=${status.confirmation_code}`)

          // Track status code distribution
          statusBreakdown[status.status_code] = (statusBreakdown[status.status_code] || 0) + 1

          // Collect sample pending transactions for diagnostics (max 3)
          if (status.status_code === 0 && samplePending.length < 3) {
            samplePending.push({
              txId: orderTrackingId,
              description: status.payment_status_description || status.message || 'no description',
              amount: status.amount ?? 0,
              method: status.payment_method || 'unknown',
            })
          }

          await prisma.pesapalTransaction.updateMany({
            where: { orderTrackingId },
            data: {
              status: status.payment_status_description,
              statusCode: String(status.status_code),
              paymentMethod: status.payment_method || undefined,
              pesapalTransactionId: status.confirmation_code || undefined,
            },
          })

          if (status.status_code === 1) {
            const result = await prisma.vote.updateMany({
              where: { transactionId: orderTrackingId, verified: false },
              data: { verified: true },
            })
            return { verified: result.count, removed: 0, statusCode: 1 }
          } else if (status.status_code === 2 || status.status_code === 3) {
            // Only delete on explicit failure (2) or reversal (3) — NOT on
            // status 4 (cancelled/pending) which may still complete later.
            const result = await prisma.vote.deleteMany({
              where: { transactionId: orderTrackingId, verified: false },
            })
            return { verified: 0, removed: result.count, statusCode: status.status_code }
          }
          return { verified: 0, removed: 0, statusCode: status.status_code }
        })
      )

      for (let j = 0; j < results.length; j++) {
        const r = results[j]
        if (r.status === 'fulfilled') {
          verifiedCount += r.value.verified
          removedCount += r.value.removed
        } else {
          const msg = r.reason instanceof Error ? r.reason.message : String(r.reason)
          console.error(`Failed to check transaction ${batch[j]}:`, msg)
          errors.push(`${batch[j]}: ${msg}`)
        }
      }
    }

    const totalRemoved = removedCount + orphanedResult.count
    const stillPending = uniqueTransactionIds.length - verifiedCount - removedCount
    const parts: string[] = []
    if (verifiedCount > 0) parts.push(`Verified ${verifiedCount} vote(s)`)
    if (totalRemoved > 0) parts.push(`Removed ${totalRemoved} failed/cancelled vote(s)`)
    if (stillPending > 0) parts.push(`${stillPending} payment(s) still processing on PesaPal`)
    if (parts.length === 0) parts.push(`Checked ${uniqueTransactionIds.length} transaction(s), no changes`)

    return NextResponse.json({
      checked: uniqueTransactionIds.length,
      verified: verifiedCount,
      removed: totalRemoved,
      stillPending,
      statusBreakdown,
      samplePending: samplePending.length > 0 ? samplePending : undefined,
      errors: errors.length > 0 ? errors : undefined,
      message: parts.join('. '),
    })
  } catch (err) {
    console.error('Admin verify pending error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/votes
 * Admin endpoint — checks PesaPal for every pending vote transaction and
 * verifies only the ones where payment was actually completed (status_code 1).
 * Transactions still pending or failed are left unchanged / removed respectively.
 */
export async function PUT() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const pendingVotes = await prisma.vote.findMany({
      where: { verified: false, transactionId: { not: null } },
      select: { id: true, transactionId: true },
    })

    if (pendingVotes.length === 0) {
      return NextResponse.json({ verified: 0, failed: 0, stillPending: 0, message: 'No pending votes to check' })
    }

    const uniqueTxIds = Array.from(new Set(
      pendingVotes.map(v => v.transactionId).filter((t): t is string => !!t)
    ))

    let verifiedCount = 0
    let failedCount = 0
    let stillPendingCount = 0
    const errors: string[] = []
    const BATCH_SIZE = 5
    const startTime = Date.now()
    const TIME_BUDGET_MS = 50_000

    for (let i = 0; i < uniqueTxIds.length; i += BATCH_SIZE) {
      if (Date.now() - startTime > TIME_BUDGET_MS) {
        errors.push(`Time limit reached — checked ${i} of ${uniqueTxIds.length}`)
        break
      }

      const batch = uniqueTxIds.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(async (orderTrackingId) => {
          const status = await getTransactionStatus(orderTrackingId)

          console.log(`[ForceVerify] ${orderTrackingId}: status_code=${status.status_code}, desc=${status.payment_status_description}, amount=${status.amount}`)

          // Update pesapal transaction record
          await prisma.pesapalTransaction.updateMany({
            where: { orderTrackingId },
            data: {
              status: status.payment_status_description,
              statusCode: String(status.status_code),
              paymentMethod: status.payment_method || undefined,
              pesapalTransactionId: status.confirmation_code || undefined,
            },
          })

          if (status.status_code === 1) {
            // Payment completed — verify votes
            const result = await prisma.vote.updateMany({
              where: { transactionId: orderTrackingId, verified: false },
              data: { verified: true },
            })
            return { verified: result.count, failed: 0, pending: 0 }
          } else if (status.status_code === 2 || status.status_code === 3) {
            // Failed or reversed — remove unverified votes
            const result = await prisma.vote.deleteMany({
              where: { transactionId: orderTrackingId, verified: false },
            })
            return { verified: 0, failed: result.count, pending: 0 }
          }
          // Still pending (0 or 4)
          return { verified: 0, failed: 0, pending: 1 }
        })
      )

      for (let j = 0; j < results.length; j++) {
        const r = results[j]
        if (r.status === 'fulfilled') {
          verifiedCount += r.value.verified
          failedCount += r.value.failed
          stillPendingCount += r.value.pending
        } else {
          const msg = r.reason instanceof Error ? r.reason.message : String(r.reason)
          console.error(`[ForceVerify] Failed for ${batch[j]}:`, msg)
          errors.push(`${batch[j]}: ${msg}`)
        }
      }
    }

    const parts: string[] = []
    if (verifiedCount > 0) parts.push(`Verified ${verifiedCount} completed vote(s)`)
    if (failedCount > 0) parts.push(`Removed ${failedCount} failed vote(s)`)
    if (stillPendingCount > 0) parts.push(`${stillPendingCount} still awaiting payment`)
    if (parts.length === 0) parts.push(`Checked ${uniqueTxIds.length} transaction(s), no changes`)

    return NextResponse.json({
      checked: uniqueTxIds.length,
      verified: verifiedCount,
      failed: failedCount,
      stillPending: stillPendingCount,
      errors: errors.length > 0 ? errors : undefined,
      message: parts.join('. '),
    })
  } catch (err) {
    console.error('Admin force verify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}