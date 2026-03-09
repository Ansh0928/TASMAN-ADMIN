# Phase 10: Final Verification - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Confirm every user flow works end-to-end in production with zero issues. This is a comprehensive production readiness verification covering all features, all roles, all devices, and all browsers. Additionally, fix the map layout on the main page so fish species info appears adjacent to the map (not below), and only shows fish species that are actually sold, with click-through to product pages.

</domain>

<decisions>
## Implementation Decisions

### Checkout Verification
- Use Stripe test mode (test cards) on production — Claude's discretion on safest approach
- Verify delivery fee calculation shows correctly before payment and matches Stripe charge
- Test coupon/discount codes during checkout
- Test out-of-stock scenario — verify stock guard blocks overselling
- Full round-trip: after checkout, verify order appears in admin with correct status, items match, admin can update status
- Verify order confirmation email arrives at techsupport@tasmanstarseafood.com
- Verify webhook fires correctly and processes (stock decrement, email, status update)

### Wholesale Flow
- Full lifecycle: create account → apply → admin approves → login → view prices → place order
- Verify wholesale notification emails arrive (application received, approval)
- Place real wholesale order, verify it appears in admin wholesale orders
- Test access control: non-wholesale users blocked from /wholesale/prices
- Test rejection flow: create applicant, reject in admin, verify can't access wholesale portal
- Test pending state: after applying, verify 'pending approval' page shown, prices inaccessible
- Test wholesale order management in admin: view, update status, cancel
- Full wholesale admin: view applications, approve/reject, manage wholesale price lists

### Mobile Verification
- Test with both Chrome DevTools responsive mode AND real device
- All pages must pass: customer-facing, admin panel, wholesale portal, checkout
- Claude's discretion on fail criteria (functional issues fail, reasonable bar for cosmetic)
- Both light and dark themes verified on mobile
- Hamburger menu: all nav links work, touch targets 44px+, menu close behavior
- Cart sidebar: full-screen overlay on mobile, quantity changes, remove items
- Product images: load properly, correctly sized, zoom/gallery works on touch
- Admin tables: horizontal scroll, no content clipping, usable on small screens
- All forms (login, register, checkout, wholesale apply): full-width inputs, visible labels, appropriate keyboards, accessible submit buttons

### Admin Panel
- Full product CRUD: create with image, edit, verify on storefront, delete
- Analytics dashboard: verify charts show real data (revenue, top products, trends, customer counts)
- CSV order export: download and verify columns + data correctness
- Customer management: view list, search, view individual details, test status changes
- Admin notifications: verify admin receives emails when customer orders or wholesale applies
- Admin sidebar navigation: collapses properly on tablet/mobile, all pages accessible
- S3 image upload: upload via admin, verify stored on S3, displays correctly on product page

