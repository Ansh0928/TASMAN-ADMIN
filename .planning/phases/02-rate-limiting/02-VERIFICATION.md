---
phase: 02-rate-limiting
verified: 2026-03-06T13:55:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 2: Rate Limiting Verification Report

**Phase Goal:** Prevent brute force attacks and API abuse across all endpoints
**Verified:** 2026-03-06T13:55:00Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Auth endpoints (register, forgot-password) reject requests exceeding 5/min with 429 status | VERIFIED | Both routes import `authLimiter` from `@/lib/rate-limit` and return 429 with rate limit headers when `limited` is true |
| 2 | Checkout and wholesale-apply endpoints reject requests exceeding 10/min with 429 status | VERIFIED | Both routes import `apiLimiter` (10 req/60s) and return 429 when limited |
| 3 | Newsletter endpoint rejects requests exceeding 5/min with 429 status | VERIFIED | Route imports `newsletterLimiter` (5 req/60s) and returns 429 when limited |
| 4 | Any IP exceeding 100 requests/minute gets blocked globally via middleware with 429 | VERIFIED | Middleware instantiates `Ratelimit.slidingWindow(100, '60 s')` with prefix `rl:global`, returns 429 with Retry-After header. Test confirms 429 on exceeded limit. |
| 5 | POST/PUT/DELETE/PATCH requests with mismatched Origin header are rejected with 403 | VERIFIED | Middleware checks `STATE_CHANGING_METHODS` set, parses Origin header, compares to Host, returns 403 on mismatch. 6 CSRF tests pass. |
| 6 | Stripe webhook and OAuth callback paths are exempt from CSRF Origin check | VERIFIED | `CSRF_EXEMPT_PATHS = ['/api/stripe/webhook', '/api/auth/callback']` with `pathname.startsWith()` check. Tests verify both exemptions. |
| 7 | NextAuth signin/callback/credentials paths are rate limited at auth tier (5/min) via middleware | VERIFIED | `AUTH_RATE_LIMIT_PATHS = ['/api/auth/signin', '/api/auth/callback/credentials']` with `Ratelimit.slidingWindow(5, '60 s')` prefix `rl:auth:mw` |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/rate-limit.ts` | Upstash Redis client + pre-configured rate limiters | VERIFIED | 109 lines. Exports: globalLimiter, authLimiter, apiLimiter, newsletterLimiter, rateLimit, getClientIp. Lazy singleton Redis, fail-open dev fallback. |
| `src/middleware.ts` | Global rate limit + CSRF Origin validation | VERIFIED | 183 lines. Async middleware with CSRF check, global rate limit (100/min), auth rate limit (5/min), session checks preserved. |
| `src/app/api/auth/register/route.ts` | Auth endpoint with per-route rate limiting | VERIFIED | Imports rateLimit + authLimiter + getClientIp, 429 guard at top of POST handler |
| `src/app/api/auth/forgot-password/route.ts` | Auth endpoint with per-route rate limiting | VERIFIED | Imports rateLimit + authLimiter + getClientIp, 429 guard at top of POST handler |
| `src/app/api/checkout/route.ts` | Checkout endpoint with per-route rate limiting | VERIFIED | Imports rateLimit + apiLimiter + getClientIp, 429 guard at top of POST handler |
| `src/app/api/newsletter/route.ts` | Newsletter endpoint with per-route rate limiting | VERIFIED | Imports rateLimit + newsletterLimiter + getClientIp, 429 guard at top of POST handler |
| `src/app/api/wholesale/apply/route.ts` | Wholesale apply endpoint with per-route rate limiting | VERIFIED | Imports rateLimit + apiLimiter + getClientIp, 429 guard at top of POST handler |
| `src/__tests__/lib/rate-limit.test.ts` | Unit tests for rate limit helper | VERIFIED | 9 passing tests covering rateLimit(), getClientIp(), dev fallback, limiter creation |
| `src/__tests__/middleware.test.ts` | Unit tests for CSRF + global rate limit | VERIFIED | 9 passing tests (6 CSRF + 3 global rate limit), none skipped |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/rate-limit.ts` | `@upstash/ratelimit` | `Ratelimit.slidingWindow` | WIRED | Line 47: `Ratelimit.slidingWindow(tokens, window)` |
| `src/lib/rate-limit.ts` | `@upstash/redis` | `new Redis` | WIRED | Line 22: `_redis = new Redis({ url, token })` |
| `src/middleware.ts` | `@upstash/ratelimit` | `Ratelimit.slidingWindow(100, ...)` | WIRED | Lines 30, 48: sliding window for global (100) and auth (5) limiters |
| `src/middleware.ts` | CSRF validation | `Origin header check` | WIRED | Line 87: `originHost !== host` comparison with 403 response |
| `src/app/api/auth/register/route.ts` | `src/lib/rate-limit.ts` | `rateLimit(authLimiter, ...)` | WIRED | Line 4: import, Lines 9-16: rate limit guard |
| `src/app/api/checkout/route.ts` | `src/lib/rate-limit.ts` | `rateLimit(apiLimiter, ...)` | WIRED | Line 6: import, Lines 11-18: rate limit guard |
| `src/app/api/newsletter/route.ts` | `src/lib/rate-limit.ts` | `rateLimit(newsletterLimiter, ...)` | WIRED | Line 3: import, Lines 8-15: rate limit guard |
| `src/app/api/wholesale/apply/route.ts` | `src/lib/rate-limit.ts` | `rateLimit(apiLimiter, ...)` | WIRED | Line 6: import, Lines 11-18: rate limit guard |
| `src/app/api/auth/forgot-password/route.ts` | `src/lib/rate-limit.ts` | `rateLimit(authLimiter, ...)` | WIRED | Line 6: import, Lines 11-18: rate limit guard |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEC-07 | 02-01, 02-02 | Rate limiting via Upstash Redis on auth endpoints (login, register, forgot-password) | SATISFIED | register and forgot-password use authLimiter (5/min). NextAuth signin/callback/credentials rate limited via middleware auth-tier limiter (5/min). |
| SEC-08 | 02-01, 02-02 | Rate limiting on checkout, newsletter, wholesale-apply endpoints | SATISFIED | checkout and wholesale-apply use apiLimiter (10/min). newsletter uses newsletterLimiter (5/min). |
| SEC-09 | 02-01, 02-02 | Global rate limit in middleware (100 req/min per IP) | SATISFIED | Middleware applies Ratelimit.slidingWindow(100, '60 s') to all non-static routes. Returns 429 with Retry-After. |
| SEC-10 | 02-01, 02-02 | CSRF Origin header validation on state-changing endpoints | SATISFIED | Middleware checks Origin vs Host for POST/PUT/DELETE/PATCH. Returns 403 on mismatch. Stripe webhook and OAuth callback exempt. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| -- | -- | None found | -- | -- |

