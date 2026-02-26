import { GET } from '@/app/api/contestants/route'
import { NextRequest } from 'next/server'

// Valid MongoDB ObjectIds for testing
const TEST_IDS = {
  contestant1: '507f1f77bcf86cd799439011',
  contestant2: '507f1f77bcf86cd799439012',
}

vi.mock('@/lib/db', () => ({
  prisma: {
    contestant: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    vote: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    votingCategory: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}))

import { prisma } from '@/lib/db'

const mockContestants = [
  { id: TEST_IDS.contestant1, name: 'Alice', country: 'Kenya', gender: 'Female', image: '/uploads/contestants/alice.jpg', description: 'A description', rank: 1, isActive: true, createdAt: new Date(), votes: {} },
  { id: TEST_IDS.contestant2, name: 'Bob', country: 'Uganda', gender: 'Male', image: '/uploads/contestants/bob.jpg', description: 'Another description', rank: 2, isActive: true, createdAt: new Date(), votes: {} },
]

function makeRequest(search = ''): NextRequest {
  return new NextRequest(`http://localhost:3001/api/contestants${search}`)
}

describe('GET /api/contestants', () => {
  beforeEach(() => {
    vi.mocked(prisma.contestant.findMany).mockResolvedValue(mockContestants as never)
    vi.mocked(prisma.contestant.count).mockResolvedValue(2)
  })

  afterEach(() => vi.clearAllMocks())

  it('returns paginated contestants with default params', async () => {
    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toMatchObject({
      contestants: expect.any(Array),
      total: 2,
      page: 1,
    })
  })

  it('respects page and limit query params', async () => {
    vi.mocked(prisma.contestant.findMany).mockResolvedValue([mockContestants[0]] as never)
    vi.mocked(prisma.contestant.count).mockResolvedValue(2)

    const res = await GET(makeRequest('?page=2&limit=1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.page).toBe(2)
    expect(body.limit).toBe(1)
    expect(body.totalPages).toBe(2)
  })

  it('returns empty array when no contestants', async () => {
    vi.mocked(prisma.contestant.findMany).mockResolvedValue([])
    vi.mocked(prisma.contestant.count).mockResolvedValue(0)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.contestants).toEqual([])
    expect(body.total).toBe(0)
  })

  it('returns 500 when database throws', async () => {
    vi.mocked(prisma.contestant.findMany).mockRejectedValue(new Error('DB error'))

    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })
})
