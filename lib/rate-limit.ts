/**
 * MongoDB-backed rate limiter for API routes.
 *
 * Uses Prisma to persist rate-limit counters in the `rate_limit` collection,
 * which survives serverless cold starts (unlike an in-memory Map).
 *
 * Each limiter+key combo is stored as a single document with an `expiresAt`
 * timestamp. When the window expires the counter is reset atomically.
 */

import { prisma } from '@/lib/db'

export interface RateLimiterOptions {
  /** Window length in milliseconds (default 60_000 = 1 min) */
  windowMs?: number
  /**
   * Whether to deny requests when the database is unreachable.
   * - `true` (fail closed): Deny requests on DB error — safer for auth/sensitive endpoints.
   * - `false` (fail open): Allow requests on DB error — better availability for non-critical endpoints.
   * Default: `false`
   */
  failClosed?: boolean
}

/**
 * Create a rate limiter for a specific purpose.
 *
 * @param name    – unique identifier for this limiter (e.g. 'auth', 'contact')
 * @param limit   – max requests allowed per window
 * @param options – optional configuration (windowMs, failClosed)
 */
export function createRateLimiter(
  name: string,
  limit: number,
  options: RateLimiterOptions | number = {}
) {
  // Support legacy signature: createRateLimiter(name, limit, windowMs)
  const opts: RateLimiterOptions =
    typeof options === 'number' ? { windowMs: options } : options
  const windowMs = opts.windowMs ?? 60_000
  const failClosed = opts.failClosed ?? false
  return {
    /**
     * Check whether the key is within limits.
     * Returns `{ allowed: true, remaining }` or `{ allowed: false, retryAfterMs }`.
     */
    async check(key: string): Promise<
      { allowed: true; remaining: number } | { allowed: false; retryAfterMs: number }
    > {
      const compositeKey = `${name}:${key}`
      const now = new Date()

      try {
        const entry = await prisma.rateLimitEntry.findUnique({
          where: { key: compositeKey },
        })

        // No entry or window expired → reset the counter
        if (!entry || entry.expiresAt <= now) {
          await prisma.rateLimitEntry.upsert({
            where: { key: compositeKey },
            create: {
              key: compositeKey,
              count: 1,
              expiresAt: new Date(now.getTime() + windowMs),
            },
            update: {
              count: 1,
              expiresAt: new Date(now.getTime() + windowMs),
            },
          })
          return { allowed: true, remaining: limit - 1 }
        }

        // Window still active — check if over limit
        if (entry.count >= limit) {
          return { allowed: false, retryAfterMs: entry.expiresAt.getTime() - now.getTime() }
        }

        // Increment
        await prisma.rateLimitEntry.update({
          where: { key: compositeKey },
          data: { count: { increment: 1 } },
        })

        return { allowed: true, remaining: limit - (entry.count + 1) }
      } catch (err) {
        // Handle DB errors based on failClosed setting
        if (failClosed) {
          // Fail closed: deny the request to protect sensitive endpoints
          console.error('Rate limiter DB error (failing closed):', err)
          return { allowed: false, retryAfterMs: 5000 }
        }
        // Fail open: allow the request to maintain availability
        console.error('Rate limiter DB error (failing open):', err)
        return { allowed: true, remaining: limit }
      }
    },
  }
}
