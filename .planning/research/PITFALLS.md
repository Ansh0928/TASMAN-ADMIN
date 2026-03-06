# Domain Pitfalls

**Domain:** Seafood e-commerce production hardening (Next.js / Stripe / Prisma / Vercel)
**Researched:** 2026-03-06
**Confidence:** HIGH (verified against codebase and official sources)

## Critical Pitfalls

Mistakes that cause data loss, financial harm, or require rewrites.

### Pitfall 1: Stock Overselling via Checkout-to-Webhook Race Condition

**What goes wrong:** Two customers buy the last item simultaneously. Both pass stock validation at checkout creation (line 104, `checkout/route.ts`), both get Stripe sessions, both pay. The webhook then decrements stock twice, resulting in negative stock and two orders that cannot be fulfilled.

**Why it happens:** Stock is checked at checkout creation time but only decremented minutes later in the webhook handler after payment confirms. There is no reservation or atomic check-and-decrement. The `prisma.product.update({ data: { stockQuantity: { decrement } } })` in the webhook (lines 89-98) has no `WHERE stockQuantity >= quantity` guard.

**Consequences:** Overselling perishable seafood that cannot be restocked quickly. Customer disappointment, manual refund processing, reputation damage.

**Prevention:**
1. Add a conditional guard in the webhook decrement: `UPDATE product SET stock_quantity = stock_quantity - $qty WHERE id = $id AND stock_quantity >= $qty`. Check affected rows to detect overselling.
2. Better: Reserve stock at checkout creation (decrement immediately), then release on session expiry or cancellation. Use `prisma.$transaction()` with a `WHERE stockQuantity >= totalQty` clause.
3. Wrap all item decrements in a single `prisma.$transaction()` for atomicity.

**Phase:** Must be in the earliest hardening phase. This is the single most dangerous production bug.

---

### Pitfall 2: Stripe Webhook Duplicate Processing

**What goes wrong:** Stripe retries webhook delivery when it does not receive a 200 response within its timeout window. The same `checkout.session.completed` event fires twice. The webhook handler processes it again: sends duplicate confirmation emails, duplicate SMS messages, and decrements stock a second time.

**Why it happens:** The current webhook handler has a partial guard (checks `existing.status !== 'PENDING'` at line 43), which prevents double-processing of already-confirmed orders. However, if the first request fails partway through, the retry will skip processing entirely, leaving stock un-decremented.

**Prevention:**
1. Store processed `event.id` values in the database. Check before processing; skip if already seen.
2. Use `event.id` as an idempotency key on the order itself (`stripeEventId` field).
3. Make each operation individually idempotent: stock decrements should use `WHERE stockQuantity >= qty`, notifications should check if already sent for this order+category combo.

**Phase:** Same phase as stock race condition fix. These are interrelated.

---

### Pitfall 3: Middleware Grants Admin UI Access to Any Authenticated User

**What goes wrong:** The middleware at `src/middleware.ts` only checks whether a session cookie exists (`!!sessionToken`). Any logged-in customer can navigate to `/admin/orders`, `/admin/products`, etc. and see the admin UI shell.

**Prevention:**
1. Decode the JWT in middleware and check the `role` claim. NextAuth v5 stores role in the JWT token; this is readable at the edge without a database call.
2. Return a 404 (not a redirect to login) for non-admin users hitting admin routes -- do not reveal that admin routes exist.

**Phase:** Security hardening phase, alongside rate limiting.

---

### Pitfall 4: Abandoned PENDING Orders Pollute Data Permanently

**What goes wrong:** Every checkout attempt creates an order with status `PENDING` in the database before redirecting to Stripe. If the user abandons, the PENDING order stays forever.

**Prevention:**
1. Listen for `checkout.session.expired` webhook event from Stripe (fires after 24h by default).
2. Add a Vercel Cron Job: cancel PENDING orders older than 24-48 hours.
3. If implementing stock reservation, the cleanup MUST also release reserved stock.

**Phase:** Must be addressed in the same phase as stock reservation.

---

### Pitfall 5: Hardcoded Admin Credentials and Weak Password Policy

**What goes wrong:** The admin account uses `admin123` as its password. Combined with zero rate limiting on login endpoints, brute force is trivial.

**Prevention:**
1. Change the admin password immediately.
2. Add rate limiting to credentials endpoint -- 5 attempts per IP per 15 minutes.
3. Strengthen password policy or use `zxcvbn` for strength scoring.
4. Remove credentials from documentation.

**Phase:** First phase, before any public exposure.

## Moderate Pitfalls

### Pitfall 6: XSS via HTML Email Template Injection

**What goes wrong:** User-supplied values (`customerName`, `deliveryNotes`, `companyName`) are interpolated directly into HTML email templates using template literals.

