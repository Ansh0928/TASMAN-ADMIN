---
phase: 2
slug: rate-limiting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 + @testing-library/react + jsdom |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/__tests__/lib/rate-limit.test.ts src/__tests__/middleware.test.ts --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/lib/rate-limit.test.ts src/__tests__/middleware.test.ts --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | SEC-07, SEC-08, SEC-09, SEC-10 | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts src/__tests__/middleware.test.ts -x` | No — W0 creates | pending |
| 02-01-02 | 01 | 1 | SEC-07, SEC-08 | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts -x` | No — W0 creates | pending |
| 02-01-03 | 01 | 1 | SEC-09, SEC-10 | unit | `npx vitest run src/__tests__/middleware.test.ts -x` | No — W0 creates | pending |
| 02-01-04 | 01 | 2 | SEC-07 | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts -x` | No — W0 creates | pending |
| 02-01-05 | 01 | 2 | SEC-08 | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts -x` | No — W0 creates | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/lib/rate-limit.test.ts` — stubs for SEC-07, SEC-08 (rate limit helper + limiter creation)
- [ ] `src/__tests__/middleware.test.ts` — stubs for SEC-09, SEC-10 (global rate limit + CSRF in middleware)
- [ ] Mock for `@upstash/ratelimit` and `@upstash/redis` using `vi.hoisted()` + `vi.mock()` pattern

*Existing infrastructure covers test framework (Vitest already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stripe webhook not blocked by CSRF | SEC-10 | Requires real Stripe POST from external origin | Deploy to Vercel preview, trigger test webhook from Stripe dashboard, verify 200 response |
| Rate limit with real Upstash Redis | SEC-09 | Unit tests mock Redis; integration needs real backend | Set UPSTASH env vars, run dev server, send 101 rapid requests via curl loop, verify 429 on 101st |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
