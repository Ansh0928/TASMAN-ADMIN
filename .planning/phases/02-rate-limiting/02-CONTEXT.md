# Phase 2: Rate Limiting - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Prevent brute force attacks and API abuse across all endpoints. Add per-endpoint rate limiting on sensitive routes (auth, checkout, wholesale-apply), a global rate limit in middleware, and CSRF Origin header validation on state-changing requests. Does not include WAF, bot detection, or IP reputation — those are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Storage backend
- Use **Upstash Redis** with `@upstash/ratelimit` SDK
- Serverless-native, pay-per-request, standard pairing with Vercel + Next.js
- New env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Plan includes setup instructions (create Upstash account, provision Redis, add env vars to .env and Vercel)

### Development fallback
- If `UPSTASH_REDIS_REST_URL` is not set, rate limiting is **skipped** with a `console.warn`
- Developers don't need Redis running locally to use `npm run dev`
- Production must have the env vars set

### Claude's Discretion
- **Rate limit thresholds** — Choose appropriate limits per endpoint tier (auth endpoints stricter, general endpoints looser, global ceiling). Reference: SEC-09 specifies 100 req/min global.
- **CSRF protection approach** — Origin header check is the simplest stateless approach. Decide whether to block or log-only initially. Reference: SEC-10 says "rejected" so enforce from the start.
- **Rate limit response behavior** — Standard 429 with Retry-After header. Frontend handling approach (toast, inline error, etc.).
- **Sliding window vs fixed window** — `@upstash/ratelimit` supports both. Choose based on burst tolerance.
- **Rate limiter architecture** — Single `src/lib/rate-limit.ts` module vs inline per-route. Middleware integration approach for global limit.
- **Which endpoints get per-route limits** — SEC-07 (auth), SEC-08 (checkout, newsletter, wholesale-apply). Decide exact list and whether admin endpoints need separate limits.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User deferred all threshold/behavior/CSRF decisions to Claude's discretion.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/middleware.ts`: Currently only checks session cookies (~35 lines). Natural place for global rate limiting and CSRF validation. Runs at the Edge.
- `src/lib/admin-auth.ts`: `requireAdmin()` pattern could inform a similar `rateLimit()` guard pattern for API routes.

### Established Patterns
- Lazy singleton Proxy pattern for external clients (`src/lib/stripe.ts`, `src/lib/resend.ts`) — Upstash Redis client should follow the same pattern.
- API routes return `NextResponse.json({ message }, { status })` for errors — rate limit responses should match.
- No validation library (Zod) — CSRF check will be manual header inspection.

### Integration Points
- `src/middleware.ts` — Add global rate limit + CSRF check here
- `src/app/api/auth/[...nextauth]/route.ts` — Auth endpoint rate limiting
- `src/app/api/auth/forgot-password/route.ts` — Auth endpoint rate limiting
- `src/app/api/checkout/route.ts` — Checkout rate limiting
- `src/app/api/wholesale/apply/route.ts` — Wholesale apply rate limiting
- `src/app/api/newsletter/route.ts` — Newsletter rate limiting (if endpoint exists)
- `package.json` — Add `@upstash/ratelimit` and `@upstash/redis` dependencies
- `.env` — Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-rate-limiting*
*Context gathered: 2026-03-06*
