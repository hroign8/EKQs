import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-utils'
import { getPesapalToken, registerIPN } from '@/lib/pesapal'

/**
 * GET /api/admin/pesapal-test
 * Admin-only diagnostic endpoint to test PesaPal connectivity.
 * Remove or protect this endpoint after debugging.
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const apiUrl = process.env.PESAPAL_API_URL || '(not set)'
  const hasKey = !!process.env.PESAPAL_CONSUMER_KEY
  const hasSecret = !!process.env.PESAPAL_CONSUMER_SECRET
  const ipnUrl = process.env.PESAPAL_IPN_URL || '(not set)'
  const publicBase =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3001'

  const results: Record<string, unknown> = {
    config: {
      hasApiUrl: !!process.env.PESAPAL_API_URL,
      hasIpnUrl: !!process.env.PESAPAL_IPN_URL,
      hasConsumerKey: hasKey,
      hasConsumerSecret: hasSecret,
    },
  }

  // Step 1: test auth token
  try {
    await getPesapalToken()
    results.authToken = { success: true }
  } catch (err) {
    results.authToken = { success: false, error: 'Authentication failed — check consumer key/secret.' }
    return NextResponse.json(results)
  }

  // Step 2: test IPN registration
  const resolvedIpn = ipnUrl.startsWith('http://localhost')
    ? `${publicBase}/api/pesapal/ipn`
    : ipnUrl !== '(not set)' ? ipnUrl : `${publicBase}/api/pesapal/ipn`

  try {
    const ipnId = await registerIPN(resolvedIpn)
    results.ipnRegistration = { success: true, ipnId, ipnUrl: resolvedIpn }
  } catch (err) {
    results.ipnRegistration = { success: false, error: String(err), ipnUrl: resolvedIpn }
  }

  return NextResponse.json(results)
}
