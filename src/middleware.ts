import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// --- CSRF Configuration ---

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

const CSRF_EXEMPT_PATHS = ['/api/stripe/webhook', '/api/auth/callback'];

// --- Lazy singleton rate limiters (Edge-compatible) ---

let _globalLimiter: Ratelimit | null | undefined;
let _authMwLimiter: Ratelimit | null | undefined;

function getGlobalRateLimiter(): Ratelimit | null {
    if (_globalLimiter !== undefined) return _globalLimiter;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url) {
        _globalLimiter = null;
        return null;
    }

    _globalLimiter = new Ratelimit({
        redis: new Redis({ url, token: token || '' }),
        limiter: Ratelimit.slidingWindow(100, '60 s'),
        prefix: 'rl:global',
    });
    return _globalLimiter;
}

function getAuthRateLimiter(): Ratelimit | null {
    if (_authMwLimiter !== undefined) return _authMwLimiter;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url) {
        _authMwLimiter = null;
        return null;
    }

    _authMwLimiter = new Ratelimit({
        redis: new Redis({ url, token: token || '' }),
        limiter: Ratelimit.slidingWindow(5, '60 s'),
        prefix: 'rl:auth:mw',
    });
    return _authMwLimiter;
}

// --- Auth-tier rate limit paths ---

const AUTH_RATE_LIMIT_PATHS = ['/api/auth/signin', '/api/auth/callback/credentials'];

// --- Session-protected paths ---

const SESSION_PROTECTED_PREFIXES = ['/admin/', '/wholesale/prices', '/account/'];

function needsSessionCheck(pathname: string): boolean {
    // /admin/* except /admin/login
    if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login')) return true;
    if (pathname === '/wholesale/prices' || pathname.startsWith('/wholesale/prices/')) return true;
    if (pathname.startsWith('/account/')) return true;
    return false;
}

// --- Middleware ---

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. CSRF Origin validation (SEC-10)
    if (STATE_CHANGING_METHODS.has(request.method)) {
        const isExempt = CSRF_EXEMPT_PATHS.some(path => pathname.startsWith(path));

        if (!isExempt) {
            const origin = request.headers.get('origin');
            const host = request.headers.get('host');

            if (origin) {
                try {
                    const originHost = new URL(origin).host;
                    if (originHost !== host) {
                        return NextResponse.json(
                            { message: 'Invalid request origin' },
                            { status: 403 }
                        );
                    }
                } catch {
                    // Malformed Origin header
                    return NextResponse.json(
                        { message: 'Invalid request origin' },
                        { status: 403 }
                    );
                }
            }
            // No Origin header => allow through (same-origin requests may omit Origin)
        }
    }

    // 2. Global rate limit (SEC-09)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    const globalRl = getGlobalRateLimiter();
    if (globalRl) {
        const result = await globalRl.limit(ip);

        if (!result.success) {
            const retryAfterMs = result.reset - Date.now();
            const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));

            return NextResponse.json(
                { message: 'Too many requests' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfterSec),
                        'X-RateLimit-Limit': String(result.limit),
                        'X-RateLimit-Remaining': String(result.remaining),
                    },
                }
            );
        }
    }

    // 3. Auth-tier rate limit for NextAuth paths (SEC-07 partial)
    if (AUTH_RATE_LIMIT_PATHS.some(path => pathname.startsWith(path))) {
        const authRl = getAuthRateLimiter();
        if (authRl) {
            const result = await authRl.limit(ip);

            if (!result.success) {
                const retryAfterMs = result.reset - Date.now();
                const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));

                return NextResponse.json(
                    { message: 'Too many requests. Please try again later.' },
                    {
                        status: 429,
                        headers: {
                            'Retry-After': String(retryAfterSec),
                            'X-RateLimit-Limit': String(result.limit),
                            'X-RateLimit-Remaining': String(result.remaining),
                        },
                    }
                );
            }
        }
    }

    // 4. Session check for protected paths (preserving existing logic)
    if (needsSessionCheck(pathname)) {
        const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                             request.cookies.get('__Secure-authjs.session-token')?.value;

        const isLoggedIn = !!sessionToken;

        // 4a. Admin route protection: return 404 for non-admin users (AUTH-01, AUTH-02)
        const isAdminRoute = pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login');
        if (isAdminRoute) {
            if (!sessionToken) {
                return NextResponse.json({ message: 'Not found' }, { status: 404 });
            }

            // Decode JWT payload to check role claim
            try {
                const parts = sessionToken.split('.');
                if (parts.length !== 3) {
                    return NextResponse.json({ message: 'Not found' }, { status: 404 });
                }
                const payload = JSON.parse(atob(parts[1]));
                if (payload.role !== 'ADMIN') {
                    return NextResponse.json({ message: 'Not found' }, { status: 404 });
                }
            } catch {
                // Malformed JWT — treat as unauthorized
                return NextResponse.json({ message: 'Not found' }, { status: 404 });
            }

            // Admin user authenticated — continue
            return NextResponse.next();
        }

        // 4b. Non-admin protected routes: redirect to login if not authenticated
        if (!isLoggedIn) {
            let loginPath = '/auth/login';
            if (pathname.startsWith('/wholesale/prices')) {
                loginPath = '/wholesale/login';
            }

            const loginUrl = new URL(loginPath, request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
