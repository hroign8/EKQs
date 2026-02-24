import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter('subscribe', 5, 60_000) // 5 per minute

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

/**
 * POST /api/subscribe
 * Public endpoint — subscribes an email for event updates.
 */
export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'anonymous'
    const check = await limiter.check(ip)
    if (!check.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    const body = await request.json()
    const parsed = subscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      )
    }

    await prisma.subscriber.create({
      data: { email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to subscribe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
