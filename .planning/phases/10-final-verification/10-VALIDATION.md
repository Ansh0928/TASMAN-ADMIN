---
phase: 10
slug: final-verification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + @testing-library/react 16.3.2 + jsdom 28.1.0 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | Test fixes | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts` | Exists, failing | ⬜ pending |
| 10-01-02 | 01 | 1 | Test fixes | unit | `npx vitest run src/__tests__/middleware.test.ts` | Exists, failing | ⬜ pending |
| 10-02-01 | 02 | 1 | Map layout | manual-only | Visual inspection | N/A | ⬜ pending |
| 10-03-01 | 03 | 2 | Full suite | unit | `npx vitest run` | All exist | ⬜ pending |
| 10-03-02 | 03 | 2 | Lighthouse | automated | `npx lighthouse URL --output=json` | N/A | ⬜ pending |
| 10-03-03 | 03 | 2 | Security headers | automated | `curl -sI URL` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Fix `src/__tests__/lib/rate-limit.test.ts` — 3 failing tests (mock pattern mismatch with REST-based implementation)
- [ ] Fix `src/__tests__/middleware.test.ts` — 1 failing test (global rate limit mock)

*These are existing test failures, not new test creation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Map layout side-by-side | CONTEXT.md | Visual layout verification | Open homepage, select region, verify info panel appears adjacent to map on desktop |
| Species link to products | CONTEXT.md | UI interaction | Click species on map, verify navigation to correct product page |
| Customer checkout flow | Success Criteria 1 | E2E user flow | Browse → add to cart → checkout → confirm email arrives |
| Wholesale lifecycle | Success Criteria 2 | E2E user flow | Apply → admin approve → login → view prices → place order |
| Admin management | Success Criteria 3 | E2E user flow | Login → manage products/orders/customers → view analytics → export CSV |
| Mobile responsiveness | Success Criteria 4 | Visual inspection | All pages at 375px, 768px viewports in light and dark themes |
| Security verification | Success Criteria 5 | Production check | Security headers, rate limiting, CSRF, admin access control |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
