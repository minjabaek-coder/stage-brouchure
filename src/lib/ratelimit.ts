import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Four rate limiters share the same Upstash Redis instance (or in-memory
 * fallback when env vars are missing):
 *   • search   — 30 / minute / IP (PRD §4.4, NFR-08)
 *   • messages — 1  / minute / IP (응원 메시지 도배 방지)
 *   • reviews  — 1  / 5 min  / IP (관람 후기 — 정성스러운 글 유도, PRD §2.4.6)
 *   • photos   — 10 / minute / IP (사진 — 공연 중 실시간 다량 업로드 허용)
 *
 * 사진 한도가 후하다 — 공연 진행 중 1인이 여러 장면을 잇따라 올리는 패턴이
 * 자연스럽기 때문. 한 요청당 최대 3장 (MAX_PHOTOS_PER_REQUEST) 정책은
 * 그대로이므로, 최악의 경우 분당 30장까지 허용된다.
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
  reviewsRatelimit: RateLimiter | undefined;
  photosRatelimit: RateLimiter | undefined;
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

export const reviewsRatelimit: RateLimiter =
  globalForRatelimit.reviewsRatelimit ??
  createLimiter({
    prefix: "reviews",
    limit: 1,
    window: "5 m",
    windowMs: 5 * 60_000,
  });

export const photosRatelimit: RateLimiter =
  globalForRatelimit.photosRatelimit ??
  createLimiter({
    prefix: "photos",
    limit: 10,
    window: "1 m",
    windowMs: 60_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRatelimit.ratelimit = ratelimit;
  globalForRatelimit.messagesRatelimit = messagesRatelimit;
  globalForRatelimit.reviewsRatelimit = reviewsRatelimit;
  globalForRatelimit.photosRatelimit = photosRatelimit;
}
