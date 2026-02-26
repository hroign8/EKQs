import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for route protection and per-request Content Security Policy.
 *
 * A cryptographic nonce is generated on every request and embedded in the
 * CSP `script-src` directive. Next.js reads the `x-nonce` request header and
 * automatically stamps its inline bootstrap / hydration scripts with the same
 * nonce, so they are allowed to execute without needing `'unsafe-inline'`.
 *
 * Admin routes are guarded by calling the internal Better Auth session
 * endpoint, which cryptographically validates the session token and returns
 * the user's role. A mere cookie-existence check would allow forged cookies.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── CSRF / Origin check for state-changing API requests ────────────────────
  // Reject POST/PUT/PATCH/DELETE API calls whose Origin doesn't match the app.
  const method = request.method.toUpperCase()
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/pesapal/') &&   // PesaPal IPN comes from their servers
    !pathname.startsWith('/api/auth/') &&       // better-auth handles its own CSRF
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  ) {
    const origin = request.headers.get('origin')
    if (origin) {
      const allowed = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : null,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      ].filter(Boolean) as string[]

      // In development, also allow localhost origins
      const isLocalhost = origin.startsWith('http://localhost')
      if (!isLocalhost && allowed.length > 0 && !allowed.includes(origin)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  // ── Content Security Policy ────────────────────────────────────────────────
  // Generate a fresh base64 nonce for every request.
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const csp = [
    "default-src 'self'",
    // 'nonce-…' allows Next.js inline bootstrap scripts; 'strict-dynamic'
    // lets scripts loaded by those trusted scripts (Next.js chunks) run too.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com",
    `connect-src 'self' https://ek-qs.vercel.app ${appUrl} https://accounts.google.com https://api.exchangerate-api.com https://*.pesapal.com`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]
    .map((d) => d.trim())
    .join('; ')

  // Forward the nonce to the app so Next.js can stamp it on its <script> tags.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // ── Admin route protection ─────────────────────────────────────────────────
  // Skip the guard for the login page itself — it is the unauthenticated entry point.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Validate the session token via the auth API (no Prisma import needed in middleware)
    try {
      const sessionRes = await fetch(
        new URL('/api/auth/get-session', request.url).toString(),
        {
          headers: { cookie: request.headers.get('cookie') ?? '' },
          cache: 'no-store',
        }
      )
      const session = sessionRes.ok ? await sessionRes.json() : null

      if (!session?.user) {
        const signInUrl = new URL('/admin/login', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }

      // Only allow users with the admin role
      if (session.user.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      // If the session check itself fails, redirect to login conservatively
      const signInUrl = new URL('/admin/login', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Pass the mutated request headers (with x-nonce) into the response so
  // server components can read them via `headers()`.
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Attach CSP and the other security headers on every response.
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - API routes (handled by their own auth)
     * - Static files
     * - Next.js internals
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
