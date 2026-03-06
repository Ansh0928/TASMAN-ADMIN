# Requirements

**Project:** Tasman Star Seafood -- Production Readiness
**Version:** v1.0 (Launch)
**Date:** 2026-03-06

## Scope Legend

| Scope | Meaning |
|-------|---------|
| **v1** | Required for launch |
| **v2** | Post-launch enhancement |
| **out** | Out of scope |

---

## Security (SEC)

| REQ-ID | Requirement | Scope | Phase |
|--------|-------------|-------|-------|
| SEC-01 | Remove or protect `/api/test-email` endpoint | v1 | 1 |
| SEC-02 | Change admin password from default `admin123` | v1 | 1 |
| SEC-03 | Add `escapeHtml()` utility and apply to all user input in email templates | v1 | 1 |
| SEC-04 | Add security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | v1 | 1 |
| SEC-05 | Add Content-Security-Policy in Report-Only mode | v1 | 1 |
| SEC-06 | Replace personal email fallback with business domain for admin notifications | v1 | 1 |
| SEC-07 | Add rate limiting via Upstash Redis on auth endpoints (login, register, forgot-password) | v1 | 2 |
| SEC-08 | Add rate limiting on checkout, newsletter, wholesale-apply endpoints | v1 | 2 |
| SEC-09 | Add global rate limit in middleware (100 req/min per IP) | v1 | 2 |
| SEC-10 | Add CSRF Origin header validation on state-changing endpoints | v1 | 2 |
| SEC-11 | Enforce CSP (move from Report-Only to enforced) | v2 | -- |
| SEC-12 | Add 2FA for admin accounts | v2 | -- |

## Auth (AUTH)

| REQ-ID | Requirement | Scope | Phase |
|--------|-------------|-------|-------|
| AUTH-01 | Add role checking in middleware (decode JWT, check role claim for admin routes) | v1 | 3 |
| AUTH-02 | Return 404 (not redirect) for non-admin users hitting admin routes | v1 | 3 |
| AUTH-03 | Eliminate `as any` casts in auth callbacks -- extend NextAuth User/Session/JWT types | v1 | 3 |
| AUTH-04 | Strengthen password policy (minimum complexity or zxcvbn scoring) | v1 | 3 |
| AUTH-05 | Verify NextAuth version is pinned exactly (not `^` range) | v1 | 3 |
| AUTH-06 | Add auth flow tests (login, register, password reset, role checking) | v2 | -- |

## Checkout (CHK)

| REQ-ID | Requirement | Scope | Phase |
|--------|-------------|-------|-------|
| CHK-01 | Fix stock race condition -- atomic `WHERE stockQuantity >= qty` guard in webhook decrement | v1 | 4 |
| CHK-02 | Wrap all stock decrements in `prisma.$transaction()` for atomicity | v1 | 4 |
| CHK-03 | Add webhook idempotency -- store processed `event.id`, skip duplicates | v1 | 4 |
| CHK-04 | Add abandoned order cleanup (Vercel Cron or `checkout.session.expired` webhook) | v1 | 4 |
| CHK-05 | End-to-end checkout validation -- coupon edge cases, delivery details, error states | v1 | 5 |
| CHK-06 | Delivery fee transparency -- show estimates before checkout | v1 | 5 |
| CHK-07 | Cart price mismatch UI notice when server prices differ from cart | v1 | 5 |
| CHK-08 | Guest checkout (allow purchase without account creation) | v2 | -- |

## Admin (ADM)

| REQ-ID | Requirement | Scope | Phase |
|--------|-------------|-------|-------|
| ADM-01 | Complete order lifecycle management -- all status transitions visible and manageable | v1 | 6 |
| ADM-02 | Order export (CSV) for accounting | v1 | 6 |
| ADM-03 | Customer management completeness -- view, edit, status management | v1 | 6 |
| ADM-04 | Analytics dashboard -- revenue, top products, order trends, customer counts | v1 | 6 |
| ADM-05 | Wholesale order lifecycle -- complete status management | v1 | 6 |
| ADM-06 | Order export as PDF | v2 | -- |
| ADM-07 | Advanced analytics/BI dashboard | v2 | -- |

## Frontend / Mobile (FE)

