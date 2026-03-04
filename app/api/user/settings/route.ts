import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { z } from 'zod/v4'

const VALID_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'UGX', 'KES', 'ETB', 'ERN', 'NGN', 'GHS',
  'ZAR', 'EGP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'KRW',
  'SGD', 'HKD', 'SEK', 'NOK', 'DKK', 'NZD', 'MXN', 'BRL', 'AED',
  'SAR', 'RUB', 'TRY', 'PLN', 'THB', 'MYR', 'PHP', 'IDR', 'VND',
]

const updateSettingsSchema = z.object({
  preferredCurrency: z.enum(VALID_CURRENCIES as [string, ...string[]]).nullable(),
})

/** GET /api/user/settings — returns the current user's settings.
 * Returns { preferredCurrency: null } for unauthenticated users so the
 * useCurrency() hook (called on all public pages) doesn't generate 401 noise.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      // Return empty settings rather than 401 — this endpoint is called by the
      // useCurrency hook on all pages, including public ones.
      return NextResponse.json({ preferredCurrency: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredCurrency: true },
    })

    return NextResponse.json({ preferredCurrency: user?.preferredCurrency ?? null })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

/** PUT /api/user/settings — updates the current user's settings */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredCurrency: parsed.data.preferredCurrency },
    })

    return NextResponse.json({ success: true, preferredCurrency: parsed.data.preferredCurrency })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
