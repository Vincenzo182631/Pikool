import { ApiError } from "@/lib/api";

/**
 * Lightweight fixed-window rate limiter.
 *
 * Dev/default uses an in-memory store so the app runs with zero infra. In
 * production swap the store for Upstash Redis (see docs/16-security.md) — the
 * `limit()` interface stays identical.
 */
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Unique key, e.g. `login:${ip}`. */
  key: string;
  /** Max requests per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return { ok: existing.count <= limit, remaining, resetAt: existing.resetAt };
}

/** Throw a 429 when the limit is exceeded. */
export function enforceRateLimit(opts: RateLimitOptions) {
  const result = rateLimit(opts);
  if (!result.ok) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new ApiError(
      "RATE_LIMITED",
      `Too many requests. Try again in ${retryAfter}s.`,
      { retryAfter },
    );
  }
  return result;
}

/** Best-effort client IP from request headers. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
