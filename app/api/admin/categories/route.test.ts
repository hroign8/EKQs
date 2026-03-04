/**
 * Tests for /api/admin/categories — CRUD operations.
 *
 * Mocks Prisma + requireAdmin to test all four HTTP methods (GET/POST/PUT/DELETE).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    votingCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Default: admin is authenticated
vi.mock('@/lib/api-utils', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ session: { user: { id: 'admin1', role: 'admin' } }, error: null }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ error: msg }), { status, headers: { 'content-type': 'application/json' } }),
}))

import { GET, POST, PUT, DELETE } from './route'
import { prisma } from '@/lib/db'

const prismaMock = vi.mocked(prisma)

// ── Helpers ──────────────────────────────────────────────────────────────────
function jsonRequest(method: string, body?: unknown, params?: Record<string, string>) {
  const url = new URL('http://localhost:3001/api/admin/categories')
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Request(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

const sampleCategory = {
  id: '507f1f77bcf86cd799439011',
  slug: 'bestTalent',
  name: 'Best Talent',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('GET /api/admin/categories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns all categories', async () => {
    prismaMock.votingCategory.findMany.mockResolvedValue([sampleCategory])
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe('Best Talent')
  })

  it('returns 500 on database error', async () => {
    prismaMock.votingCategory.findMany.mockRejectedValue(new Error('DB'))
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/categories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a category with auto-generated slug', async () => {
    prismaMock.votingCategory.findUnique.mockResolvedValue(null)
    prismaMock.votingCategory.create.mockResolvedValue(sampleCategory)

    const res = await POST(jsonRequest('POST', { name: 'Best Talent' }))
    expect(res.status).toBe(201)
  })

  it('rejects duplicate slug', async () => {
    prismaMock.votingCategory.findUnique.mockResolvedValue(sampleCategory)

    const res = await POST(jsonRequest('POST', { name: 'Best Talent' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('already exists')
  })

  it('rejects empty name', async () => {
    const res = await POST(jsonRequest('POST', { name: '' }))
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/admin/categories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates category name', async () => {
    prismaMock.votingCategory.findUnique.mockResolvedValue(sampleCategory)
    prismaMock.votingCategory.update.mockResolvedValue({ ...sampleCategory, name: 'Updated' })

    const res = await PUT(jsonRequest('PUT', { id: sampleCategory.id, name: 'Updated' }))
    expect(res.status).toBe(200)
  })

  it('returns 400 when id is missing', async () => {
    const res = await PUT(jsonRequest('PUT', { name: 'No ID' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 for non-existent category', async () => {
    prismaMock.votingCategory.findUnique.mockResolvedValue(null)
    const res = await PUT(jsonRequest('PUT', { id: 'doesnotexist123456789012', name: 'Nope' }))
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/admin/categories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a category', async () => {
    prismaMock.votingCategory.findUnique.mockResolvedValue(sampleCategory)
    prismaMock.votingCategory.delete.mockResolvedValue(sampleCategory)

    const res = await DELETE(jsonRequest('DELETE', undefined, { id: sampleCategory.id }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('returns 400 when id is missing', async () => {
    const res = await DELETE(jsonRequest('DELETE'))
    expect(res.status).toBe(400)
  })

  it('returns 404 for non-existent category', async () => {
    prismaMock.votingCategory.findUnique.mockResolvedValue(null)
    const res = await DELETE(jsonRequest('DELETE', undefined, { id: 'doesnotexist123456789012' }))
    expect(res.status).toBe(404)
  })
})
