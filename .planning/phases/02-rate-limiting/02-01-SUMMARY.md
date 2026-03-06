---
phase: 02-rate-limiting
plan: 01
subsystem: api
tags: [upstash, redis, rate-limiting, security, middleware]

# Dependency graph
requires: []
provides:
  - "Rate-limit module with lazy singleton Redis client and four pre-configured limiters"
  - "rateLimit() helper with fail-open dev fallback"
  - "getClientIp() helper for IP extraction from proxy headers"
  - "Test scaffolds for rate-limit and middleware (CSRF + global rate limit)"
affects: [02-rate-limiting]

# Tech tracking
tech-stack:
  added: ["@upstash/ratelimit", "@upstash/redis"]
  patterns: ["Lazy limiter factory with cached Ratelimit instances", "Fail-open rate limiting when Redis not configured"]

key-files:
  created:
    - src/lib/rate-limit.ts
    - src/__tests__/lib/rate-limit.test.ts
    - src/__tests__/middleware.test.ts
  modified:
    - package.json

key-decisions:
  - "Used class-based mocks for Upstash constructors to match vi.hoisted pattern"
  - "getClientIp uses x-forwarded-for and x-real-ip headers (Next.js 16 removed request.ip)"

patterns-established:
  - "Lazy limiter factory: createLimiter() returns { get() } that caches Ratelimit on first call"
  - "Fail-open pattern: null limiter returns { limited: false, headers: {} }"

requirements-completed: [SEC-07, SEC-08, SEC-09, SEC-10]

# Metrics
duration: 3min
completed: 2026-03-06
---

# Phase 2 Plan 01: Rate Limit Foundation Summary

**Upstash rate-limit module with four sliding-window limiters (global/auth/api/newsletter) and test scaffolds for middleware CSRF + rate limiting**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T03:42:42Z
- **Completed:** 2026-03-06T03:45:47Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Installed @upstash/ratelimit and @upstash/redis dependencies
- Created rate-limit module with lazy Redis singleton and four pre-configured limiters
- Dev fallback: rate limiting disabled with console.warn when UPSTASH_REDIS_REST_URL not set
- 9 passing unit tests for rate-limit module; 9 skipped middleware test stubs for Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Upstash dependencies and create rate-limit module** - `6917d80` (feat)
2. **Task 2: Create test scaffolds for rate-limit module and middleware** - `dc1988e` (test)

## Files Created/Modified
- `src/lib/rate-limit.ts` - Rate-limit module with Redis client, four limiters, rateLimit() helper, getClientIp() helper
- `src/__tests__/lib/rate-limit.test.ts` - 9 unit tests covering rateLimit(), getClientIp(), dev fallback, limiter creation
- `src/__tests__/middleware.test.ts` - 9 skipped test stubs for CSRF validation and global rate limiting (awaiting Plan 02)
- `package.json` - Added @upstash/ratelimit and @upstash/redis dependencies

## Decisions Made
- Used x-forwarded-for and x-real-ip headers for IP extraction instead of request.ip (removed in Next.js 16)
- Used class-based mocks (not arrow function mocks) for Upstash constructors to work with `new` operator
- Middleware tests marked with `it.skip()` since middleware.ts will be updated in Plan 02-02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed getClientIp for Next.js 16 compatibility**
- **Found during:** Task 1 (rate-limit module creation)
- **Issue:** Plan specified `request.ip` but Next.js 16 removed the `ip` property from NextRequest (TypeScript error TS2339)
- **Fix:** Used `x-forwarded-for` and `x-real-ip` headers instead of `request.ip`
- **Files modified:** src/lib/rate-limit.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 6917d80 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for TypeScript compilation. Same functionality via proxy headers.

## Issues Encountered
None beyond the request.ip deviation documented above.

## User Setup Required

External services require manual configuration for production use:
- **UPSTASH_REDIS_REST_URL** - From Upstash Console -> Create Redis Database -> REST API
- **UPSTASH_REDIS_REST_TOKEN** - From Upstash Console -> Create Redis Database -> REST API
- Rate limiting works in dev without these (fail-open with console.warn)

## Next Phase Readiness
- Rate-limit module ready for Plan 02-02 to integrate into middleware and API routes
- Middleware test stubs ready to be unskipped after Plan 02-02 updates middleware.ts
- All four limiter tiers available: globalLimiter, authLimiter, apiLimiter, newsletterLimiter

---
*Phase: 02-rate-limiting*
*Completed: 2026-03-06*
