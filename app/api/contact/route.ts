import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contactFormSchema } from '@/lib/validations'
import { getServerSession } from '@/lib/api-utils'
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter('contact', 5, 60_000) // 5 per minute

/**
 * POST /api/contact
 * Public endpoint — submits a contact message.
 * Optionally links to authenticated user.
 */
export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const check = limiter.check(ip)
    if (!check.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    const body = await request.json()
    const parsed = contactFormSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = parsed.data

    // Optionally link to authenticated user
    const session = await getServerSession()
    const userId = session?.user?.id || null

    await prisma.contactMessage.create({
      data: {
        userId,
        name,
        email,
        subject,
        message,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to submit contact message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
