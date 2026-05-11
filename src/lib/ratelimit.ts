import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** PRD §4.4 / NFR-08 — search endpoint is capped at 30 requests / minute / IP. */
const LIMIT = 30;
const WINDOW: `${number} ${"s" | "m" | "h"}` = "1 m";

interface RateLimiter {
  limit(key: string): Promise<{ success: boolean }>;
}

function buildLimiter(): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
      prefix: "search",
      analytics: false,
    });
    return ratelimit;
  }

  // Local fallback: in-memory sliding window. Sufficient for dev/test on a
  // single Node process. Production must set UPSTASH_REDIS_REST_URL/TOKEN
  // because Vercel serverless functions do not share memory across cold
  // starts (PRD §4.4).
  const buckets = new Map<string, number[]>();
  const windowMs = 60_000;
  return {
    async limit(key) {
      const now = Date.now();
      const cutoff = now - windowMs;
      const arr = (buckets.get(key) ?? []).filter((ts) => ts > cutoff);
      if (arr.length >= LIMIT) {
        buckets.set(key, arr);
        return { success: false };
      }
      arr.push(now);
      buckets.set(key, arr);
      return { success: true };
    },
  };
}

const globalForRatelimit = globalThis as unknown as {
  ratelimit: RateLimiter | undefined;
};

export const ratelimit: RateLimiter =
  globalForRatelimit.ratelimit ?? buildLimiter();

if (process.env.NODE_ENV !== "production") {
  globalForRatelimit.ratelimit = ratelimit;
}
