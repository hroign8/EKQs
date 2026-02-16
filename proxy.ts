import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for route protection.
 *
 * Better Auth handles session validation server-side via its own API.
 * This middleware guards admin routes by checking cookies exist
 * (a lightweight check — full auth is validated in the API routes).
 *
 * Additional CSP and security headers are applied to all routes.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin route protection — check for session cookie
  if (pathname.startsWith('/admin')) {
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token')

    if (!sessionCookie) {
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://images.unsplash.com https://*.googleusercontent.com",
      "connect-src 'self' https://api.exchangerate-api.com https://*.pesapal.com",
      "frame-ancestors 'none'",
    ].join('; ')
  )

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
