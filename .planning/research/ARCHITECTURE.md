# Architecture Research

**Domain:** Production hardening architecture for Next.js e-commerce
**Researched:** 2026-03-06
**Confidence:** HIGH

## Rate Limiting Architecture

### Two Levels Required

**1. Global rate limit in Edge Middleware (`src/middleware.ts`):**
- Expand matcher from auth-only routes to all routes (exclude `/_next/`, `/api/stripe/webhook`)
- 100 requests/minute per IP (generous, catches only abuse)
- Use Upstash Redis HTTP client (edge-compatible, no TCP connections)

**2. Per-route rate limits in sensitive handlers:**

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| `/api/auth/callback/credentials` | 5 | 15 min | Brute force protection |
| `/api/auth/register` | 3 | 15 min | Account creation spam |
| `/api/auth/forgot-password` | 3 | 15 min | Email bombing prevention |
| `/api/checkout` | 10 | 15 min | Stripe API cost + abandoned orders |
| `/api/newsletter` | 3 | 15 min | Subscription spam |
| `/api/wholesale/apply` | 3 | 1 hour | Application spam |

### New File: `src/lib/rate-limit.ts`
- Export pre-configured Upstash Ratelimit instances
- Global limiter + endpoint-specific limiters
- Shared Redis client singleton

## Security Headers Architecture

### In Edge Middleware (not `next.config.ts`)
Middleware is required for CSP nonce generation per request.

**Headers to add:**
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` (start with Report-Only)

**CSP Allowlist Requirements:**
- `script-src 'self' 'nonce-{random}' https://js.stripe.com` (Stripe)
- `style-src 'self' 'unsafe-inline'` (Tailwind CSS requirement)
- `connect-src 'self' https://api.stripe.com https://*.sentry.io`
- `frame-src https://js.stripe.com https://hooks.stripe.com` (Stripe Checkout)
- `img-src 'self' https://*.s3.*.amazonaws.com https://lh3.googleusercontent.com data: blob:`

## Error Tracking Architecture (Sentry)

### Integration Points
- `sentry.client.config.ts` -- browser-side initialization
- `sentry.server.config.ts` -- server-side initialization
- `sentry.edge.config.ts` -- edge runtime initialization
- `src/app/global-error.tsx` -- top-level error boundary (Sentry wizard creates this)
- `src/app/error.tsx` -- existing error boundary, add `Sentry.captureException(error)`
- `next.config.ts` -- wrap with `withSentryConfig()` for source maps

### No-Change Areas
- Fire-and-forget `.then().catch()` pattern: Add Sentry capture inside existing `.catch()` handlers
- `console.error` calls: Sentry auto-captures these, no code changes needed

## Admin Analytics Extension

### Extend Existing `/api/admin/stats`
No new database models needed. Use Prisma aggregations on existing tables.

**New Queries:**
- Average order value: `prisma.order.aggregate({ _avg: { total: true } })`
- Top products by revenue: `prisma.orderItem.groupBy()` with `_sum`
- Customer trends: `prisma.user.count()` grouped by creation date
- Notification success rate: `prisma.notification.groupBy({ by: ['status'] })`
- Revenue by time period: `prisma.order.aggregate()` with date filters

## Build Order

Dependencies determine order:

1. **Security Headers** -- standalone, no external service setup, test with Report-Only first
2. **Rate Limiting** -- requires Upstash account + env vars (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
3. **Error Tracking** -- requires Sentry account, benefits from headers being in place (reduces noise)
4. **Admin Analytics** -- pure feature work, no security implications, best done last

## Files Modified

| File | Change |
|------|--------|
| `src/middleware.ts` | Expand matcher, add security headers, add global rate limit, add role check |
| `src/app/error.tsx` | Add `Sentry.captureException(error)` |
| `src/lib/resend.ts` | HTML-escape user input in all email templates |
| `src/app/api/admin/stats/route.ts` | Extend with new analytics queries |
| `next.config.ts` | Wrap with Sentry webpack plugin |

## New Files

| File | Purpose |
|------|--------|
| `src/lib/rate-limit.ts` | Upstash rate limit configurations |
| `src/lib/security.ts` | `escapeHtml()` utility |
| `src/app/global-error.tsx` | Top-level error boundary (Sentry) |
| `sentry.client.config.ts` | Sentry browser config |
| `sentry.server.config.ts` | Sentry server config |
| `sentry.edge.config.ts` | Sentry edge config |

---

*Architecture research: 2026-03-06*