| REQ-ID | Requirement | Scope | Phase |
|--------|-------------|-------|-------|
| FE-01 | Product grid mobile responsive -- no overlapping, proper spacing | v1 | 7 |
| FE-02 | Checkout form mobile responsive -- stacked layout, proper input sizing | v1 | 7 |
| FE-03 | Admin tables mobile responsive -- horizontal scroll or card layout | v1 | 7 |
| FE-04 | Cart sidebar mobile -- full-screen overlay on small screens | v1 | 7 |
| FE-05 | Navigation mobile -- hamburger menu, touch-friendly targets | v1 | 7 |
| FE-06 | Product detail page mobile -- layout, touch targets, image zoom | v1 | 7 |
| FE-07 | Wholesale portal mobile responsive | v1 | 7 |

## Testing (TEST)

| REQ-ID | Requirement | Scope | Phase |
|--------|-------------|-------|-------|
| TEST-01 | Fix CartProvider test suite (crypto.randomUUID mock) | v1 | 8 |
| TEST-02 | Fix ImageUploader test suite (URL constructor mock) | v1 | 8 |
| TEST-03 | Fix PushNotificationPrompt test suite (browser API mocks) | v1 | 8 |
| TEST-04 | Fix Resend test suite (class constructor mock) | v1 | 8 |
| TEST-05 | Fix S3 test suite (AWS SDK command class mocks) | v1 | 8 |
| TEST-06 | Add CI pipeline (GitHub Actions: tsc + vitest) | v1 | 8 |
| TEST-07 | Add E2E tests (Playwright) | v2 | -- |

## Infrastructure (INFRA)

| REQ-ID | Requirement | Scope | Phase |
|--------|-------------|-------|-------|
| INFRA-01 | Add Sentry error tracking with source maps | v1 | 9 |
| INFRA-02 | Optimize Prisma connection pool for serverless (reduce max, verify pooler URL) | v1 | 9 |
| INFRA-03 | Fix notification reliability -- use `after()` or `waitUntil()` for fire-and-forget | v1 | 9 |
| INFRA-04 | Add newsletter unsubscribe mechanism (Australian Spam Act compliance) | v1 | 9 |
| INFRA-05 | Disable newsletter signup endpoint if not used at launch | v1 | 9 |
| INFRA-06 | Migrate to `@prisma/adapter-neon` for true serverless connections | v2 | -- |

---

## Summary

| Category | v1 | v2 | Total |
|----------|----|----|-------|
| Security | 10 | 2 | 12 |
| Auth | 5 | 1 | 6 |
| Checkout | 7 | 1 | 8 |
| Admin | 5 | 2 | 7 |
| Frontend | 7 | 0 | 7 |
| Testing | 6 | 1 | 7 |
| Infrastructure | 5 | 1 | 6 |
| **Total** | **45** | **8** | **53** |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 1 | Pending |
| SEC-04 | Phase 1 | Pending |
| SEC-05 | Phase 1 | Pending |
| SEC-06 | Phase 1 | Pending |
| SEC-07 | Phase 2 | Pending |
| SEC-08 | Phase 2 | Pending |
| SEC-09 | Phase 2 | Pending |
| SEC-10 | Phase 2 | Pending |
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| AUTH-05 | Phase 3 | Pending |
| CHK-01 | Phase 4 | Pending |
| CHK-02 | Phase 4 | Pending |
| CHK-03 | Phase 4 | Pending |
| CHK-04 | Phase 4 | Pending |
| CHK-05 | Phase 5 | Pending |
| CHK-06 | Phase 5 | Pending |
| CHK-07 | Phase 5 | Pending |
| ADM-01 | Phase 6 | Pending |
| ADM-02 | Phase 6 | Pending |
| ADM-03 | Phase 6 | Pending |
| ADM-04 | Phase 6 | Pending |
| ADM-05 | Phase 6 | Pending |
| FE-01 | Phase 7 | Pending |
| FE-02 | Phase 7 | Pending |
| FE-03 | Phase 7 | Pending |
| FE-04 | Phase 7 | Pending |
| FE-05 | Phase 7 | Pending |
| FE-06 | Phase 7 | Pending |
| FE-07 | Phase 7 | Pending |
| TEST-01 | Phase 8 | Pending |
| TEST-02 | Phase 8 | Pending |
| TEST-03 | Phase 8 | Pending |
| TEST-04 | Phase 8 | Pending |
| TEST-05 | Phase 8 | Pending |
| TEST-06 | Phase 8 | Pending |
| INFRA-01 | Phase 9 | Pending |
| INFRA-02 | Phase 9 | Pending |
| INFRA-03 | Phase 9 | Pending |
| INFRA-04 | Phase 9 | Pending |
| INFRA-05 | Phase 9 | Pending |

---

*Requirements defined: 2026-03-06*
*Traceability added: 2026-03-06*
