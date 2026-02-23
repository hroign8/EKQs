import { NextRequest } from 'next/server'
import { proxy } from './proxy'
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
      const res = await proxy(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')!
      expect(location).toContain('/admin/login')
      expect(location).toContain('callbackUrl=%2Fadmin')
    })

    it('redirects to /admin/login on /admin/some-page with no session', async () => {
      mockSession(null)
      const req = buildRequest('/admin/some-page')
      const res = await proxy(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')!
      expect(location).toContain('/admin/login')
      expect(location).toContain('callbackUrl=%2Fadmin%2Fsome-page')
    })

    it('redirects non-admin user to / when role is not admin', async () => {
      mockSession({ user: { id: 'u1', email: 'user@x.com', role: 'user' } })
      const req = buildRequest('/admin', { 'better-auth.session_token': 'abc123' })
      const res = await proxy(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/')
    })

    it('allows access to /admin when session has admin role', async () => {
      mockSession({ user: { id: 'a1', email: 'admin@x.com', role: 'admin' } })
      const req = buildRequest('/admin', { 'better-auth.session_token': 'abc123' })
      const res = await proxy(req)

      expect(res.status).toBe(200)
    })

    it('redirects when fetch throws (conservative fallback)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
      const req = buildRequest('/admin')
      const res = await proxy(req)

      expect(res.status).toBe(307)
    })
  })

  describe('non-admin routes', () => {
    it('passes through non-admin routes without calling auth session endpoint', async () => {
      const req = buildRequest('/contestants')
      const res = await proxy(req)
      expect(res.status).toBe(200)
    })

    it('passes through root path', async () => {
      const req = buildRequest('/')
      const res = await proxy(req)
      expect(res.status).toBe(200)
    })

    it('passes through /signin', async () => {
      const req = buildRequest('/signin')
      const res = await proxy(req)
      expect(res.status).toBe(200)
    })

    it('passes through /vote', async () => {
      const req = buildRequest('/vote')
      const res = await proxy(req)
      expect(res.status).toBe(200)
    })
  })

  describe('Content Security Policy nonce', () => {
    it('sets a Content-Security-Policy header on every non-redirect response', async () => {
      const req = buildRequest('/contestants')
      const res = await proxy(req)

      const csp = res.headers.get('content-security-policy')
      expect(csp).toBeTruthy()
    })

    it('embeds a nonce in script-src with strict-dynamic', async () => {
      const req = buildRequest('/')
      const res = await proxy(req)

      const csp = res.headers.get('content-security-policy') ?? ''
      expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/)
    })

    it('generates a unique nonce on each request', async () => {
      const res1 = await proxy(buildRequest('/'))
      const res2 = await proxy(buildRequest('/'))

      const nonce1 = res1.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]
      const nonce2 = res2.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]

      expect(nonce1).toBeTruthy()
      expect(nonce2).toBeTruthy()
      expect(nonce1).not.toBe(nonce2)
    })

    it('sets additional security headers on non-redirect responses', async () => {
      const req = buildRequest('/vote')
      const res = await proxy(req)

      expect(res.headers.get('x-content-type-options')).toBe('nosniff')
      expect(res.headers.get('x-frame-options')).toBe('DENY')
      expect(res.headers.get('strict-transport-security')).toMatch(/max-age=/)
    })
  })
})
