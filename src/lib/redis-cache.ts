import { Redis } from '@upstash/redis';

// Bump this when schema changes invalidate cached data shapes
const CACHE_VERSION = 'v2';

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

/**
 * Get from Redis cache or fetch fresh data.
 * Gracefully falls back to fn() if Redis is unavailable.
 */
export async function getCached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fn();

  const versionedKey = `${CACHE_VERSION}:${key}`;

  try {
    const cached = await redis.get<T>(versionedKey);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    // Redis unavailable — fall through to fresh fetch
  }

  const fresh = await fn();

  try {
    await redis.set(versionedKey, JSON.stringify(fresh), { ex: ttl });
  } catch {
    // Cache write failed — that's fine
  }

  return fresh;
}

/**
 * Delete one or more cache keys.
 */
export async function deleteCached(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys.map(k => `${CACHE_VERSION}:${k}`));
  } catch {
    // Ignore
  }
}
