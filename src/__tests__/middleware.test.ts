import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() for mock references consistent with project patterns
const mockLimit = vi.hoisted(() => vi.fn());
const mockSlidingWindow = vi.hoisted(() => vi.fn());
const mockRatelimitConstructor = vi.hoisted(() =>
    vi.fn().mockImplementation(() => ({ limit: mockLimit }))
);
const mockRedisConstructor = vi.hoisted(() => vi.fn().mockImplementation(() => ({})));

vi.mock('@upstash/ratelimit', () => ({
    Ratelimit: Object.assign(mockRatelimitConstructor, {
        slidingWindow: mockSlidingWindow,
    }),
}));

vi.mock('@upstash/redis', () => ({
    Redis: mockRedisConstructor,
}));

// Helper to create mock NextRequest objects
function createMockRequest(options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
} = {}) {
    const {
        method = 'GET',
        url = 'https://tasman-admin.vercel.app/',
        headers = {},
        cookies = {},
    } = options;

    const headerMap = new Headers(headers);
    const cookieEntries = Object.entries(cookies);

    return {
        method,
        url,
        nextUrl: new URL(url),
        headers: headerMap,
        cookies: {
            get: (name: string) => {
                const entry = cookieEntries.find(([k]) => k === name);
                return entry ? { name: entry[0], value: entry[1] } : undefined;
            },
        },
    } as any;
}

describe('Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('CSRF Origin validation (SEC-10)', () => {
        // Unskip after Plan 02 updates middleware.ts
        it.skip('rejects POST with mismatched Origin header', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                method: 'POST',
                url: 'https://tasman-admin.vercel.app/api/checkout',
                headers: {
                    origin: 'https://evil.com',
                    host: 'tasman-admin.vercel.app',
                },
            });

            const response = await middleware(request);
            expect(response.status).toBe(403);
        });

        // Unskip after Plan 02 updates middleware.ts
        it.skip('allows POST with matching Origin header', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                method: 'POST',
                url: 'https://tasman-admin.vercel.app/api/checkout',
                headers: {
                    origin: 'https://tasman-admin.vercel.app',
                    host: 'tasman-admin.vercel.app',
                },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(403);
        });

        // Unskip after Plan 02 updates middleware.ts
        it.skip('allows POST with no Origin header (same-origin assumption)', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                method: 'POST',
                url: 'https://tasman-admin.vercel.app/api/checkout',
                headers: {
                    host: 'tasman-admin.vercel.app',
                },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(403);
        });

        // Unskip after Plan 02 updates middleware.ts
        it.skip('allows GET requests even with mismatched Origin', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                method: 'GET',
                url: 'https://tasman-admin.vercel.app/api/products',
                headers: {
                    origin: 'https://evil.com',
                    host: 'tasman-admin.vercel.app',
                },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(403);
        });

        // Unskip after Plan 02 updates middleware.ts
        it.skip('exempts /api/stripe/webhook from CSRF check', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                method: 'POST',
                url: 'https://tasman-admin.vercel.app/api/stripe/webhook',
                headers: {
                    origin: 'https://stripe.com',
                    host: 'tasman-admin.vercel.app',
                },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(403);
        });

        // Unskip after Plan 02 updates middleware.ts
        it.skip('exempts /api/auth/callback/google from CSRF check', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                method: 'POST',
                url: 'https://tasman-admin.vercel.app/api/auth/callback/google',
                headers: {
                    origin: 'https://accounts.google.com',
                    host: 'tasman-admin.vercel.app',
                },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(403);
        });
    });

    describe('Global rate limiting (SEC-09)', () => {
        // Unskip after Plan 02 updates middleware.ts
        it.skip('returns 429 when global rate limit is exceeded', async () => {
            mockLimit.mockResolvedValueOnce({
                success: false,
                limit: 100,
                remaining: 0,
                reset: Date.now() + 60000,
            });

            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/api/products',
                headers: {
                    'x-forwarded-for': '203.0.113.1',
                },
            });

            const response = await middleware(request);
            expect(response.status).toBe(429);
            expect(response.headers.get('Retry-After')).toBeTruthy();
        });

        // Unskip after Plan 02 updates middleware.ts
        it.skip('passes through when under global rate limit', async () => {
            mockLimit.mockResolvedValueOnce({
                success: true,
                limit: 100,
                remaining: 99,
                reset: Date.now() + 60000,
            });

            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/',
                headers: {
                    'x-forwarded-for': '203.0.113.1',
                },
                cookies: {
                    'authjs.session-token': 'valid-session',
                },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(429);
        });

        // Unskip after Plan 02 updates middleware.ts
        it.skip('passes through when UPSTASH_REDIS_REST_URL is not set', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;

            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/',
                cookies: {
                    'authjs.session-token': 'valid-session',
                },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(429);
        });
    });
});
