import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('rate-limit module', () => {
    const originalFetch = global.fetch;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        fetchMock = vi.fn();
        global.fetch = fetchMock;
        // Clear env vars by default
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    // Helper to mock a fetch pipeline response with a given ZCARD count
    function mockFetchPipeline(count: number) {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { result: 'OK' },       // ZREMRANGEBYSCORE
                { result: 1 },          // ZADD
                { result: count },      // ZCARD
                { result: 1 },          // PEXPIRE
            ],
        } as Response);
    }

    describe('rateLimit()', () => {
        it('returns { limited: false, headers: {} } when limiter is null', async () => {
            const { rateLimit } = await import('@/lib/rate-limit');
            const nullLimiter = { get: () => null };

            const result = await rateLimit(nullLimiter, '127.0.0.1');

            expect(result).toEqual({ limited: false, headers: {} });
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('returns { limited: false } with rate limit headers when under limit', async () => {
            process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
            process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

            // ZCARD returns 1, which is under max of 100
            mockFetchPipeline(1);

            const { rateLimit, globalLimiter } = await import('@/lib/rate-limit');
            const result = await rateLimit(globalLimiter, '127.0.0.1');

            expect(result.limited).toBe(false);
            expect(result.headers['X-RateLimit-Limit']).toBe('100');
            expect(result.headers['X-RateLimit-Remaining']).toBe('99');
            expect(result.headers['Retry-After']).toBeUndefined();

            // Verify fetch was called with correct pipeline URL
            expect(fetchMock).toHaveBeenCalledWith(
                'https://test.upstash.io/pipeline',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
            );
        });

        it('returns { limited: true } with Retry-After header when limit exceeded', async () => {
            process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
            process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

            // ZCARD returns 101, which exceeds max of 100
            mockFetchPipeline(101);

            const { rateLimit, globalLimiter } = await import('@/lib/rate-limit');
            const result = await rateLimit(globalLimiter, '127.0.0.1');

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

            // No fetch calls should have been made
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('rateLimit() returns fail-open when no Redis configured', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;

            const { rateLimit, globalLimiter } = await import('@/lib/rate-limit');
            const result = await rateLimit(globalLimiter, '127.0.0.1');

            expect(result).toEqual({ limited: false, headers: {} });
        });
    });

    describe('limiter creation with Redis configured', () => {
        it('returns correct config when UPSTASH_REDIS_REST_URL is set', async () => {
            process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
            process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

            const { globalLimiter, authLimiter, apiLimiter, newsletterLimiter } =
                await import('@/lib/rate-limit');

            const globalConfig = globalLimiter.get();
            expect(globalConfig).toEqual({ key: 'rl:global', max: 100, windowSec: 60 });

            const authConfig = authLimiter.get();
            expect(authConfig).toEqual({ key: 'rl:auth', max: 5, windowSec: 60 });

            const apiConfig = apiLimiter.get();
            expect(apiConfig).toEqual({ key: 'rl:api', max: 10, windowSec: 60 });

            const newsletterConfig = newsletterLimiter.get();
            expect(newsletterConfig).toEqual({ key: 'rl:newsletter', max: 5, windowSec: 60 });
        });
    });
});
