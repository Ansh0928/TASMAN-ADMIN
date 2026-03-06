# Phase 2: Rate Limiting - Research

**Researched:** 2026-03-06
**Domain:** Rate limiting, CSRF protection, API abuse prevention
**Confidence:** HIGH

## Summary

This phase adds rate limiting and CSRF protection to the Tasman Star Seafood e-commerce platform. The locked decision is to use Upstash Redis with `@upstash/ratelimit` SDK -- the standard serverless rate limiting stack for Vercel/Next.js deployments. This is a well-documented, actively maintained pairing with excellent Edge Runtime compatibility.

The implementation has two layers: (1) a global rate limit in `src/middleware.ts` that caps any single IP at 100 requests/minute, and (2) per-endpoint stricter limits on sensitive routes (auth, checkout, wholesale-apply, newsletter). CSRF protection uses Origin header validation on state-changing requests (POST/PUT/DELETE/PATCH) -- a stateless approach recommended by OWASP that requires no token management.

**Primary recommendation:** Use sliding window algorithm for all rate limits (smoother than fixed window, prevents boundary bursts), with a single `src/lib/rate-limit.ts` module exporting pre-configured limiters. CSRF check goes in middleware alongside the global rate limit.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Storage backend: Upstash Redis with `@upstash/ratelimit` SDK
- New env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Development fallback: Skip rate limiting with `console.warn` if `UPSTASH_REDIS_REST_URL` not set
- Upstash Redis client follows lazy singleton Proxy pattern (like stripe.ts, resend.ts)
- API routes return `NextResponse.json({ message }, { status })` for errors
- CSRF: Origin header check, enforce from start (not log-only)

### Claude's Discretion
- Rate limit thresholds per endpoint tier
- Sliding window vs fixed window algorithm choice
- Rate limiter architecture (single module vs inline)
- Which endpoints get per-route limits
- Rate limit response behavior (429 + Retry-After)
- CSRF protection implementation details

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-07 | Add rate limiting via Upstash Redis on auth endpoints (login, register, forgot-password) | Upstash ratelimit SDK with sliding window; auth endpoints get 5 req/min per IP; NextAuth handler rate limited via middleware path matching |
| SEC-08 | Add rate limiting on checkout, newsletter, wholesale-apply endpoints | Per-route rateLimit() guard in each API route handler; 10 req/min for checkout/wholesale, 5 req/min for newsletter |
| SEC-09 | Add global rate limit in middleware (100 req/min per IP) | Sliding window 100/60s in middleware.ts; runs before any route handler; IP from request.ip or x-forwarded-for |
| SEC-10 | Add CSRF Origin header validation on state-changing endpoints | Origin header check in middleware for POST/PUT/DELETE/PATCH; compare against NEXTAUTH_URL; reject with 403 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@upstash/ratelimit` | ^2.0.8 | Rate limiting algorithms (sliding window, fixed window, token bucket) | Only connectionless (HTTP-based) rate limiter; designed for Edge Runtime and serverless |
| `@upstash/redis` | ^1.36.3 | HTTP-based Redis client for Upstash | Required by @upstash/ratelimit; REST API works in Edge Runtime (no TCP needed) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | -- | -- | The two packages above are all that is needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @upstash/ratelimit | In-memory Map | Resets on every cold start; no cross-instance sharing; useless on Vercel |
| @upstash/ratelimit | rate-limiter-flexible | Requires TCP Redis connection; incompatible with Edge Runtime |
| Origin header CSRF | @edge-csrf/nextjs | Token-based; requires cookie + header coordination; overkill when Origin check suffices |

**Installation:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── rate-limit.ts        # Upstash Redis client (singleton) + pre-configured limiters
│   └── ...existing files
├── middleware.ts             # Global rate limit + CSRF Origin check (extended)
├── app/api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts  # Rate limited via middleware path match
│   │   └── forgot-password/route.ts # Per-route rateLimit() call
│   ├── checkout/route.ts           # Per-route rateLimit() call
│   ├── newsletter/route.ts         # Per-route rateLimit() call
│   └── wholesale/apply/route.ts    # Per-route rateLimit() call
```

### Pattern 1: Lazy Singleton Redis Client (matching project convention)
**What:** Single `src/lib/rate-limit.ts` that exports the Redis client and pre-configured rate limiters
**When to use:** All rate limiting needs
**Example:**
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// --- Redis client (lazy singleton, matching project pattern) ---
let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn('[rate-limit] UPSTASH_REDIS_REST_URL not set — rate limiting disabled');
    return null;
  }
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// --- Pre-configured limiters ---

// Global: 100 requests per 60 seconds per IP
function createGlobalLimiter() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'rl:global',
  });
}

// Auth: 5 requests per 60 seconds per IP (strict)
function createAuthLimiter() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'rl:auth',
  });
}

