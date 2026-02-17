import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for route protection.
 *
 * Better Auth handles session validation server-side via its own API.
 * This middleware guards admin routes by checking cookies exist
 * (a lightweight check — full auth is validated in the API routes).
 */
export function middleware(request: NextRequest) {
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

  return NextResponse.next()
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
