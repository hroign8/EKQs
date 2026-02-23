import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, errorResponse } from '@/lib/api-utils'
import { submitVoteSchema } from '@/lib/validations'
import { submitOrder, registerIPN } from '@/lib/pesapal'
import { randomUUID } from 'crypto'
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter('votes', 20, 60_000) // 20 per minute

/**
 * POST /api/votes
 * Authenticated endpoint — initiates a vote purchase.
 * Creates a pending vote record and returns a PesaPal payment URL.
 */
export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    // Rate limit by user ID
    const check = limiter.check(session!.user.id)
    if (!check.allowed) {
      return errorResponse('Too many vote attempts. Please wait a moment.')
    }

    const body = await request.json()
    const parsed = submitVoteSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const { contestantId, categoryId, packageId } = parsed.data

    // Validate references exist
    const [contestant, category, pkg] = await Promise.all([
      prisma.contestant.findUnique({ where: { id: contestantId } }),
      prisma.votingCategory.findUnique({ where: { id: categoryId } }),
      prisma.votingPackage.findUnique({ where: { id: packageId } }),
    ])

    if (!contestant || !contestant.isActive) {
      return errorResponse('Contestant not found')
    }
    if (!category || !category.isActive) {
      return errorResponse('Category not found')
    }
    if (!pkg || !pkg.isActive) {
      return errorResponse('Package not found')
    }

    // Find the most recent event — isActive is not a reliable gate because
    // the old toggle logic could have set it to false. votingOpen is the sole gate.
    const event = await prisma.event.findFirst({ orderBy: { createdAt: 'desc' } })
    // votingOpen defaults to true for documents created before the field was added
    if (!event || event.votingOpen === false) {
      return errorResponse('Voting is currently closed')
    }

    const merchantReference = `VOTE-${randomUUID().slice(0, 8).toUpperCase()}`

    // Resolve the public base URL (identical logic to lib/auth.ts)
    const publicBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : null) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3001'

    const callbackUrl = `${publicBase}/api/pesapal/callback`
    const ipnUrl = process.env.PESAPAL_IPN_URL?.startsWith('http://localhost')
      ? `${publicBase}/api/pesapal/ipn`
      : process.env.PESAPAL_IPN_URL || `${publicBase}/api/pesapal/ipn`
    let ipnId: string

    try {
      ipnId = await registerIPN(ipnUrl)
    } catch (pesapalErr) {
      const errMsg = pesapalErr instanceof Error ? pesapalErr.message : String(pesapalErr)
      console.error('PesaPal IPN registration failed:', errMsg)
      console.error('  publicBase:', publicBase, '| ipnUrl:', ipnUrl)
      console.error('  PESAPAL_API_URL:', process.env.PESAPAL_API_URL || '(not set — using sandbox fallback)')
      console.error('  PESAPAL_CONSUMER_KEY set:', !!process.env.PESAPAL_CONSUMER_KEY)
      // If PesaPal is not configured, create a free vote for $0 packages or return error
      if (pkg.price === 0) {
        const vote = await prisma.vote.create({
          data: {
            contestantId,
            categoryId,
            userId: session!.user.id,
            packageId,
            votesCount: pkg.votes,
            amountPaid: 0,
            verified: true,
          },
        })
        return NextResponse.json({ success: true, voteId: vote.id, free: true })
      }
      return errorResponse(
        `Payment provider error: ${errMsg.includes('auth') ? 'authentication failed' : 'connection failed'}. ` +
        `Please contact support if this persists.`,
        503
      )
    }

    // Submit order to PesaPal
    const order = await submitOrder({
      merchantReference,
      amount: pkg.price,
      description: `${pkg.votes} vote(s) for ${contestant.name} - ${category.name}`,
      callbackUrl,
      ipnId,
      email: session!.user.email,
      firstName: session!.user.name?.split(' ')[0],
      lastName: session!.user.name?.split(' ').slice(1).join(' '),
    })

    // Create transaction and pending vote atomically so partial writes never occur
    await prisma.$transaction([
      prisma.pesapalTransaction.create({
        data: {
          orderTrackingId: order.order_tracking_id,
          merchantReference,
          transactionType: 'vote',
          amount: pkg.price,
          description: `${pkg.votes} vote(s) for ${contestant.name}`,
        },
      }),
      prisma.vote.create({
        data: {
          contestantId,
          categoryId,
          userId: session!.user.id,
          packageId,
          votesCount: pkg.votes,
          amountPaid: pkg.price,
          transactionId: order.order_tracking_id,
          verified: false,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      redirectUrl: order.redirect_url,
      orderTrackingId: order.order_tracking_id,
    })
  } catch (error) {
    console.error('Failed to submit vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/votes
 * Public endpoint — returns aggregated vote counts per contestant per category.
 */
export async function GET() {
  try {
    const voteCounts = await prisma.vote.groupBy({
      by: ['contestantId', 'categoryId'],
      _sum: { votesCount: true },
      where: { verified: true },
    })

    const categories = await prisma.votingCategory.findMany({
      where: { isActive: true },
    })

    const categoryMap = new Map<string, string>(categories.map((c: { id: string; slug: string }) => [c.id, c.slug] as [string, string]))

    // Transform to { contestantId: { categorySlug: count } }
    const result: Record<string, Record<string, number>> = {}

    for (const vc of voteCounts) {
      const slug = categoryMap.get(vc.categoryId)
      if (!slug) continue
      if (!result[vc.contestantId]) {
        result[vc.contestantId] = {}
      }
      result[vc.contestantId][slug] = vc._sum.votesCount || 0
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch votes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