// API: 10 requests per 60 seconds per IP (checkout, wholesale-apply)
function createApiLimiter() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    prefix: 'rl:api',
  });
}

// Newsletter: 5 requests per 60 seconds per IP
function createNewsletterLimiter() {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'rl:newsletter',
  });
}

// Export lazy-created limiters
export const globalLimiter = { get: createGlobalLimiter };
export const authLimiter = { get: createAuthLimiter };
export const apiLimiter = { get: createApiLimiter };
export const newsletterLimiter = { get: createNewsletterLimiter };

// Helper: apply rate limit in API route
export async function rateLimit(
  limiter: { get: () => Ratelimit | null },
  identifier: string
): Promise<{ limited: boolean; headers: Record<string, string> }> {
  const rl = limiter.get();
  if (!rl) return { limited: false, headers: {} };

  const result = await rl.limit(identifier);
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
  };
  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    headers['Retry-After'] = Math.max(retryAfter, 1).toString();
  }
  return { limited: !result.success, headers };
}
```

### Pattern 2: Per-Route Rate Limit Guard
**What:** Call `rateLimit()` at the top of each API route handler
**When to use:** SEC-07 (auth), SEC-08 (checkout, newsletter, wholesale-apply)
**Example:**
```typescript
// In src/app/api/checkout/route.ts (at the top of POST handler)
import { rateLimit, apiLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const { limited, headers } = await rateLimit(apiLimiter, ip);
  if (limited) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }
  // ... existing handler logic
}
```

### Pattern 3: Middleware Global Rate Limit + CSRF
**What:** Extend existing middleware to add global rate limit and Origin header CSRF check
**When to use:** SEC-09 (global limit), SEC-10 (CSRF)
**Example:**
```typescript
// In src/middleware.ts (extended)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Cannot import from @/lib/rate-limit.ts directly in middleware
// because middleware runs at the Edge. Instead, instantiate inline.
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let globalRateLimiter: Ratelimit | null = null;

function getGlobalRateLimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  if (!globalRateLimiter) {
    globalRateLimiter = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      prefix: 'rl:global',
    });
  }
  return globalRateLimiter;
}

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- CSRF Origin check for state-changing requests ---
  if (STATE_CHANGING_METHODS.has(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { message: 'Invalid request origin' },
          { status: 403 }
        );
      }
    }
    // If no Origin header, fall through (browser same-origin requests
    // sometimes omit Origin; Referer check is optional defense-in-depth)
  }

  // --- Global rate limit ---
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const limiter = getGlobalRateLimiter();
  if (limiter) {
    const result = await limiter.limit(ip);
    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      return NextResponse.json(
        { message: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.max(retryAfter, 1).toString(),
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // --- Existing session check logic ---
  // ... (keep existing auth redirect logic)
}
```

### Anti-Patterns to Avoid
- **In-memory rate limiting (Map/WeakMap):** Resets on cold start, no cross-instance sharing. Useless on Vercel's serverless model.
- **Rate limiting inside NextAuth authorize():** The `authorize` function is called by the NextAuth handler, which is re-exported. Adding rate limiting there couples auth logic to infrastructure. Use middleware path matching instead.
- **Blocking on rate limit check failure:** If Redis is down, the `rateLimit()` helper should allow the request (fail-open). Upstash SDK has a `timeout` option for this.
- **Hardcoded IP fallback without x-forwarded-for:** On Vercel, `request.ip` works. Self-hosted needs `x-forwarded-for`. Always check both.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sliding window algorithm | Custom Redis MULTI/EXEC scripts | `Ratelimit.slidingWindow()` | Handles weighted previous-window calculation, atomic operations, edge cases |
| Rate limit state storage | In-memory Map or custom Redis commands | `@upstash/redis` REST client | HTTP-based, works in Edge Runtime, handles connection pooling |
| CSRF token management | Custom token generation/validation | Origin header check | Stateless, no cookies needed, OWASP-recommended for modern browsers |
| Retry-After calculation | Manual timestamp math | `result.reset` from `ratelimit.limit()` | SDK provides exact reset timestamp |

**Key insight:** Rate limiting has subtle correctness issues (race conditions, window boundaries, distributed state). The `@upstash/ratelimit` SDK handles all of these with battle-tested algorithms.

## Common Pitfalls

### Pitfall 1: Middleware vs Route Handler Rate Limiting Scope
**What goes wrong:** Putting per-endpoint rate limits in middleware makes the matcher config complex and hard to maintain. Conversely, putting the global limit in each route handler is redundant.
**Why it happens:** Unclear separation of concerns between middleware and route handlers.
**How to avoid:** Global limit (SEC-09) and CSRF (SEC-10) go in middleware. Per-endpoint limits (SEC-07, SEC-08) go in route handlers.
**Warning signs:** Middleware matcher growing beyond 10+ patterns; duplicate rate limit code across routes.

### Pitfall 2: NextAuth Route Handler is Re-exported
**What goes wrong:** Trying to wrap the NextAuth handler in `[...nextauth]/route.ts` with rate limiting is awkward because it just re-exports `handlers` from `@/lib/auth`.
**Why it happens:** NextAuth v5 uses a handlers pattern that makes the route file a thin re-export.
**How to avoid:** Rate limit NextAuth auth endpoints via middleware path matching on `/api/auth/signin` and `/api/auth/callback/credentials`, OR add a stricter auth tier to the middleware. The middleware already runs before route handlers.
**Warning signs:** Importing rate limit utilities into `@/lib/auth.ts`.

### Pitfall 3: Missing IP When Behind Proxy
**What goes wrong:** `request.ip` returns `undefined` in some environments; using `'127.0.0.1'` as fallback means all requests share one rate limit bucket.
**Why it happens:** Vercel provides `request.ip` automatically, but local dev and other hosts don't.
**How to avoid:** Chain: `request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'`. In dev, the fallback to `'127.0.0.1'` is fine because rate limiting is disabled anyway (no Redis URL).
**Warning signs:** Rate limit hitting unexpectedly in production (all users sharing one bucket).

### Pitfall 4: CSRF Blocking Legitimate Cross-Origin Requests
**What goes wrong:** Stripe webhooks, OAuth callbacks, and other legitimate server-to-server requests get blocked by Origin check.
**Why it happens:** These requests come from external origins or have no Origin header.
**How to avoid:** Exempt specific paths from CSRF check: `/api/stripe/webhook`, `/api/auth/callback/*`. Stripe webhooks are verified by signature separately. OAuth callbacks are GET requests (not state-changing).
**Warning signs:** Stripe webhook failures after deploying CSRF protection.

### Pitfall 5: Edge Runtime Module Compatibility
**What goes wrong:** Importing Node.js-only modules in middleware (which runs at the Edge) causes build failures.
**Why it happens:** `@upstash/ratelimit` and `@upstash/redis` are Edge-compatible (HTTP-based), but other project libraries (prisma, bcryptjs) are not.
**How to avoid:** Keep middleware imports limited to `@upstash/*`, `next/server`, and pure JS utilities. Never import `@/lib/prisma` or other Node.js libs in middleware.
**Warning signs:** Build errors mentioning "Module not found" or "Dynamic Code Evaluation not allowed in Edge Runtime".

## Code Examples

### Getting Client IP (Edge + Node.js compatible)
```typescript
// Works in both middleware (Edge) and API routes (Node.js)
function getClientIp(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}
```

### Rate Limited API Route (complete example)
```typescript
// Source: Upstash official docs pattern
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, authLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const { limited, headers } = await rateLimit(authLimiter, ip);
  if (limited) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  // ... existing handler logic continues
}
```

### CSRF Origin Validation
```typescript
// Source: OWASP CSRF Prevention Cheat Sheet
function isOriginValid(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // No Origin header = same-origin request (browsers send Origin on cross-origin)
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false; // Malformed Origin header
  }
}
```

### Dev Fallback Pattern
```typescript
// Source: Project convention (matches stripe.ts, resend.ts pattern)
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[rate-limit] UPSTASH_REDIS_REST_URL not set — rate limiting disabled');
    }
    return null;
  }
  // ... create Redis client
}
```

## Rate Limit Threshold Recommendations

| Tier | Endpoints | Limit | Window | Rationale |
|------|-----------|-------|--------|-----------|
| **Global** | All requests (middleware) | 100 req | 60 seconds | SEC-09 specifies this exactly |
| **Auth (strict)** | `/api/auth/signin`, `/api/auth/callback/credentials`, `/api/auth/forgot-password` | 5 req | 60 seconds | Brute force protection; login attempts are infrequent for legitimate users |
| **Sensitive API** | `/api/checkout`, `/api/wholesale/apply` | 10 req | 60 seconds | Checkout/apply are occasional actions; 10/min is generous for real users |
| **Newsletter** | `/api/newsletter` | 5 req | 60 seconds | One-time action; strict to prevent spam subscription |

**Algorithm choice: Sliding Window.** Prevents the boundary-burst problem of fixed window (where a user could make 200 requests across a window boundary -- 100 at end of window 1, 100 at start of window 2). Slightly more expensive in Redis operations but negligible at this scale.

## CSRF Exemption List

These paths must be excluded from Origin header validation:

| Path | Reason |
|------|--------|
| `/api/stripe/webhook` | Stripe sends POST from `stripe.com`; verified by webhook signature |
| `/api/auth/callback/*` | OAuth callbacks from Google; these are GET requests anyway |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| express-rate-limit (in-memory) | @upstash/ratelimit (distributed Redis) | 2022+ | Works across serverless instances |
| CSRF tokens (csurf) | Origin header validation | 2023+ (OWASP updated) | Stateless, no token management needed |
| TCP Redis (ioredis) | HTTP Redis (@upstash/redis) | 2021+ | Edge Runtime compatible |

**Deprecated/outdated:**
- `csurf` npm package: Officially deprecated in 2022. Origin header check is the modern replacement for same-site applications.
- In-memory rate limiting: Fundamentally broken in serverless/edge deployments.

## Open Questions

1. **NextAuth auth endpoint rate limiting approach**
   - What we know: The `[...nextauth]/route.ts` re-exports handlers, making in-route rate limiting awkward. Middleware path matching works for `/api/auth/signin` and `/api/auth/callback/credentials`.
   - What's unclear: Whether to also rate limit `/api/auth/register` if a custom register endpoint exists (separate from NextAuth).
   - Recommendation: Check if `/api/auth/register` exists. If so, add per-route rate limiting there. NextAuth endpoints are rate limited via middleware stricter tier.

2. **Middleware matcher expansion**
   - What we know: Current matcher only covers `/admin/`, `/wholesale/prices`, `/account/`. Global rate limit needs to run on ALL routes.
   - What's unclear: Whether to expand matcher to `['/(.*)', '/api/:path*']` or use a negative matcher to exclude static assets.
   - Recommendation: Use `matcher` that excludes `_next/static`, `_next/image`, `favicon.ico`, and static file extensions. This is standard Next.js middleware practice.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4 + @testing-library/react + jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/__tests__/api/rate-limit.test.ts --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-07 | Auth endpoints return 429 when rate limit exceeded | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts -x` | No - Wave 0 |
| SEC-08 | Checkout/newsletter/wholesale-apply return 429 when limited | unit | `npx vitest run src/__tests__/api/checkout-ratelimit.test.ts -x` | No - Wave 0 |
| SEC-09 | Global middleware blocks at 100 req/min | unit | `npx vitest run src/__tests__/middleware.test.ts -x` | No - Wave 0 |
| SEC-10 | POST/PUT/DELETE with mismatched Origin returns 403 | unit | `npx vitest run src/__tests__/middleware.test.ts -x` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/lib/rate-limit.test.ts src/__tests__/middleware.test.ts --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lib/rate-limit.test.ts` -- covers SEC-07, SEC-08 (rate limit helper and limiter creation)
- [ ] `src/__tests__/middleware.test.ts` -- covers SEC-09, SEC-10 (global rate limit + CSRF in middleware)
- [ ] Mock for `@upstash/ratelimit` and `@upstash/redis` in `src/__tests__/helpers/mocks.ts` (add `rateLimitMock`)

### Test Mocking Strategy
The `@upstash/ratelimit` `limit()` method returns `{ success, limit, remaining, reset }`. Mock it:
```typescript
const mockLimit = vi.fn().mockResolvedValue({
  success: true,
  limit: 100,
  remaining: 99,
  reset: Date.now() + 60000,
});

// For rate-limited scenario:
mockLimit.mockResolvedValueOnce({
  success: false,
  limit: 5,
  remaining: 0,
  reset: Date.now() + 30000,
});
```

## Sources

### Primary (HIGH confidence)
- [Upstash Ratelimit Overview](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) - SDK features, Edge Runtime compatibility
- [Upstash Ratelimit Algorithms](https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms) - Fixed window, sliding window, token bucket tradeoffs
- [Upstash Next.js Rate Limiting Blog](https://upstash.com/blog/nextjs-ratelimiting) - Complete code examples
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) - Origin header validation pattern

### Secondary (MEDIUM confidence)
- [Upstash Edge Rate Limiting Blog](https://upstash.com/blog/edge-rate-limiting) - Middleware integration patterns
- [Next.js IP Discussion](https://github.com/vercel/next.js/discussions/55037) - request.ip and x-forwarded-for approaches
- [@upstash/ratelimit npm](https://www.npmjs.com/package/@upstash/ratelimit) - Version 2.0.8 confirmed
- [@upstash/redis npm](https://www.npmjs.com/package/@upstash/redis) - Version 1.36.3 confirmed

### Tertiary (LOW confidence)
- None -- all findings verified with primary/secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Upstash is the canonical choice for Vercel + Next.js rate limiting; locked decision
- Architecture: HIGH - Middleware + per-route pattern is well-documented by Upstash and Vercel
- Pitfalls: HIGH - NextAuth re-export issue verified by reading codebase; Edge Runtime constraints well-known
- CSRF: HIGH - OWASP-recommended Origin header approach; simple and stateless

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable ecosystem, no fast-moving changes expected)
