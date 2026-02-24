import { createRateLimiter } from './rate-limit'

// ── Mock Prisma ──────────────────────────────────────────────
// Keep a simple in-memory store to simulate MongoDB behavior in tests.
const mockStore = new Map<string, { count: number; expiresAt: Date }>()

vi.mock('@/lib/db', () => ({
  prisma: {
    rateLimitEntry: {
      findUnique: vi.fn(async ({ where }: { where: { key: string } }) => {
        const entry = mockStore.get(where.key)
        // Return a shallow copy so mutations in update() don't affect the caller's reference
        return entry ? { ...entry } : null
      }),
      upsert: vi.fn(async ({ where, create, update }: {
        where: { key: string }; create: { key: string; count: number; expiresAt: Date }; update: { count: number; expiresAt: Date }
      }) => {
        const data = mockStore.has(where.key) ? { ...update, key: where.key } : { ...create }
        mockStore.set(where.key, { count: data.count, expiresAt: data.expiresAt })
        return data
      }),
      update: vi.fn(async ({ where, data }: {
        where: { key: string }; data: { count: { increment: number } }
      }) => {
        const entry = mockStore.get(where.key)
        if (entry) {
          entry.count += data.count.increment
        }
        return entry
      }),
    },
  },
}))

beforeEach(() => {
  mockStore.clear()
})

describe('createRateLimiter', () => {
  it('allows requests under the limit', async () => {
    const limiter = createRateLimiter('test-allow', 5, 60_000)
    const result = await limiter.check('user1')
    expect(result.allowed).toBe(true)
    if (result.allowed) {
      expect(result.remaining).toBe(4)
    }
  })

  it('decrements remaining count on each call', async () => {
    const limiter = createRateLimiter('test-decrement', 3, 60_000)
    const r1 = await limiter.check('user1')
    const r2 = await limiter.check('user1')
    const r3 = await limiter.check('user1')

    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r3.allowed).toBe(true)

    if (r1.allowed) expect(r1.remaining).toBe(2)
    if (r2.allowed) expect(r2.remaining).toBe(1)
    if (r3.allowed) expect(r3.remaining).toBe(0)
  })

  it('blocks requests that exceed the limit', async () => {
    const limiter = createRateLimiter('test-block', 2, 60_000)
    await limiter.check('user1')
    await limiter.check('user1')
    const result = await limiter.check('user1')

    expect(result.allowed).toBe(false)
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0)
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000)
    }
  })

  it('tracks different keys independently', async () => {
    const limiter = createRateLimiter('test-keys', 1, 60_000)
    const r1 = await limiter.check('userA')
    const r2 = await limiter.check('userB')

    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)

    // userA should be blocked, userB has separate counter
    const r3 = await limiter.check('userA')
    expect(r3.allowed).toBe(false)
  })

  it('resets after the window expires', async () => {
    vi.useFakeTimers()
    try {
      const windowMs = 1000
      const limiter = createRateLimiter('test-reset', 1, windowMs)

      await limiter.check('user1')
      const blocked = await limiter.check('user1')
      expect(blocked.allowed).toBe(false)

      // Advance time past the window so the stored expiresAt is in the past
      vi.advanceTimersByTime(windowMs + 1)

      const afterReset = await limiter.check('user1')
      expect(afterReset.allowed).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('separate limiter instances with different names do not interfere', async () => {
    const limiterA = createRateLimiter('test-isolateA', 1, 60_000)
    const limiterB = createRateLimiter('test-isolateB', 1, 60_000)

    await limiterA.check('user1')
    const resultA = await limiterA.check('user1')
    const resultB = await limiterB.check('user1')

    expect(resultA.allowed).toBe(false)
    expect(resultB.allowed).toBe(true)
  })
})
