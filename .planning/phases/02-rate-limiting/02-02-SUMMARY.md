---
phase: 02-rate-limiting
plan: 02
subsystem: api
tags: [rate-limiting, csrf, middleware, upstash, security]

# Dependency graph
requires:
  - phase: 02-rate-limiting plan 01
    provides: "Rate-limit module with lazy limiter factory, rateLimit() helper, getClientIp()"
provides:
  - "CSRF Origin validation in middleware for all state-changing requests"
  - "Global rate limit (100/min per IP) in middleware"
  - "Auth-tier rate limit (5/min) for NextAuth paths in middleware"
  - "Per-route rate limiting on all sensitive API endpoints"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: ["Edge-compatible lazy singleton rate limiters in middleware", "CSRF Origin check with exempt paths"]

key-files:
  created: []
  modified:
    - src/middleware.ts
    - src/__tests__/middleware.test.ts
    - src/app/api/auth/register/route.ts
    - src/app/api/auth/forgot-password/route.ts
    - src/app/api/checkout/route.ts
    - src/app/api/newsletter/route.ts
    - src/app/api/wholesale/apply/route.ts

key-decisions:
  - "Instantiated Upstash directly in middleware (Edge-compatible) instead of importing from lib/rate-limit.ts"
  - "Used class-based mocks in tests for Upstash constructors (consistent with rate-limit tests)"
  - "Changed forgot-password request param from Request to NextRequest for getClientIp compatibility"

patterns-established:
  - "CSRF exempt paths: /api/stripe/webhook and /api/auth/callback"
  - "Per-route rate limit guard pattern: getClientIp -> rateLimit -> 429 if limited"

requirements-completed: [SEC-07, SEC-08, SEC-09, SEC-10]

# Metrics
duration: 4min
completed: 2026-03-06
---

# Phase 2 Plan 02: Rate Limit Integration Summary

**CSRF Origin validation, global 100/min rate limit in middleware, and per-route rate limiting on 5 sensitive API endpoints using Upstash sliding windows**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-06T03:48:19Z
- **Completed:** 2026-03-06T03:53:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Extended middleware with CSRF Origin check (403 on mismatched Origin for POST/PUT/DELETE/PATCH, Stripe webhook and OAuth callback exempt)
- Added global rate limit (100 req/min per IP) and auth-tier rate limit (5 req/min for NextAuth signin/callback) in middleware
- Added per-route rate limiting to register, forgot-password, checkout, newsletter, and wholesale-apply endpoints
- Unskipped and passed all 9 middleware tests (6 CSRF + 3 rate limit)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend middleware with global rate limit and CSRF Origin validation** - `2ebbbcf` (feat)
2. **Task 2: Add per-route rate limiting to sensitive API endpoints** - `58ad203` (feat)

## Files Created/Modified
- `src/middleware.ts` - CSRF Origin validation, global rate limit (100/min), auth rate limit (5/min), expanded matcher, preserved session checks
- `src/__tests__/middleware.test.ts` - 9 tests unskipped: 6 CSRF + 3 global rate limit, class-based Upstash mocks
- `src/app/api/auth/register/route.ts` - Added authLimiter (5/min) guard
- `src/app/api/auth/forgot-password/route.ts` - Added authLimiter (5/min) guard, changed Request to NextRequest
- `src/app/api/checkout/route.ts` - Added apiLimiter (10/min) guard
- `src/app/api/newsletter/route.ts` - Added newsletterLimiter (5/min) guard
- `src/app/api/wholesale/apply/route.ts` - Added apiLimiter (10/min) guard

## Decisions Made
- Instantiated Upstash Ratelimit directly in middleware rather than importing from lib/rate-limit.ts, because middleware runs at the Edge and lib/rate-limit.ts may import Node.js-only modules
- Used class-based mock pattern for Upstash Redis/Ratelimit constructors in tests (matching project convention from Plan 01)
- Changed forgot-password route's request parameter type from `Request` to `NextRequest` to support getClientIp() which uses NextRequest-specific header access

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed middleware test mock pattern for Upstash constructors**
- **Found during:** Task 1 (middleware test unskipping)
- **Issue:** Tests used `vi.fn().mockImplementation()` for Redis/Ratelimit mocks, which failed with "is not a constructor" when used with `new` keyword
- **Fix:** Switched to class-based mock pattern (matching rate-limit.test.ts convention) with real classes that delegate to mock fns
- **Files modified:** src/__tests__/middleware.test.ts
- **Verification:** All 9 middleware tests pass
- **Committed in:** 2ebbbcf (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for test compatibility. Same pattern as Plan 01 tests.

## Issues Encountered
None beyond the test mock deviation documented above.

## User Setup Required
None - Upstash credentials were configured in Plan 01. Rate limiting fails open when not configured.

## Next Phase Readiness
- All SEC-07 through SEC-10 requirements complete
- Phase 2 (Rate Limiting) is fully done
- Middleware now handles CSRF, global rate limit, auth rate limit, and session checks
- All 5 sensitive API routes protected with per-route rate limiting

---
*Phase: 02-rate-limiting*
*Completed: 2026-03-06*
