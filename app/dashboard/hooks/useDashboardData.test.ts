import { renderHook, act, waitFor } from '@testing-library/react'
import { useDashboardData } from './useDashboardData'

const MOCK_RESPONSE = {
  stats: {
    totalVotesCast: 42,
    totalTransactions: 10,
    totalSpent: 80,
    verifiedVotes: 38,
    pendingVotes: 4,
    confirmedTickets: 2,
    pendingTickets: 1,
    totalTicketsPurchased: 3,
    messagesSent: 5,
  },
  votes: [
    {
      id: 'v1',
      contestantName: 'Alice',
      contestantImage: '/alice.jpg',
      categoryName: 'Most Talented',
      packageName: 'Basic',
      votesCount: 5,
      amountPaid: 2,
      verified: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  tickets: [
    { id: 't1', ticketName: 'VIP', quantity: 2, totalAmount: 100, status: 'confirmed', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
  messages: [
    { id: 'm1', subject: 'Hello', message: 'World', read: false, createdAt: '2026-01-01T00:00:00.000Z' },
  ],
  account: { id: 'u1', name: 'Alice', email: 'alice@example.com', image: null, createdAt: '2026-01-01T00:00:00.000Z' },
}

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts in loading state with empty defaults', () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useDashboardData())
    expect(result.current.loading).toBe(true)
    expect(result.current.votes).toEqual([])
    expect(result.current.tickets).toEqual([])
    expect(result.current.messages).toEqual([])
    expect(result.current.account).toBeNull()
    expect(result.current.stats.totalVotesCast).toBe(0)
  })

  it('populates data after a successful fetchDashboard call', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESPONSE,
    })

    const { result } = renderHook(() => useDashboardData())

    await act(async () => {
      await result.current.fetchDashboard()
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.stats.totalVotesCast).toBe(42)
    expect(result.current.votes).toHaveLength(1)
    expect(result.current.votes[0].contestantName).toBe('Alice')
    expect(result.current.tickets).toHaveLength(1)
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.account?.name).toBe('Alice')
  })

  it('stays at defaults when API returns an error response', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false })

    const { result } = renderHook(() => useDashboardData())

    await act(async () => {
      await result.current.fetchDashboard()
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.stats.totalVotesCast).toBe(0)
    expect(result.current.votes).toEqual([])
    expect(result.current.account).toBeNull()
  })

  it('stays at defaults when fetch throws', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useDashboardData())

    await act(async () => {
      await result.current.fetchDashboard()
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.votes).toEqual([])
  })

  it('exposes a stable fetchDashboard reference across renders', () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))
    const { result, rerender } = renderHook(() => useDashboardData())
    const first = result.current.fetchDashboard
    rerender()
    expect(result.current.fetchDashboard).toBe(first)
  })
})
