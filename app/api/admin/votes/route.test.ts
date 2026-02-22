import { POST } from '@/app/api/admin/votes/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    votingPackage: { findUnique: vi.fn() },
    vote: { create: vi.fn() },
    contestant: { findMany: vi.fn() },
    vote_findMany: vi.fn(),
    vote_count: vi.fn(),
  },
}))

vi.mock('@/lib/api-utils', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ session: { user: { id: 'admin-1', role: 'admin' } }, error: null }),
  errorResponse: vi.fn((msg: string, status = 400) => new Response(JSON.stringify({ error: msg }), { status })),
  successResponse: vi.fn((data: unknown, status = 200) => new Response(JSON.stringify(data), { status })),
}))

import { prisma } from '@/lib/db'

const mockUser = { id: 'user-1', email: 'voter@example.com', name: 'Voter' }
const mockPackage = { id: 'pkg-1', name: 'Gold', votes: 5, price: 10, isActive: true }
const mockVote = { id: 'vote-1', userId: 'user-1', contestantId: 'c-1', categoryId: 'cat-1', packageId: 'pkg-1', votesCount: 5, amountPaid: 10, verified: true }

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3001/api/admin/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/votes', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(prisma.votingPackage.findUnique).mockResolvedValue(mockPackage as never)
    vi.mocked(prisma.vote.create).mockResolvedValue(mockVote as never)
  })

  afterEach(() => vi.clearAllMocks())

  it('creates a vote with valid input', async () => {
    const res = await POST(postRequest({
      voterEmail: 'voter@example.com',
      contestantId: 'c-1',
      categoryId: 'cat-1',
      packageId: 'pkg-1',
    }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.voteId).toBe('vote-1')
  })

  it('returns 400 if voterEmail is missing', async () => {
    const res = await POST(postRequest({
      contestantId: 'c-1',
      categoryId: 'cat-1',
      packageId: 'pkg-1',
    }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 400 if voterEmail is invalid', async () => {
    const res = await POST(postRequest({
      voterEmail: 'not-an-email',
      contestantId: 'c-1',
      categoryId: 'cat-1',
      packageId: 'pkg-1',
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 if contestantId is missing', async () => {
    const res = await POST(postRequest({
      voterEmail: 'voter@example.com',
      categoryId: 'cat-1',
      packageId: 'pkg-1',
    }))
    expect(res.status).toBe(400)
  })

  it('returns 404 if user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const res = await POST(postRequest({
      voterEmail: 'voter@example.com',
      contestantId: 'c-1',
      categoryId: 'cat-1',
      packageId: 'pkg-1',
    }))
    expect(res.status).toBe(404)
  })

  it('returns 404 if package not found', async () => {
    vi.mocked(prisma.votingPackage.findUnique).mockResolvedValue(null)
    const res = await POST(postRequest({
      voterEmail: 'voter@example.com',
      contestantId: 'c-1',
      categoryId: 'cat-1',
      packageId: 'pkg-1',
    }))
    expect(res.status).toBe(404)
  })

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.vote.create).mockRejectedValue(new Error('DB failure'))
    const res = await POST(postRequest({
      voterEmail: 'voter@example.com',
      contestantId: 'c-1',
      categoryId: 'cat-1',
      packageId: 'pkg-1',
    }))
    expect(res.status).toBe(500)
  })
})
