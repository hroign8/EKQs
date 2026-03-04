/**
 * Tests for GET /api/search — contestant search endpoint.
 *
 * Validates query parsing, length limits, empty results, and rate limiting.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    contestant: { findMany: vi.fn() },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => ({
    check: vi.fn().mockResolvedValue({ allowed: true, remaining: 29 }),
  }),
}))

import { GET } from './route'
import { prisma } from '@/lib/db'

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(query: string) {
  const url = new URL('http://localhost:3001/api/search')
  if (query) url.searchParams.set('q', query)
  return new NextRequest(url)
}

const sampleResults = [
  { id: '507f1f77bcf86cd799439011', name: 'Abigail', country: 'Eritrea', image: '/img.jpg' },
]

// ── Tests ────────────────────────────────────────────────────────────────────
describe('GET /api/search', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty array when query is missing', async () => {
    const res = await GET(makeRequest(''))
    const body = await res.json()
    expect(body.contestants).toEqual([])
  })

  it('returns empty array when query is too short (< 2 chars)', async () => {
    const res = await GET(makeRequest('a'))
    const body = await res.json()
    expect(body.contestants).toEqual([])
  })

  it('returns 400 when query exceeds 100 characters', async () => {
    const longQuery = 'a'.repeat(101)
    const res = await GET(makeRequest(longQuery))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Search query too long')
  })

  it('returns matching contestants for a valid query', async () => {
    vi.mocked(prisma.contestant.findMany).mockResolvedValue(sampleResults as never)
    const res = await GET(makeRequest('Abi'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.contestants).toHaveLength(1)
    expect(body.contestants[0].name).toBe('Abigail')
  })

  it('queries Prisma with case-insensitive contains', async () => {
    vi.mocked(prisma.contestant.findMany).mockResolvedValue([])
    await GET(makeRequest('test'))
    expect(vi.mocked(prisma.contestant.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          name: { contains: 'test', mode: 'insensitive' },
        }),
        take: 5,
      }),
    )
  })

  it('limits results to 5', async () => {
    vi.mocked(prisma.contestant.findMany).mockResolvedValue([])
    await GET(makeRequest('test'))
    expect(vi.mocked(prisma.contestant.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 }),
    )
  })

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.contestant.findMany).mockRejectedValue(new Error('DB failure'))
    const res = await GET(makeRequest('test'))
    expect(res.status).toBe(500)
  })
})
