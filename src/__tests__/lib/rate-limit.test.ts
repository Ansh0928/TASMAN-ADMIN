import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() for mock references
const mockLimit = vi.hoisted(() => vi.fn());
const mockSlidingWindow = vi.hoisted(() => vi.fn());
const mockRedisConstructor = vi.hoisted(() => vi.fn().mockImplementation(function() { return {}; }));
const mockRatelimitConstructor = vi.hoisted(() =>
    vi.fn().mockImplementation(() => ({ limit: mockLimit }))
);

vi.mock('@upstash/ratelimit', () => {
    class MockRatelimit {
        limit: typeof mockLimit;
        constructor(...args: any[]) {
            mockRatelimitConstructor(...args);
            this.limit = mockLimit;
        }
        static slidingWindow = mockSlidingWindow;
    }
    return { Ratelimit: MockRatelimit };
});

vi.mock('@upstash/redis', () => {
    // Use a real class so `new Redis(...)` works
    class MockRedis {
        constructor(...args: any[]) {
            mockRedisConstructor(...args);
        }
    }
    return { Redis: MockRedis };
});

describe('rate-limit module', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    describe('rateLimit()', () => {
        it('returns { limited: false, headers: {} } when limiter is null', async () => {
            const { rateLimit } = await import('@/lib/rate-limit');
            const nullLimiter = { get: () => null };

            const result = await rateLimit(nullLimiter, '127.0.0.1');

            expect(result).toEqual({ limited: false, headers: {} });
            expect(mockLimit).not.toHaveBeenCalled();
        });

        it('returns { limited: false } with rate limit headers on successful limit', async () => {
            const { rateLimit } = await import('@/lib/rate-limit');

            mockLimit.mockResolvedValueOnce({
                success: true,
                limit: 100,
                remaining: 99,
                reset: Date.now() + 60000,
            });

            const mockLimiter = { get: () => ({ limit: mockLimit }) };
            const result = await rateLimit(mockLimiter as any, '127.0.0.1');

            expect(result.limited).toBe(false);
            expect(result.headers['X-RateLimit-Limit']).toBe('100');
            expect(result.headers['X-RateLimit-Remaining']).toBe('99');
            expect(result.headers['Retry-After']).toBeUndefined();
        });

        it('returns { limited: true } with Retry-After header when limit exceeded', async () => {
            const { rateLimit } = await import('@/lib/rate-limit');

            const resetTime = Date.now() + 30000; // 30 seconds from now
            mockLimit.mockResolvedValueOnce({
                success: false,
                limit: 100,
                remaining: 0,
                reset: resetTime,
            });

            const mockLimiter = { get: () => ({ limit: mockLimit }) };
            const result = await rateLimit(mockLimiter as any, '127.0.0.1');

            expect(result.limited).toBe(true);
            expect(result.headers['X-RateLimit-Limit']).toBe('100');
            expect(result.headers['X-RateLimit-Remaining']).toBe('0');
            expect(Number(result.headers['Retry-After'])).toBeGreaterThanOrEqual(1);
        });
    });

    describe('getClientIp()', () => {
        it('extracts IP from x-forwarded-for header', async () => {
            const { getClientIp } = await import('@/lib/rate-limit');

            const request = {
                headers: new Headers({
                    'x-forwarded-for': '203.0.113.1, 70.41.3.18',
                }),
            } as any;

            expect(getClientIp(request)).toBe('203.0.113.1');
        });

        it('falls back to x-real-ip header', async () => {
            const { getClientIp } = await import('@/lib/rate-limit');

            const request = {
                headers: new Headers({
                    'x-real-ip': '10.0.0.1',
                }),
            } as any;

            expect(getClientIp(request)).toBe('10.0.0.1');
        });

        it('returns 127.0.0.1 when no IP headers present', async () => {
            const { getClientIp } = await import('@/lib/rate-limit');

            const request = {
                headers: new Headers(),
            } as any;

            expect(getClientIp(request)).toBe('127.0.0.1');
        });
    });

    describe('dev fallback (no UPSTASH_REDIS_REST_URL)', () => {
        it('limiters return null when UPSTASH_REDIS_REST_URL is not set', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;
            delete process.env.UPSTASH_REDIS_REST_TOKEN;

            const { globalLimiter, authLimiter, apiLimiter, newsletterLimiter } =
                await import('@/lib/rate-limit');

            expect(globalLimiter.get()).toBeNull();
            expect(authLimiter.get()).toBeNull();
            expect(apiLimiter.get()).toBeNull();
            expect(newsletterLimiter.get()).toBeNull();

            // Redis should not have been instantiated
            expect(mockRedisConstructor).not.toHaveBeenCalled();
        });

        it('rateLimit() returns fail-open when no Redis configured', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;

            const { rateLimit, globalLimiter } = await import('@/lib/rate-limit');
            const result = await rateLimit(globalLimiter, '127.0.0.1');

            expect(result).toEqual({ limited: false, headers: {} });
        });
    });

    describe('limiter creation with Redis configured', () => {
        it('creates Redis and Ratelimit instances when UPSTASH_REDIS_REST_URL is set', async () => {
            process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
            process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

            const { globalLimiter } = await import('@/lib/rate-limit');
            const limiter = globalLimiter.get();

            expect(mockRedisConstructor).toHaveBeenCalledWith({
                url: 'https://test.upstash.io',
                token: 'test-token',
            });
            expect(mockRatelimitConstructor).toHaveBeenCalled();
            expect(limiter).not.toBeNull();

            // Clean up
            delete process.env.UPSTASH_REDIS_REST_URL;
            delete process.env.UPSTASH_REDIS_REST_TOKEN;
        });
    });
});
