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

/**
 * Create a rate limiter for a specific purpose.
 *
 * @param name    – unique identifier for this limiter (e.g. 'auth', 'contact')
 * @param limit   – max requests allowed per window
 * @param windowMs – window length in milliseconds (default 60 000 = 1 min)
 */
export function createRateLimiter(name: string, limit: number, windowMs = 60_000) {
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
        // If DB is unreachable, fail open (allow the request) to avoid
        // blocking all traffic when there's a transient DB issue.
        console.error('Rate limiter DB error (failing open):', err)
        return { allowed: true, remaining: limit }
      }
    },
  }
}