### Auth Flows
- Full customer registration with new account, password complexity enforced
- Google OAuth login: complete OAuth flow, verify account creation and session
- Full password reset flow: request → email arrives → click link → set new password → login
- Session persistence: log in, close tab, reopen, verify still authenticated
- Weak password rejection: try short/simple passwords, verify rejected with clear errors
- Admin login tested separately at /admin/login with admin credentials
- Unauthorized access: customer trying /admin/* routes receives 404 (not redirect)
- All logouts tested: customer, admin, wholesale — verify redirects and session cleared
- Unauthenticated redirect: /account/*, /wholesale/prices, /admin/* redirect to appropriate login

### SEO & Performance
- Full SEO audit: meta tags, sitemap.xml, robots.txt, OpenGraph images, canonical URLs on every key page
- Lighthouse audit on key pages: Performance 80+, Accessibility 90+, SEO 90+, Best Practices 90+
- OpenGraph images verified for social sharing previews
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Product schema markup (JSON-LD) verified on product pages
- All images audited for proper alt text (products, heroes, icons)
- Canonical URLs verified, no duplicate content issues
- 404 page: custom, branded, with navigation back

### Product Navigation
- All product sections verified: Our Products, Deals, Fresh Buys, Today's Special
- Admin can manage deals (add/remove products from deals page)
- Product search and category filtering verified for correctness and responsiveness
- Related products show correctly on product detail pages

### Map Layout Fix (NEW WORK)
- Map shows only fish species that Tasman Star actually sells
- Clicking a fish redirects to that product's page (add to cart)
- Claude's discretion: preview panel beside map before redirect vs direct redirect
- Desktop: info panel adjacent to map (not below) — Claude decides left/right layout
- Mobile: Claude decides best responsive breakpoint for stacking

### Newsletter/Email
- Full newsletter flow: subscribe, receive email, unsubscribe link works (Spam Act compliance)
- All transactional email templates verified: order confirmation, wholesale approval, password reset, admin notifications

### Error Handling
- All error states tested: 404 page, 500 error page, API error responses, network failure handling, invalid URLs

### Browser Compatibility
- Must work on: Chrome (desktop + mobile), Safari (desktop + iOS), Firefox, Edge

### Accessibility
- WCAG AA compliance: keyboard navigation, color contrast 4.5:1, ARIA labels, focus indicators

### Account Management
- Order history: logged-in customer views past orders with correct details
- Address management: add, edit, delete delivery addresses
- Profile editing: update name, email, phone number
- Wishlist: add/remove products, verify persistence

### Pass/Fail Criteria
- Bar: 100% perfect — every test must pass, no known issues at launch
- Fix flow: stop verification, fix immediately, redeploy, continue from where we left off
- Full test suite (vitest): all 383 tests must pass green
- Security re-verification: security headers, rate limiting, CSRF, admin access control re-checked on production

### Claude's Discretion
- Stripe webhook testing approach (via checkout or CLI)
- Map layout details (left/right, preview panel vs direct redirect, mobile breakpoint)
- Mobile fail criteria bar (functional vs cosmetic)

</decisions>

<specifics>
## Specific Ideas

- "The map on the main page shows fish around Australia and NZ which we also sell — that is the motive of that map"
- Map should only show fish species that are actually sold, clicking redirects to that product's cart/page
- "Every flow, everything, every login, every component, every backend — everything needs to be production ready"
- Product navigation should include all sections: Our Products, Deals, Fresh Buys, Today's Special
- Admin should be able to manage deals from the admin panel

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/middleware.ts`: Rate limiting (Upstash REST), CSRF validation, JWT role check, session protection
- `src/lib/rate-limit.ts`: Per-route rate limiters (auth, API, newsletter)
- `src/lib/prisma.ts`: Database client with connection pool
- `src/lib/stripe.ts`: Stripe client (lazy singleton)
- `src/lib/resend.ts`: Email service + templates
- `src/lib/s3.ts`: S3 upload/delete (presigned URLs)
- `src/lib/admin-auth.ts`: requireAdmin() middleware
- `src/components/ProductCard.tsx`: Reusable product card
- `src/components/CartProvider.tsx`: Cart context

### Established Patterns
- Lazy singleton Proxy pattern for all external services
- `after()` from `next/server` for fire-and-forget notifications
- Theme classes: `text-theme-text`, `bg-theme-primary`, `border-theme-border`, `text-theme-accent`
- Admin routes use `requireAdmin()` guard
- Per-route rate limit guard: `getClientIp -> rateLimit -> 429 if limited`

### Integration Points
- Map component on main page (needs layout fix)
- Product pages at `/product/[slug]`
- Admin panel at `/admin/*`
- Wholesale portal at `/wholesale/*`
- Checkout at `/checkout`
- API routes at `/api/*`
- Stripe webhook at `/api/stripe/webhook`

</code_context>

<deferred>
## Deferred Ideas

- SMS notification testing (Twilio) — skipped for launch, can verify later
- Push notification testing — skipped for launch
- E2E test framework (Playwright) — v2 requirement
- Guest checkout — v2 requirement

</deferred>

---

*Phase: 10-final-verification*
*Context gathered: 2026-03-09*
