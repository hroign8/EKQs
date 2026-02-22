import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = createRateLimiter('test-allow', 5, 60_000)
    const result = limiter.check('user1')
    expect(result.allowed).toBe(true)
    if (result.allowed) {
      expect(result.remaining).toBe(4)
    }
  })

  it('decrements remaining count on each call', () => {
    const limiter = createRateLimiter('test-decrement', 3, 60_000)
    const r1 = limiter.check('user1')
    const r2 = limiter.check('user1')
    const r3 = limiter.check('user1')

    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r3.allowed).toBe(true)

    if (r1.allowed) expect(r1.remaining).toBe(2)
    if (r2.allowed) expect(r2.remaining).toBe(1)
    if (r3.allowed) expect(r3.remaining).toBe(0)
  })

  it('blocks requests that exceed the limit', () => {
    const limiter = createRateLimiter('test-block', 2, 60_000)
    limiter.check('user1')
    limiter.check('user1')
    const result = limiter.check('user1')

    expect(result.allowed).toBe(false)
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0)
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000)
    }
  })

  it('tracks different keys independently', () => {
    const limiter = createRateLimiter('test-keys', 1, 60_000)
    const r1 = limiter.check('userA')
    const r2 = limiter.check('userB')

    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)

    // userA should be blocked, userB has separate counter
    const r3 = limiter.check('userA')
    expect(r3.allowed).toBe(false)
  })

  it('resets after the window expires', () => {
    vi.useFakeTimers()
    try {
      const windowMs = 1000
      const limiter = createRateLimiter('test-reset', 1, windowMs)

      limiter.check('user1')
      const blocked = limiter.check('user1')
      expect(blocked.allowed).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(windowMs + 1)

      const afterReset = limiter.check('user1')
      expect(afterReset.allowed).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('separate limiter instances with different names do not interfere', () => {
    const limiterA = createRateLimiter('test-isolateA', 1, 60_000)
    const limiterB = createRateLimiter('test-isolateB', 1, 60_000)

    limiterA.check('user1')
    const resultA = limiterA.check('user1')
    const resultB = limiterB.check('user1')

    expect(resultA.allowed).toBe(false)
    expect(resultB.allowed).toBe(true)
  })
})
