# Roadmap: Tasman Star Seafood -- Production Readiness

## Overview

Take an existing, feature-rich Next.js e-commerce platform from "works in demo" to "ready for real customers." The roadmap moves from inside out: fix security holes first (phases 1-2), then harden auth and payment integrity (phases 3-4), polish user-facing flows (phases 5-7), lock down quality (phase 8), add operational infrastructure (phase 9), and verify everything end-to-end (phase 10).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Security Blockers** - Remove dangerous defaults and add baseline protections
- [ ] **Phase 2: Rate Limiting** - Prevent brute force and abuse on all endpoints
- [ ] **Phase 3: Auth Hardening** - Enforce role-based access at middleware level with type safety
- [ ] **Phase 4: Stock & Payment Integrity** - Eliminate overselling and duplicate payment processing
- [ ] **Phase 5: Checkout Flow Polish** - Complete the purchase UX with edge case handling
- [ ] **Phase 6: Admin Dashboard Completeness** - Full lifecycle management for orders, customers, and analytics
- [ ] **Phase 7: Frontend Responsive Pass** - Every page works on mobile without overlapping or broken layouts
- [ ] **Phase 8: Fix Failing Tests** - All 330 tests green with CI pipeline enforcing it
- [ ] **Phase 9: Infrastructure** - Error tracking, connection resilience, and compliance
- [ ] **Phase 10: Final Verification** - End-to-end smoke test of all user flows

## Phase Details

### Phase 1: Security Blockers
**Goal**: Eliminate the most dangerous security gaps that could be exploited from day one
**Depends on**: Nothing (first phase)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Complexity**: S
**Success Criteria** (what must be TRUE):
  1. The `/api/test-email` endpoint no longer exists or requires admin authentication
  2. Admin account uses a strong, non-default password
  3. User-supplied text in email templates is HTML-escaped (angle brackets, quotes rendered as entities)
  4. HTTP responses include HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy headers
  5. Content-Security-Policy header is present in Report-Only mode
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Rate Limiting
**Goal**: Prevent brute force attacks and API abuse across all endpoints
**Depends on**: Phase 1
**Requirements**: SEC-07, SEC-08, SEC-09, SEC-10
**Complexity**: M
**Success Criteria** (what must be TRUE):
  1. Auth endpoints (login, register, forgot-password) reject requests exceeding rate limits with 429 status
  2. Checkout, newsletter, and wholesale-apply endpoints are rate limited
  3. Any single IP exceeding 100 requests/minute gets blocked globally via middleware
  4. State-changing POST/PUT/DELETE requests with mismatched Origin headers are rejected
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Install Upstash deps, create rate-limit module, test scaffolds
- [ ] 02-02-PLAN.md -- Extend middleware (global rate limit + CSRF) and add per-route rate limiting

### Phase 3: Auth Hardening
**Goal**: Enforce role-based access control at middleware level with proper type safety
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Complexity**: M
**Success Criteria** (what must be TRUE):
  1. Non-admin users accessing `/admin/*` routes receive a 404 response (not a redirect or the admin page)
  2. Middleware decodes JWT and checks role claims before allowing access to protected routes
  3. Auth callbacks and session handling have zero `as any` casts -- NextAuth types are properly extended
  4. New accounts require passwords meeting minimum complexity requirements
  5. NextAuth version in package.json is pinned to an exact version (no `^` or `~` prefix)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Stock & Payment Integrity
**Goal**: Guarantee that stock cannot be oversold and payments are processed exactly once
**Depends on**: Phase 1
**Requirements**: CHK-01, CHK-02, CHK-03, CHK-04
**Complexity**: M
**Success Criteria** (what must be TRUE):
  1. Stock decrements use an atomic `WHERE stockQuantity >= qty` guard that rejects insufficient stock
  2. All stock operations within a single order are wrapped in a Prisma transaction
  3. Duplicate Stripe webhook events (same `event.id`) are detected and skipped without side effects
  4. PENDING orders older than a configurable threshold are automatically cleaned up (via cron or webhook)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Checkout Flow Polish
