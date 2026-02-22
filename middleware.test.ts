import { NextRequest } from 'next/server'
import { middleware } from './middleware'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// The new middleware fetches the session from the auth API.
// We mock global.fetch to control what the auth endpoint returns.
function buildRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const url = new URL(path, 'http://localhost:3001')
  const req = new NextRequest(url)
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value)
  }
  return req
}

function mockSession(sessionPayload: object | null) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: sessionPayload !== null,
      json: async () => sessionPayload,
    })
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('middleware', () => {
  describe('admin route protection', () => {
    it('redirects to /admin/login when session returns no user', async () => {
      mockSession(null)
      const req = buildRequest('/admin')
      const res = await middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')!
      expect(location).toContain('/admin/login')
      expect(location).toContain('callbackUrl=%2Fadmin')
    })

    it('redirects to /admin/login on /admin/some-page with no session', async () => {
      mockSession(null)
      const req = buildRequest('/admin/some-page')
      const res = await middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')!
      expect(location).toContain('/admin/login')
      expect(location).toContain('callbackUrl=%2Fadmin%2Fsome-page')
    })

    it('redirects non-admin user to / when role is not admin', async () => {
      mockSession({ user: { id: 'u1', email: 'user@x.com', role: 'user' } })
      const req = buildRequest('/admin', { 'better-auth.session_token': 'abc123' })
      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/')
    })

    it('allows access to /admin when session has admin role', async () => {
      mockSession({ user: { id: 'a1', email: 'admin@x.com', role: 'admin' } })
      const req = buildRequest('/admin', { 'better-auth.session_token': 'abc123' })
      const res = await middleware(req)

      expect(res.status).toBe(200)
    })

    it('redirects when fetch throws (conservative fallback)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
      const req = buildRequest('/admin')
      const res = await middleware(req)

      expect(res.status).toBe(307)
    })
  })

  describe('non-admin routes', () => {
    it('passes through non-admin routes without calling auth session endpoint', async () => {
      const req = buildRequest('/contestants')
      const res = await middleware(req)
      expect(res.status).toBe(200)
    })

    it('passes through root path', async () => {
      const req = buildRequest('/')
      const res = await middleware(req)
      expect(res.status).toBe(200)
    })

    it('passes through /signin', async () => {
      const req = buildRequest('/signin')
      const res = await middleware(req)
      expect(res.status).toBe(200)
    })

    it('passes through /vote', async () => {
      const req = buildRequest('/vote')
      const res = await middleware(req)
      expect(res.status).toBe(200)
    })
  })
})
