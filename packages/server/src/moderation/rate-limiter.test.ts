import { describe, it, expect, vi, afterEach } from 'vitest';
import { RateLimiter } from './rate-limiter.js';

describe('RateLimiter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows requests under the limit', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, maxRequests: 5 });
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('user1')).toBe(true);
    }
  });

  it('blocks requests over the limit', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, maxRequests: 3 });
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(false);
  });

  it('resets after window expires', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 2 });
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(false);

    vi.spyOn(Date, 'now').mockReturnValue(now + 1100);
    expect(limiter.check('user1')).toBe(true);
  });

  it('tracks different keys independently', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, maxRequests: 1 });
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user2')).toBe(true);
    expect(limiter.check('user1')).toBe(false);
    expect(limiter.check('user2')).toBe(false);
  });

  it('prune cleans up expired entries', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 10 });
    limiter.check('user1');

    vi.spyOn(Date, 'now').mockReturnValue(now + 1100);
    const pruned = limiter.prune();
    expect(pruned).toBe(1);
  });
});