**Goal**: Users complete purchases confidently with clear pricing and graceful error handling
**Depends on**: Phase 4
**Requirements**: CHK-05, CHK-06, CHK-07
**Complexity**: M
**Success Criteria** (what must be TRUE):
  1. Checkout handles edge cases gracefully: expired coupons show clear errors, missing delivery details block submission, out-of-stock items are surfaced before payment
  2. Delivery fee estimates are visible to the user before they enter the Stripe checkout flow
  3. When server-side product prices differ from what the cart shows, the user sees a notice and the cart updates
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Admin Dashboard Completeness
**Goal**: Admin staff can manage every aspect of the business from the admin panel
**Depends on**: Phase 1
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05
**Complexity**: L
**Success Criteria** (what must be TRUE):
  1. Admin can transition orders through all lifecycle states (pending, confirmed, shipped, delivered, cancelled) with visible status controls
  2. Admin can export orders as CSV filtered by date range
  3. Admin can view, edit, and manage customer accounts and their statuses
  4. Admin dashboard shows revenue totals, top-selling products, order trend charts, and customer counts
  5. Admin can view and manage wholesale orders through their full lifecycle (pending, confirmed, fulfilled)
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Frontend Responsive Pass
**Goal**: Every page renders correctly on mobile devices without overlapping elements or broken layouts
**Depends on**: Phase 5, Phase 6
**Requirements**: FE-01, FE-02, FE-03, FE-04, FE-05, FE-06, FE-07
**Complexity**: L
**Success Criteria** (what must be TRUE):
  1. Product grid displays in a single column on mobile with proper spacing between cards
  2. Checkout form stacks vertically on mobile with appropriately sized inputs and buttons
  3. Admin data tables are usable on mobile (horizontal scroll or card layout)
  4. Cart sidebar becomes a full-screen overlay on screens under 640px
  5. Navigation collapses to a hamburger menu on mobile with touch-friendly tap targets (minimum 44px)
  6. Product detail page has a functional layout on mobile with accessible touch targets
  7. Wholesale portal pages (apply, prices, order) are usable on mobile
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Fix Failing Tests
**Goal**: All tests pass and CI prevents regressions from merging
**Depends on**: Phase 3, Phase 4
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06
**Complexity**: M
**Success Criteria** (what must be TRUE):
  1. CartProvider tests pass with proper `crypto.randomUUID` mocking
  2. ImageUploader tests pass with proper URL constructor mocking
  3. PushNotificationPrompt tests pass with proper browser API mocking
  4. Resend and S3 test suites pass with proper class constructor mocking
  5. GitHub Actions workflow runs `tsc --noEmit` and `vitest run` on every push/PR, blocking merge on failure
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

### Phase 9: Infrastructure
**Goal**: Production monitoring, connection resilience, and legal compliance are in place
**Depends on**: Phase 1
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Complexity**: M
**Success Criteria** (what must be TRUE):
  1. Unhandled errors in production are captured in Sentry with source maps for readable stack traces
  2. Prisma connection pool is configured for serverless (reduced max connections, using Neon pooler URL)
  3. Fire-and-forget notifications use `after()` or `waitUntil()` so they survive the serverless response lifecycle
  4. Newsletter emails include a working unsubscribe link (Australian Spam Act compliance)
  5. If newsletter signup is not used at launch, the endpoint is disabled or removed
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

### Phase 10: Final Verification
**Goal**: Confirm every user flow works end-to-end in production, fix map layout for side-by-side species display with product links
**Depends on**: Phase 7, Phase 8, Phase 9
**Requirements**: None (verification of all prior phases)
**Complexity**: S
**Success Criteria** (what must be TRUE):
  1. A new customer can browse products, add to cart, complete checkout, and receive an order confirmation email
  2. A wholesale applicant can apply, get approved by admin, log in to the wholesale portal, view prices, and place an order
  3. An admin can log in, manage products/orders/customers, view analytics, and export data
  4. All flows above work on mobile without layout issues
  5. Security headers, rate limiting, and role-based access are verified in production
**Plans**: 4 plans

Plans:
- [ ] 10-01-PLAN.md -- Fix 4 failing tests (rate-limit + middleware mock alignment with fetch-based implementation)
- [ ] 10-02-PLAN.md -- Map layout fix: side-by-side info panel, species-to-product links, remove unmatched species
- [ ] 10-03-PLAN.md -- Automated verification suite (build, tests, security headers) + map visual checkpoint
- [ ] 10-04-PLAN.md -- Comprehensive production flow verification (auth, checkout, wholesale, admin, mobile, SEO)

## Progress

**Execution Order:**
Phases execute in numeric order. Phases 2, 3, 4, 6, 9 can run in parallel after Phase 1. Phase 5 requires Phase 4. Phase 7 requires Phases 5 and 6. Phase 8 requires Phases 3 and 4. Phase 10 requires Phases 7, 8, and 9.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security Blockers | 0/? | Not started | - |
| 2. Rate Limiting | 1/2 | In Progress | - |
| 3. Auth Hardening | 0/? | Not started | - |
| 4. Stock & Payment Integrity | 0/? | Not started | - |
| 5. Checkout Flow Polish | 0/? | Not started | - |
| 6. Admin Dashboard Completeness | 0/? | Not started | - |
| 7. Frontend Responsive Pass | 0/? | Not started | - |
| 8. Fix Failing Tests | 0/? | Not started | - |
| 9. Infrastructure | 0/? | Not started | - |
| 10. Final Verification | 0/4 | Planned | - |
