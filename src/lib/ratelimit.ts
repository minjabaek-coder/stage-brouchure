import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Two rate limiters share the same Upstash Redis instance (or in-memory
 * fallback when env vars are missing):
 *   • search   — 30 / minute / IP (PRD §4.4, NFR-08)
 *   • messages — 1 / minute / IP (방명록 작성 도배 방지)
 *
 * Local dev/test without UPSTASH_* env vars uses a per-process Map.
 * Production must set UPSTASH_REDIS_REST_URL/TOKEN — Vercel serverless
 * instances do not share memory, so the fallback wouldn't actually limit.
 */

type Window = `${number} ${"s" | "m" | "h"}`;

interface RateLimiter {
  limit(key: string): Promise<{ success: boolean }>;
}

interface LimiterOptions {
  prefix: string;
  limit: number;
  window: Window;
  windowMs: number;
}

function createLimiter(opts: LimiterOptions): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(opts.limit, opts.window),
      prefix: opts.prefix,
      analytics: false,
    });
  }

  // Per-process sliding window. Bucket keyed by `${prefix}:${ip}`.
  const buckets = new Map<string, number[]>();
  return {
    async limit(key) {
      const now = Date.now();
      const cutoff = now - opts.windowMs;
      const arr = (buckets.get(key) ?? []).filter((ts) => ts > cutoff);
      if (arr.length >= opts.limit) {
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
  messagesRatelimit: RateLimiter | undefined;
};

export const ratelimit: RateLimiter =
  globalForRatelimit.ratelimit ??
  createLimiter({
    prefix: "search",
    limit: 30,
    window: "1 m",
    windowMs: 60_000,
  });

export const messagesRatelimit: RateLimiter =
  globalForRatelimit.messagesRatelimit ??
  createLimiter({
    prefix: "messages",
    limit: 1,
    window: "1 m",
    windowMs: 60_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRatelimit.ratelimit = ratelimit;
  globalForRatelimit.messagesRatelimit = messagesRatelimit;
}
