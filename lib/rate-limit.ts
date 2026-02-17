/**
 * Simple in-memory rate limiter for API routes.
 *
 * Uses a sliding-window approach per key (usually IP address).
 * Not suitable for multi-instance deployments — use Redis-based
 * limiting in production clusters.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

/**
 * Create a rate limiter for a specific purpose.
 *
 * @param name    – unique identifier for this limiter (e.g. 'auth', 'contact')
 * @param limit   – max requests allowed per window
 * @param windowMs – window length in milliseconds (default 60 000 = 1 min)
 */
export function createRateLimiter(name: string, limit: number, windowMs = 60_000) {
  if (!stores.has(name)) {
    stores.set(name, new Map())
  }
  const store = stores.get(name)!

  // Periodically clean expired entries (every 5 minutes)
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (now > entry.resetTime) store.delete(key)
    })
  }, 5 * 60_000).unref?.()

  return {
    /**
     * Check whether the key is within limits.
     * Returns `{ allowed: true, remaining }` or `{ allowed: false, retryAfterMs }`.
     */
    check(key: string): { allowed: true; remaining: number } | { allowed: false; retryAfterMs: number } {
      const now = Date.now()
      const entry = store.get(key)

      if (!entry || now > entry.resetTime) {
        store.set(key, { count: 1, resetTime: now + windowMs })
        return { allowed: true, remaining: limit - 1 }
      }

      if (entry.count >= limit) {
        return { allowed: false, retryAfterMs: entry.resetTime - now }
      }

      entry.count++
      return { allowed: true, remaining: limit - entry.count }
    },
  }
}
