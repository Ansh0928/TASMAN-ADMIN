import type { NextRequest } from 'next/server';

// --- Upstash REST-based rate limiting (fetch only, no SDK) ---

interface RateLimitResult {
    limited: boolean;
    headers: Record<string, string>;
}

async function upstashRateLimit(
    key: string,
    maxRequests: number,
    windowSec: number
): Promise<RateLimitResult> {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return { limited: false, headers: {} };
    }

    try {
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
            return { limited: false, headers: {} };
        }

        const results = await resp.json();
        const count = results[2]?.result ?? 0;
        const remaining = Math.max(0, maxRequests - count);
        const limited = count > maxRequests;

        const headers: Record<string, string> = {
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': String(remaining),
        };

        if (limited) {
            const retryAfterSec = Math.max(1, Math.ceil(windowMs / 1000));
            headers['Retry-After'] = String(retryAfterSec);
        }

        return { limited, headers };
    } catch {
        // Fail open
        return { limited: false, headers: {} };
    }
}

// --- Limiter factory ---

interface LazyLimiter {
    get: () => { key: string; max: number; windowSec: number } | null;
}

function createLimiter(tokens: number, windowSec: number, prefix: string): LazyLimiter {
    return {
        get() {
            const url = process.env.UPSTASH_REDIS_REST_URL;
            if (!url) return null;
            return { key: prefix, max: tokens, windowSec };
        },
    };
}

// --- Pre-configured limiters ---

/** Global limiter: 100 requests per 60 seconds */
export const globalLimiter = createLimiter(100, 60, 'rl:global');

/** Auth limiter: 5 requests per 60 seconds */
export const authLimiter = createLimiter(5, 60, 'rl:auth');

/** API limiter: 10 requests per 60 seconds */
export const apiLimiter = createLimiter(10, 60, 'rl:api');

/** Newsletter limiter: 5 requests per 60 seconds */
export const newsletterLimiter = createLimiter(5, 60, 'rl:newsletter');

// --- Helper functions ---

export async function rateLimit(
    limiter: LazyLimiter,
    identifier: string
): Promise<RateLimitResult> {
    const config = limiter.get();
    if (!config) {
        return { limited: false, headers: {} };
    }

    return upstashRateLimit(`${config.key}:${identifier}`, config.max, config.windowSec);
}

export function getClientIp(request: NextRequest): string {
    // Next.js 16 removed request.ip; use x-forwarded-for header instead
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim() || '127.0.0.1';
    }
    // x-real-ip is another common proxy header
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    return '127.0.0.1';
}