**Prevention:** Create an `escapeHtml()` utility function. Apply it to every user-supplied value in email HTML. Lines identified in CONCERNS.md.

**Phase:** Security hardening phase.

---

### Pitfall 7: Unprotected Test Endpoint Exposes Email Sending

**What goes wrong:** The `/api/test-email` route has no authentication. Anyone can trigger emails.

**Prevention:** Delete the route before production launch, or wrap with `requireAdmin()`.

**Phase:** First phase. Trivial fix, high impact.

---

### Pitfall 8: Prisma Connection Pool Exhaustion on Vercel Serverless

**What goes wrong:** The current pool config (`max: 5`) creates up to 5 connections per serverless instance. Under load, multiple instances create multiple pools, exceeding Neon's limits.

**Prevention:**
1. Reduce `max` to 1-2. Neon's connection pooler handles multiplexing.
2. Ensure `DATABASE_URL` uses Neon's pooled connection string (`-pooler` suffix).
3. Consider `@prisma/adapter-neon` with Neon's serverless driver.

**Phase:** Infrastructure hardening phase.

---

### Pitfall 9: No Error Monitoring in Production

**What goes wrong:** All errors go to `console.error()` which is only visible in Vercel's function logs (retained for limited time).

**Prevention:** Add Sentry (free tier: 5K errors/month) for error tracking with source maps.

**Phase:** Should be one of the first things added.

---

### Pitfall 10: Newsletter Subscription Without Unsubscribe Violates Australian Spam Act

**What goes wrong:** Newsletter signup collects emails but provides no unsubscribe mechanism. Under Australian Spam Act 2003, fines can reach AUD $2.22 million per day.

**Prevention:** Add unsubscribe link to every marketing email, or disable newsletter signup endpoint if not used at launch.

**Phase:** Legal compliance. Must be addressed before any marketing emails are sent.

---

### Pitfall 11: Fire-and-Forget Notifications Lost in Serverless

**What goes wrong:** Notification sends use `.then().catch()` without `await`. On Vercel serverless, the function execution can terminate after returning the response, killing pending promises.

**Prevention:** Use Next.js `after()` (available in Next.js 15+) or Vercel's `waitUntil()` to keep the function alive for background work.

**Phase:** Infrastructure hardening phase.

---

### Pitfall 12: NextAuth v5 Beta Instability

**What goes wrong:** API surface changes between beta releases can break auth for all users. JWT format changes can invalidate all sessions.

**Prevention:** Pin the exact version in `package.json`. Test auth flows after any upgrade. Have a rollback plan.

**Phase:** Verify current pin in first phase.

## Minor Pitfalls

### Pitfall 13: Cart Prices Not Validated Against Current Database Prices

**Prevention:** Server-side recalculation already prevents financial loss. Add UI notice when prices differ from cart.

**Phase:** UX polish phase.

---

### Pitfall 14: No CI Pipeline Means Silent Regressions

**Prevention:** Add GitHub Actions workflow (`tsc --noEmit && vitest run`). Fix failing tests first for clean baseline.

**Phase:** Early phase.

---

### Pitfall 15: Monolithic Components Make Targeted Fixes Risky

**Prevention:** Break down incrementally during feature work rather than a dedicated refactoring phase.

**Phase:** Ongoing across all phases.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Security hardening | Forgetting to remove test endpoints | Audit all routes under `/api/` for unprotected endpoints |
| Security hardening | Rate limiting breaks legitimate use | Start with generous limits (100 req/15min for login), tighten based on data |
| Stock management | Stock reservation without cleanup = locked inventory | Implement reservation AND expiry cleanup together |
| Stock management | Transaction deadlocks under load | Use row-level locks with `FOR UPDATE SKIP LOCKED`, keep transactions short |
| Auth hardening | JWT middleware check breaks on token format change | Test middleware with expired, malformed, and missing tokens |
| Webhook hardening | Returning 500 causes Stripe retry storm | Always return 200 for received events, even if internal processing fails |
| Webhook hardening | `waitUntil` not available in all Next.js versions | Verify `after()` availability in Next.js 16 before relying on it |
| Database optimization | Reducing pool size too aggressively | Load test after changing pool settings |
| Email templates | Refactoring templates breaks email rendering | Test in real email clients after changes |
| Admin panel | Adding role check without testing wholesale routes | Wholesale routes also need role+status checks |

## Sources

- [Stripe Webhooks: Solving Race Conditions](https://www.pedroalonso.net/blog/stripe-webhooks-solving-race-conditions/)
- [Stripe Webhook Documentation](https://docs.stripe.com/webhooks)
- [Prisma + Neon Serverless Guide](https://neon.com/docs/guides/prisma)
- [How to Prevent Overselling in eCommerce](https://queue-it.com/blog/overselling/)

---

*Pitfalls audit: 2026-03-06*
