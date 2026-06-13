/**
 * Module-level sliding-window rate limiter keyed by IP address.
 *
 * SERVERLESS CAVEAT: This limiter uses in-process memory. On Vercel (and other
 * serverless platforms) each function instance maintains its own state, so the
 * effective limit is "N requests per window per instance" rather than globally.
 * It still provides meaningful protection against single-instance hammering and
 * burst traffic, but is not a substitute for a Redis-backed distributed limiter
 * in high-traffic production scenarios.
 */

interface WindowEntry {
  /** Timestamps (ms) of requests inside the current window */
  timestamps: number[];
}

// Separate stores per route group so different endpoints have isolated counters
const stores = new Map<string, Map<string, WindowEntry>>();

/** Default: 60 requests per 60-second window */
const DEFAULT_MAX = 60;
const DEFAULT_WINDOW_MS = 60_000;

function getStore(routeGroup: string): Map<string, WindowEntry> {
  let store = stores.get(routeGroup);
  if (!store) {
    store = new Map<string, WindowEntry>();
    stores.set(routeGroup, store);
  }
  return store;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest request in the window expires (for Retry-After) */
  retryAfterSecs: number;
}

/**
 * Check and record a request for the given IP + route group.
 *
 * @param ip          - Client IP (use 'unknown' if unavailable)
 * @param routeGroup  - Logical name for the endpoint group (e.g. 'quote', 'search')
 * @param maxRequests - Max allowed requests per window (default 60)
 * @param windowMs    - Sliding window size in milliseconds (default 60 000)
 */
export function checkRateLimit(
  ip: string,
  routeGroup: string,
  maxRequests = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitResult {
  const store = getStore(routeGroup);
  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Evict timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    // Oldest timestamp in the window determines when space frees up
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    return {
      allowed: false,
      retryAfterSecs: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfterSecs: 0 };
}

/**
 * Extract the client IP from a Request, preferring the first value of
 * x-forwarded-for (set by Vercel/proxies) and falling back to 'unknown'.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }
  return 'unknown';
}
