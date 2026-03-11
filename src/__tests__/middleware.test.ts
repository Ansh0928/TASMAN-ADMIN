import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockDecodeJwt } = vi.hoisted(() => ({
    mockDecodeJwt: vi.fn(),
}));

vi.mock('@auth/core/jwt', () => ({
    decode: mockDecodeJwt,
}));

const originalFetch = global.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

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

// Helper to mock a fetch pipeline response with a given ZCARD count
function mockFetchPipelineAllowed() {
    fetchMock.mockResolvedValue({
        ok: true,
        json: async () => [
            { result: 'OK' },
            { result: 1 },
            { result: 1 },    // ZCARD: count=1, well under any limit
            { result: 1 },
        ],
    } as Response);
}

function mockFetchPipelineLimited(count: number = 201) {
    fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [
            { result: 'OK' },
            { result: 1 },
            { result: count },  // ZCARD: count exceeds limit
            { result: 1 },
        ],
    } as Response);
}

describe('Middleware', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        fetchMock = vi.fn();
        global.fetch = fetchMock as typeof fetch;
        // Set Upstash env vars so rate limiters initialize
        process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
        process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';
        process.env.NEXTAUTH_SECRET = 'test-secret';
        // Default: allow rate limit (low count)
        mockFetchPipelineAllowed();
        // Default: JWT decode returns null (no valid session)
        mockDecodeJwt.mockResolvedValue(null);
    });

    afterEach(() => {
        global.fetch = originalFetch;
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
        delete process.env.NEXTAUTH_SECRET;
    });

    describe('CSRF Origin validation (SEC-10)', () => {
        it('rejects POST with mismatched Origin header', async () => {
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

        it('allows POST with matching Origin header', async () => {
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

        it('allows POST with no Origin header (same-origin assumption)', async () => {
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

        it('allows GET requests even with mismatched Origin', async () => {
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

        it('exempts /api/stripe/webhook from CSRF check', async () => {
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

        it('exempts /api/auth/callback/google from CSRF check', async () => {
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
        it('returns 429 when global rate limit is exceeded', async () => {
            // Reset default mock and set up limited response
            fetchMock.mockReset();
            mockFetchPipelineLimited(201); // exceeds 200 limit in middleware

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

        it('passes through when under global rate limit', async () => {
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

        it('passes through when UPSTASH_REDIS_REST_URL is not set', async () => {
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

    describe('Admin route protection (SEC-03)', () => {
        it('returns 404 for admin routes when no session token exists', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/admin/products',
            });

            const response = await middleware(request);
            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.message).toBe('Not Found');
        });

        it('returns 404 for admin routes when JWT has CUSTOMER role', async () => {
            mockDecodeJwt.mockResolvedValue({ role: 'CUSTOMER', id: 'user-1' });

            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/admin/products',
                cookies: { 'authjs.session-token': 'some-token' },
            });

            const response = await middleware(request);
            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.message).toBe('Not Found');
        });

        it('returns 404 for admin routes when JWT has WHOLESALE role', async () => {
            mockDecodeJwt.mockResolvedValue({ role: 'WHOLESALE', id: 'user-2' });

            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/admin/orders',
                cookies: { 'authjs.session-token': 'some-token' },
            });

            const response = await middleware(request);
            expect(response.status).toBe(404);
        });

        it('allows admin routes when JWT has ADMIN role', async () => {
            mockDecodeJwt.mockResolvedValue({ role: 'ADMIN', id: 'admin-1' });

            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/admin/products',
                cookies: { 'authjs.session-token': 'valid-admin-token' },
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(404);
            expect(response.status).not.toBe(403);
        });

        it('returns 404 when JWT decode throws an error', async () => {
            mockDecodeJwt.mockRejectedValue(new Error('Invalid token'));

            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/admin/products',
                cookies: { 'authjs.session-token': 'invalid-token' },
            });

            const response = await middleware(request);
            expect(response.status).toBe(404);
        });

        it('does not block /admin/login route', async () => {
            const { middleware } = await import('@/middleware');

            const request = createMockRequest({
                url: 'https://tasman-admin.vercel.app/admin/login',
            });

            const response = await middleware(request);
            expect(response.status).not.toBe(404);
        });
    });
});
