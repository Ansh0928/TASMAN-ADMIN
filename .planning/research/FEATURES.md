# Features Research

**Domain:** Seafood e-commerce production readiness
**Researched:** 2026-03-06
**Sources:** Baymard Institute, Shopify checklists, Freshline/LocalLine (seafood platforms), codebase analysis

## Table Stakes (28 features -- must-fix for launch)

### Checkout Flow
1. **Guest checkout** -- currently forces login; #1 conversion killer per Baymard Institute
2. **Stock race condition fix** -- can oversell perishable goods (checkout validates, webhook decrements with no atomic guard)
3. **Delivery fee transparency** -- show estimates before checkout
4. **Form validation polish** -- end-to-end edge case handling for coupon codes, delivery details
5. **Abandoned order cleanup** -- PENDING orders from abandoned Stripe sessions accumulate forever

### Product Browsing
6. **Mobile responsive product grid** -- overlapping layouts on small screens
7. **Product image zoom/gallery** -- standard e-commerce expectation (partially exists)

### Account & Auth
8. **Rate limiting on auth endpoints** -- zero rate limiting on login, register, forgot-password
9. **Password reset flow validation** -- ensure token expiry and single-use
10. **Role check in middleware** -- admin UI visible to any authenticated user, not just ADMIN role

### Admin Dashboard
11. **Full order lifecycle management** -- all status transitions visible and manageable
12. **Order export (CSV/PDF)** -- admin needs data for accounting
13. **Customer management completeness** -- every entity manageable, all status transitions available
14. **Analytics dashboard** -- sales, revenue, top products, customer trends (extend existing `/api/admin/stats`)
15. **Wholesale order management** -- complete lifecycle visible

### Mobile Responsiveness
16. **Product detail page mobile** -- proper layout, touch targets
17. **Checkout form mobile** -- stacking, input sizing
18. **Admin tables mobile** -- horizontal scroll or card layout
19. **Cart sidebar mobile** -- full-screen overlay on mobile
20. **Navigation mobile** -- hamburger menu, touch-friendly

### Security
21. **Rate limiting** -- zero rate limiting on any endpoint
22. **XSS prevention in emails** -- raw user input interpolated into HTML templates
23. **Remove test endpoints** -- unprotected `/api/test-email` route
24. **Strong admin password** -- currently `admin123`
25. **Security headers** -- CSP, HSTS, X-Frame-Options, etc.
26. **CSRF protection** -- Origin header validation on state-changing endpoints
27. **Webhook idempotency** -- prevent duplicate processing on Stripe retries
28. **Admin email fallback** -- use business domain, not personal email

## Differentiators (10 features -- already built or high-value)

| Feature | Status | Notes |
|---------|--------|-------|
| Wholesale portal | Exists | Polish only, not rebuilding |
| Multi-channel notifications (email + SMS + push) | Exists | Reliable delivery needs work |
| 3D landing page (Three.js) | Exists | Unique visual differentiator |
| Dark/light theme | Exists | Brand-aligned theming |
| Push notifications | Exists | Browser-based, needs mobile testing |
| Related product recommendations | Exists | Cart-based and product-page |
| Coupon/discount system | Exists | Edge cases need fixing |
| Delivery date/time slots | Partial | Available in fulfillment options |
| Freshness/catch-date info | Future | High-value for seafood, not launch-blocking |
| Subscription/recurring orders | Future | Post-launch consideration |

## Anti-Features (9 items -- deliberately NOT building)

| Feature | Rationale |
|---------|-----------|
| Customer self-service cancellation | Perishable goods complexity; admin handles for now |
| Real-time chat | No staff to monitor; email/phone sufficient |
| Native mobile app | Responsive web sufficient for launch |
| Variable weight pricing | Operational complexity (weigh-at-fulfillment); use fixed weights |
| Customer reviews | Moderation burden; backfire risk for fresh food |
| Full CMS integration | Content stays in code/database; no non-dev editors needed |
| Advanced analytics/BI | Basic dashboard metrics sufficient for launch |
| Email marketing automation | Beyond newsletter signup, not needed for launch |
| Third-party inventory integration | Manual stock management sufficient at launch scale |

## Feature Dependencies

```
Security fixes (21-28) FIRST
  -> Stock & payment integrity (2, 5, 27) SECOND
    -> Checkout hardening (1, 3, 4) THIRD
      -> Admin completeness (11-15) FOURTH
        -> Mobile responsive (16-20) PARALLEL with admin
```

---

*Features research: 2026-03-06*
