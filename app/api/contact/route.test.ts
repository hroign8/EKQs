/**
 * Tests for POST /api/contact — contact form submission.
 *
 * Mocks Prisma + rate limiter + auth session to test validation, rate limiting,
 * and successful submission in isolation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    contactMessage: { create: vi.fn() },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => ({
    check: vi.fn().mockResolvedValue({ allowed: true, remaining: 4 }),
  }),
}))

vi.mock('@/lib/api-utils', () => ({
  getServerSession: vi.fn().mockResolvedValue(null),
}))

import { POST } from './route'
import { prisma } from '@/lib/db'

const prismaMock = vi.mocked(prisma)

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(body: unknown) {
  return new Request('http://localhost:3001/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Question about the event',
  message: 'I would like to know more about the voting process and how to participate.',
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('POST /api/contact', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 on valid submission', async () => {
    prismaMock.contactMessage.create.mockResolvedValue({ id: '1' })
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('calls prisma.contactMessage.create with correct data', async () => {
    prismaMock.contactMessage.create.mockResolvedValue({ id: '1' })
    await POST(makeRequest(validPayload))
    expect(prismaMock.contactMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Question about the event',
        userId: null,
      }),
    })
  })

  it('rejects missing name', async () => {
    const res = await POST(makeRequest({ ...validPayload, name: '' }))
    expect(res.status).toBe(400)
  })

  it('rejects invalid email', async () => {
    const res = await POST(makeRequest({ ...validPayload, email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('rejects message shorter than 10 characters', async () => {
    const res = await POST(makeRequest({ ...validPayload, message: 'short' }))
    expect(res.status).toBe(400)
  })

  it('allows subject to be omitted', async () => {
    prismaMock.contactMessage.create.mockResolvedValue({ id: '1' })
    const { subject: _, ...noSubject } = validPayload
    const res = await POST(makeRequest(noSubject))
    expect(res.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    prismaMock.contactMessage.create.mockRejectedValue(new Error('DB down'))
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(500)
  })
})
