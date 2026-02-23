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
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'localhost'

  const results: Record<string, unknown> = {
    config: {
      PESAPAL_API_URL: apiUrl,
      PESAPAL_IPN_URL: ipnUrl,
      resolvedPublicBase: publicBase,
      hasConsumerKey: hasKey,
      hasConsumerSecret: hasSecret,
    },
  }

  // Step 1: test auth token
  try {
    const token = await getPesapalToken()
    results.authToken = { success: true, tokenPreview: token.slice(0, 20) + '...' }
  } catch (err) {
    // Also fetch raw response to expose the full PesaPal error body
    try {
      const apiUrl = process.env.PESAPAL_API_URL || 'https://cybqa.pesapal.com/pesapalv3'
      const rawRes = await fetch(`${apiUrl}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          consumer_key: process.env.PESAPAL_CONSUMER_KEY,
          consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
        }),
      })
      const rawBody = await rawRes.json()
      results.authToken = { success: false, error: String(err), httpStatus: rawRes.status, rawBody }
    } catch (fetchErr) {
      results.authToken = { success: false, error: String(err), fetchError: String(fetchErr) }
    }
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
