import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Each test uses a unique routeGroup to avoid cross-test state leakage
// (module-level Maps persist across tests in the same Jest worker).
let testGroupCounter = 0;
function uniqueGroup() {
  return `test-group-${++testGroupCounter}`;
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows requests under the limit', () => {
    const group = uniqueGroup();
    const result = checkRateLimit('1.2.3.4', group, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSecs).toBe(0);
  });

  it('blocks the (maxRequests+1)th request within the window', () => {
    const group = uniqueGroup();
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4', group, 5, 60_000).allowed).toBe(true);
    }
    const over = checkRateLimit('1.2.3.4', group, 5, 60_000);
    expect(over.allowed).toBe(false);
    expect(over.retryAfterSecs).toBeGreaterThan(0);
  });

  it('provides a non-zero Retry-After when blocked', () => {
    const group = uniqueGroup();
    for (let i = 0; i < 3; i++) {
      checkRateLimit('ip', group, 3, 60_000);
    }
    const { retryAfterSecs } = checkRateLimit('ip', group, 3, 60_000);
    // Window is 60s, first request just happened → retry ≤ 60s
    expect(retryAfterSecs).toBeGreaterThan(0);
    expect(retryAfterSecs).toBeLessThanOrEqual(60);
  });

  it('allows requests again after the window expires', () => {
    const group = uniqueGroup();
    // Fill up the limit
    for (let i = 0; i < 3; i++) {
      checkRateLimit('ip-exp', group, 3, 10_000);
    }
    expect(checkRateLimit('ip-exp', group, 3, 10_000).allowed).toBe(false);

    // Advance time past the window
    jest.advanceTimersByTime(10_001);

    expect(checkRateLimit('ip-exp', group, 3, 10_000).allowed).toBe(true);
  });

  it('isolates counters per IP (per-key isolation)', () => {
    const group = uniqueGroup();
    // Fill up ip-A
    for (let i = 0; i < 3; i++) {
      checkRateLimit('ip-A', group, 3, 60_000);
    }
    expect(checkRateLimit('ip-A', group, 3, 60_000).allowed).toBe(false);

    // ip-B should be unaffected
    expect(checkRateLimit('ip-B', group, 3, 60_000).allowed).toBe(true);
  });

  it('isolates counters per route group', () => {
    const groupX = uniqueGroup();
    const groupY = uniqueGroup();
    // Fill up groupX for a shared IP
    for (let i = 0; i < 3; i++) {
      checkRateLimit('shared-ip', groupX, 3, 60_000);
    }
    expect(checkRateLimit('shared-ip', groupX, 3, 60_000).allowed).toBe(false);

    // Same IP in groupY should still be allowed
    expect(checkRateLimit('shared-ip', groupY, 3, 60_000).allowed).toBe(true);
  });

  it('uses a sliding window — partial window expiry frees slots', () => {
    const group = uniqueGroup();
    // t=0: 2 requests
    checkRateLimit('ip-slide', group, 3, 10_000);
    checkRateLimit('ip-slide', group, 3, 10_000);

    // t=5001: 1 more → window full
    jest.advanceTimersByTime(5_001);
    checkRateLimit('ip-slide', group, 3, 10_000);
    expect(checkRateLimit('ip-slide', group, 3, 10_000).allowed).toBe(false);

    // t=10002: first 2 requests fall out of window → 1 slot free again
    jest.advanceTimersByTime(5_001);
    expect(checkRateLimit('ip-slide', group, 3, 10_000).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  // jsdom does not expose a global Request — build a minimal stub that only
  // implements the headers.get() interface that getClientIp needs.
  function makeRequest(headers: Record<string, string>): Request {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    } as unknown as Request;
  }

  it('returns the first IP from x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('returns a single IP when there is only one in x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.5' });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('falls back to "unknown" when x-forwarded-for is absent', () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe('unknown');
  });
});
