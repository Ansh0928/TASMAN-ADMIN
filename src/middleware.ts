import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decode as decodeJwt } from '@auth/core/jwt';

// --- CSRF Configuration ---

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

const CSRF_EXEMPT_PATHS = ['/api/stripe/webhook', '/api/auth/callback'];

// --- Upstash REST-based rate limiting (no SDK needed for Edge) ---

interface RateLimitResult {
    limited: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

async function upstashRateLimit(
    key: string,
    maxRequests: number,
    windowSec: number
): Promise<RateLimitResult> {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return { limited: false, limit: maxRequests, remaining: maxRequests, reset: 0 };
    }

    try {
        // Use sliding window with MULTI/EXEC via Upstash REST pipeline
        const now = Date.now();
        const windowMs = windowSec * 1000;
        const windowStart = now - windowMs;
        const member = `${now}:${Math.random().toString(36).slice(2, 8)}`;

        const pipeline = [
            ['ZREMRANGEBYSCORE', key, '0', String(windowStart)],
            ['ZADD', key, String(now), member],
            ['ZCARD', key],
            ['PEXPIRE', key, String(windowMs)],
        ];

        const resp = await fetch(`${url}/pipeline`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pipeline),
        });

        if (!resp.ok) {
            return { limited: false, limit: maxRequests, remaining: maxRequests, reset: 0 };
        }

        const results = await resp.json();
        const count = results[2]?.result ?? 0;
        const remaining = Math.max(0, maxRequests - count);

        return {
            limited: count > maxRequests,
            limit: maxRequests,
            remaining,
            reset: now + windowMs,
        };
    } catch {
        // Fail open
        return { limited: false, limit: maxRequests, remaining: maxRequests, reset: 0 };
    }
}

// --- Auth-tier rate limit paths ---

const AUTH_RATE_LIMIT_PATHS = ['/api/auth/signin', '/api/auth/callback/credentials'];

// --- Session-protected paths ---

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

    // 2. Global rate limit (SEC-09) — API routes only, 100 req/min per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    // Only rate-limit API routes — page navigations should never be throttled
    const isApiRoute = pathname.startsWith('/api/');
    const globalResult = isApiRoute
        ? await upstashRateLimit(`rl:global:${ip}`, 100, 60)
        : { limited: false, limit: 100, remaining: 100, reset: 0 };
    if (globalResult.limited) {
        const retryAfterSec = Math.max(1, Math.ceil((globalResult.reset - Date.now()) / 1000));
        return NextResponse.json(
            { message: 'Too many requests' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfterSec),
                    'X-RateLimit-Limit': String(globalResult.limit),
                    'X-RateLimit-Remaining': String(globalResult.remaining),
                },
            }
        );
    }

    // 3. Auth-tier rate limit for NextAuth paths (SEC-07 partial) — 5 req/min
    if (AUTH_RATE_LIMIT_PATHS.some(path => pathname.startsWith(path))) {
        const authResult = await upstashRateLimit(`rl:auth:${ip}`, 5, 60);
        if (authResult.limited) {
            const retryAfterSec = Math.max(1, Math.ceil((authResult.reset - Date.now()) / 1000));
            return NextResponse.json(
                { message: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfterSec),
                        'X-RateLimit-Limit': String(authResult.limit),
                        'X-RateLimit-Remaining': String(authResult.remaining),
                    },
                }
            );
        }
    }

    // 4. Session check for protected paths (preserving existing logic)
    if (needsSessionCheck(pathname)) {
        const cookieName = request.cookies.get('__Secure-authjs.session-token')
            ? '__Secure-authjs.session-token'
            : 'authjs.session-token';
        const sessionToken = request.cookies.get(cookieName)?.value;

        const isLoggedIn = !!sessionToken;

        // 4a. Admin route protection: return 404 for non-admin users (SEC-03)
        const isAdminRoute = pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login');
        if (isAdminRoute) {
            if (!sessionToken) {
                return NextResponse.json({ message: 'Not Found' }, { status: 404 });
            }

            // Decode the JWT to check the role
            try {
                const secret = process.env.NEXTAUTH_SECRET;
                if (!secret) {
                    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
                }

                const payload = await decodeJwt({
                    token: sessionToken,
                    secret,
                    salt: cookieName,
                });

                if (!payload || payload.role !== 'ADMIN') {
                    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
                }
            } catch {
                // JWT decode failure — treat as non-admin
                return NextResponse.json({ message: 'Not Found' }, { status: 404 });
            }

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
