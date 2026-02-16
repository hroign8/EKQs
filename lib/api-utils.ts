import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Get the current authenticated session from request headers.
 * Returns null if not authenticated.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

/**
 * Require authentication. Returns a 401 response if not authenticated.
 */
export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, error: null }
}

/**
 * Require admin role. Returns a 403 response if not admin.
 */
export async function requireAdmin() {
  const { session, error } = await requireAuth()
  if (error) return { session: null, error }
  if (session!.user.role !== 'admin') {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session, error: null }
}

/**
 * Standard error response helper.
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Standard success response helper.
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}
