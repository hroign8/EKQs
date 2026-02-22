import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for route protection.
 *
 * Admin routes are guarded by calling the internal Better Auth session
 * endpoint, which cryptographically validates the session token and returns
 * the user's role. A mere cookie-existence check would allow forged cookies.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip the guard for the login page itself — it is the unauthenticated entry point
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
