interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter.
 * Protects serverless API routes against burst abuse.
 */
export function isRateLimited(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60 * 1000
): { limited: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { limited: false, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return { limited: true, remaining: 0, resetInMs: Math.max(0, record.resetAt - now) };
  }

  record.count += 1;
  return { limited: false, remaining: limit - record.count, resetInMs: Math.max(0, record.resetAt - now) };
}

