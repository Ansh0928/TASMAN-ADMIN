# Tasman Star Seafood — Production Readiness

## What This Is

An e-commerce platform for Tasman Star Seafoods (Gold Coast seafood retailer) built with Next.js 16, PostgreSQL/Prisma, Stripe, and multi-channel notifications. The platform serves three user roles: retail customers, wholesale buyers, and admin staff. The app exists and is feature-rich but needs a comprehensive production-readiness pass before launch.

## Core Value

Every user flow — browse, cart, checkout, order tracking, admin management — must work reliably end-to-end with zero broken states, clean responsive UI, and proper role-based access control.

## Requirements

### Validated

<!-- Existing capabilities confirmed in codebase -->

- ✓ Product catalog with categories, search, and related products — existing
- ✓ Cart with localStorage persistence and quantity management — existing
- ✓ Wishlist functionality — existing
- ✓ Stripe Checkout integration with server-side price calculation — existing
- ✓ Coupon/discount system — existing
- ✓ Order creation and confirmation flow — existing
- ✓ Multi-channel notifications (email, SMS, push) — existing
- ✓ Wholesale application, approval, pricing, and ordering — existing
- ✓ Admin panel with product/order/customer/wholesale management — existing
- ✓ Role-based auth (CUSTOMER, WHOLESALE, ADMIN) via NextAuth v5 — existing
- ✓ Google OAuth + credentials login — existing
- ✓ S3 image upload for products — existing
- ✓ Dark/light theme support — existing
- ✓ Deals/promotions page — existing

### Active

<!-- What needs to be built/fixed for production readiness -->

- [ ] Fix all frontend responsive issues — mobile layouts without overlapping, clean modern look
- [ ] Fix admin panel gaps — full order lifecycle management, customer management, analytics dashboard
- [ ] Fix checkout and coupon flow end-to-end — ensure all edge cases handled
- [ ] Harden role-based auth — middleware role checks, proper route protection for all roles
- [ ] Fix stock race condition — atomic check-and-decrement to prevent overselling
- [ ] Fix all 5 failing test suites (43 tests) — CartProvider, ImageUploader, PushNotification, Resend, S3
- [ ] Add security hardening — rate limiting, HTML escaping in emails, CSRF protection, remove test-email endpoint
- [ ] Fix admin notification email fallback — use business domain, not personal email
- [ ] Add abandoned order cleanup — handle PENDING orders that never complete payment
- [ ] Fix TypeScript type safety — eliminate `as any` in auth flow, add proper NextAuth type extensions
- [ ] Ensure all admin controls are complete and visible — every entity manageable, all status transitions available

### Out of Scope

- Real-time chat — not needed for seafood e-commerce
- Mobile native app — web-first, responsive design sufficient
- CMS integration — content stays in code/database for now
- Email marketing automation — beyond newsletter signup not needed for launch
- Customer order cancellation self-service — admin handles for now
- Advanced analytics/BI — basic dashboard metrics sufficient

## Context

- **Pre-launch** — no real customers yet, building toward first public launch
- Hosted on Vercel at https://tasman-admin.vercel.app/
- Database on Neon PostgreSQL (Sydney region)
- Existing test suite: 26 files, 330 tests (287 passing, 43 failing across 5 files)
- Wholesale flow works and just needs polish, not rebuilding
- Codebase is well-structured but has tech debt in large monolithic components (checkout 716 lines, admin pages 450-535 lines each)
- Email templates are 798 lines of inline HTML with duplication
- No E2E test framework set up

## Constraints

- **Stack**: Must stay on Next.js 16 / Prisma / Stripe / existing services — no major rewrites
- **Auth**: Must keep NextAuth v5 — too deep to swap out
- **Hosting**: Vercel deployment — serverless constraints apply (connection pooling, cold starts)
- **Budget**: Free tiers where possible (Resend free tier, Neon free tier)
- **Timeline**: Pre-launch — quality over speed, but ship when ready

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep wholesale flow as-is | Already working, just needs polish | — Pending |
| Fix before refactor | Get everything working first, then clean up code structure | — Pending |
| Production security hardening | Rate limiting, XSS prevention, CSRF — required for real customers | — Pending |
| Admin analytics dashboard | Admin needs visibility into sales, customers, and orders | — Pending |

---
*Last updated: 2026-03-06 after initialization*