No TODOs, FIXMEs, placeholders, or empty implementations detected in any phase-modified files. The `return null` occurrences in rate-limit.ts and middleware.ts are intentional fail-open behavior when Upstash Redis is not configured.

### Human Verification Required

### 1. Rate Limit Behavior Under Load

**Test:** Deploy with Upstash Redis configured, send 6 rapid POST requests to /api/auth/register
**Expected:** First 5 succeed (or return normal errors), 6th returns 429 with Retry-After header
**Why human:** Requires actual Upstash Redis connection and real HTTP requests to verify sliding window behavior end-to-end

### 2. CSRF Rejection in Browser

**Test:** From browser devtools on the live site, use fetch() to POST to /api/checkout with a custom Origin header set to a different domain
**Expected:** Request returns 403 with "Invalid request origin" message
**Why human:** Browser CORS policies may interact with Origin header behavior in ways not captured by unit tests

### 3. Middleware Matcher Coverage

**Test:** Access various static assets (.png, .jpg, .svg) and verify middleware does not intercept them
**Expected:** Static assets load normally without rate limit headers; API routes do include rate limit processing
**Why human:** Matcher regex behavior with real Next.js routing requires end-to-end verification

### Gaps Summary

No gaps found. All 7 observable truths are verified. All 4 requirements (SEC-07 through SEC-10) are satisfied. All artifacts exist, are substantive (not stubs), and are properly wired. All 18 tests (9 rate-limit + 9 middleware) pass. No anti-patterns detected.

---

_Verified: 2026-03-06T13:55:00Z_
_Verifier: Claude (gsd-verifier)_
