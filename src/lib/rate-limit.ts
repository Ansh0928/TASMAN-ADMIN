import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

// --- Lazy singleton Redis client ---

let _redis: Redis | null = null;
let _redisChecked = false;

function getRedis(): Redis | null {
    if (_redisChecked) return _redis;
    _redisChecked = true;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url) {
        console.warn('[rate-limit] UPSTASH_REDIS_REST_URL not set -- rate limiting disabled');
        return null;
    }

    _redis = new Redis({ url, token: token || '' });
    return _redis;
}

// --- Limiter factory ---

interface LazyLimiter {
    get: () => Ratelimit | null;
}

function createLimiter(tokens: number, window: `${number} s` | `${number} m` | `${number} h` | `${number} d` | `${number} ms`, prefix: string): LazyLimiter {
    let cached: Ratelimit | null | undefined;

    return {
        get() {
            if (cached !== undefined) return cached;

            const redis = getRedis();
            if (!redis) {
                cached = null;
                return null;
            }

            cached = new Ratelimit({
                redis,
                limiter: Ratelimit.slidingWindow(tokens, window),
                prefix,
            });
            return cached;
        },
    };
}

// --- Pre-configured limiters ---

/** Global limiter: 100 requests per 60 seconds */
export const globalLimiter = createLimiter(100, '60 s', 'rl:global');

/** Auth limiter: 5 requests per 60 seconds */
export const authLimiter = createLimiter(5, '60 s', 'rl:auth');

/** API limiter: 10 requests per 60 seconds */
export const apiLimiter = createLimiter(10, '60 s', 'rl:api');

/** Newsletter limiter: 5 requests per 60 seconds */
export const newsletterLimiter = createLimiter(5, '60 s', 'rl:newsletter');

// --- Helper functions ---

export async function rateLimit(
    limiter: { get: () => Ratelimit | null },
    identifier: string
): Promise<{ limited: boolean; headers: Record<string, string> }> {
    const rl = limiter.get();
    if (!rl) {
        return { limited: false, headers: {} };
    }

    const result = await rl.limit(identifier);

    const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
    };

    if (!result.success) {
        const retryAfterMs = result.reset - Date.now();
        const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
        headers['Retry-After'] = String(retryAfterSec);
    }

    return { limited: !result.success, headers };
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
