# Codebase Concerns

**Analysis Date:** 2026-03-06

## Security Considerations

**Unprotected test-email endpoint:**
- Risk: The `/api/test-email` route has NO authentication. Any visitor can trigger emails to a hardcoded address, consuming Resend quota and potentially being used for abuse.
- Files: `src/app/api/test-email/route.ts`
- Current mitigation: None. The endpoint is a simple GET with no auth check.
- Recommendations: Add `requireAdmin()` guard, or remove the route entirely in production. The test-sms route correctly uses `requireAdmin()`.

**No rate limiting on any API routes:**
- Risk: Brute-force attacks on login, password reset abuse, newsletter subscription spam, checkout spam creating abandoned orders and Stripe API calls.
- Files: All routes under `src/app/api/`, especially `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/newsletter/route.ts`, `src/app/api/checkout/route.ts`
- Current mitigation: None detected. No rate limiting library is used anywhere.
- Recommendations: Add rate limiting middleware (e.g., `@upstash/ratelimit` with Redis, or Vercel's built-in rate limiting). Priority endpoints: forgot-password, register, login, checkout, newsletter.

**XSS via HTML email injection:**
- Risk: User-supplied values (customer name, delivery notes, company name) are interpolated directly into HTML email templates using string interpolation without escaping. A malicious user could inject HTML/script content into admin notification emails.
- Files: `src/lib/resend.ts` (lines 113, 267, 339, 398, 486-488, 630, 698-702), `src/app/api/auth/forgot-password/route.ts` (line 39)
- Current mitigation: None. Raw template literals with `${data.customerName}`, `${data.deliveryNotes}`, etc.
- Recommendations: Create an `escapeHtml()` utility and apply it to all user-supplied values before embedding in email HTML. Example: `function escapeHtml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }`

**Hardcoded admin email fallback:**
- Risk: Admin notification emails fall back to a personal email address `anshumaansaraf24@gmail.com` when `ADMIN_NOTIFICATION_EMAIL` env var is not set.
- Files: `src/lib/resend.ts` (lines 533, 603, 725), `src/app/api/stripe/webhook/route.ts` (line 117)
- Current mitigation: Env var exists but fallback is a personal address.
- Recommendations: Make `ADMIN_NOTIFICATION_EMAIL` a required env var, or use a business domain email as fallback (e.g., `admin@tasmanstar.com.au`).

**Middleware only checks cookie existence, not role:**
- Risk: The middleware at `src/middleware.ts` only checks whether a session cookie exists, not whether the user has the ADMIN role. A regular customer with a valid session cookie can access `/admin/*` pages. Role checks happen at the API level via `requireAdmin()`, but the admin UI pages themselves are accessible.
- Files: `src/middleware.ts`
- Current mitigation: API routes properly check roles via `requireAdmin()`. The admin pages are server-rendered and fetch data from protected APIs, so data access is guarded. However, the admin UI shell/layout is visible to any authenticated user.
- Recommendations: Add role checking in middleware by decoding the JWT token and checking the role claim, or use Next.js page-level auth guards.

**Weak password policy:**
- Risk: Only enforces minimum 8 characters. No complexity requirements (uppercase, numbers, special chars).
- Files: `src/app/api/auth/register/route.ts` (line 16), `src/app/api/wholesale/apply/route.ts` (line 19), `src/app/api/auth/reset-password/route.ts` (line 13)
- Current mitigation: bcrypt with cost factor 12.
- Recommendations: Consider adding password complexity rules or integrating a library like `zxcvbn` for password strength scoring.

**Hardcoded admin credentials in MEMORY.md:**
- Risk: Admin login credentials (`admin@tasmanstar.com.au` / `admin123`) are documented in project memory. The password is extremely weak (8 chars, common pattern).
- Files: Project memory (not in source), `prisma/seed.ts` (likely seeds this user)
- Current mitigation: None.
- Recommendations: Change the admin password to something strong. Remove credentials from documentation. Use environment variables for initial admin setup.

## Tech Debt

**Massive email template file (798 lines of inline HTML):**
- Issue: All email templates are inline HTML strings in a single file with significant duplication. Each template repeats the full HTML document structure, styles, header, and footer.
- Files: `src/lib/resend.ts`
- Impact: Difficult to maintain consistent branding, easy to introduce inconsistencies when updating templates. Changes to shared elements (header, footer, colors) require editing multiple places.
- Fix approach: Extract email templates into a proper template system (e.g., React Email, MJML, or at minimum separate template files). Use the existing `emailHeader()`/`emailFooter()` helpers more consistently.

**`as any` type assertions throughout auth flow:**
- Issue: The NextAuth callbacks use `(user as any).role` and `(user as any).wholesaleStatus` extensively because the NextAuth User type is not properly extended.
- Files: `src/lib/auth.ts` (lines 82-83, 96-97, 111-112), `src/lib/auth.config.ts` (lines 14-15)
- Impact: Loss of type safety in critical auth code path. Bugs in role/wholesaleStatus handling would not be caught by TypeScript.
- Fix approach: Extend the NextAuth `User`, `Session`, and `JWT` types in a `next-auth.d.ts` declaration file to include `role` and `wholesaleStatus` fields.

**Checkout page is a single 716-line component:**
- Issue: The checkout page contains all form logic, validation, coupon handling, recommendations, and UI in one monolithic component.
- Files: `src/app/checkout/page.tsx`
- Impact: Hard to test, hard to modify individual sections without risk of side effects.
- Fix approach: Extract into sub-components: `CheckoutForm`, `OrderSummary`, `CouponInput`, `FulfillmentSelector`, `CheckoutRecommendations`.

**Large admin page components (450-535 lines each):**
- Issue: Admin pages for customers, categories, orders, and wholesale are each 450+ lines with inline state management, modals, and data fetching.
- Files: `src/app/admin/customers/page.tsx` (535 lines), `src/app/admin/categories/page.tsx` (481 lines), `src/app/admin/orders/page.tsx` (467 lines), `src/app/admin/wholesale/page.tsx` (460 lines)
- Impact: Difficult to maintain and test. Mixing data fetching, state, and UI in single files.
- Fix approach: Extract reusable table/modal components. Consider using React Server Components for data fetching where possible.

**Platform content hardcoded in massive data file:**
- Issue: Product descriptions, SEO content, and site copy are hardcoded in a 1242-line TypeScript file rather than in the database or CMS.
- Files: `src/data/platform-content.ts`
- Impact: Content updates require code deployments. Cannot be edited by non-developers.
- Fix approach: Move content to the database (already has Product model with description field) or integrate a headless CMS for marketing content.

**Loose `any` types in OrderItem interface:**
- Issue: The `OrderItem` interface in `resend.ts` uses `any` for `unitPrice` and `total` fields.
- Files: `src/lib/resend.ts` (lines 56-57)
- Impact: No type checking on price values passed to email templates.
- Fix approach: Use `Decimal | string | number` or the Prisma-generated type.

## Performance Bottlenecks

**Stock decrement race condition:**
- Problem: Stock is checked during checkout creation and decremented in the webhook handler, but there is no atomic check-and-decrement. Two simultaneous checkouts could both pass stock validation and both decrement, resulting in negative stock.
- Files: `src/app/api/checkout/route.ts` (lines 90-114 for check), `src/app/api/stripe/webhook/route.ts` (lines 89-98 for decrement)
- Cause: Stock validation happens at checkout creation time, but stock decrement happens after Stripe payment confirmation in the webhook. The time gap can be minutes.
- Improvement path: Use a database transaction with `WHERE stockQuantity >= quantity` in the decrement query, or reserve stock at checkout time and release on timeout/cancellation. At minimum, add a guard in the webhook: `UPDATE products SET stock_quantity = stock_quantity - $qty WHERE id = $id AND stock_quantity >= $qty`.

**Sequential stock decrements in webhook:**
- Problem: Each order item's stock is decremented in a separate database query using a `for` loop with `await`.
- Files: `src/app/api/stripe/webhook/route.ts` (lines 89-98)
- Cause: Individual `prisma.product.update()` calls per item rather than a single transaction or batch update.
- Improvement path: Wrap all decrements in a `prisma.$transaction()` call for atomicity and reduced round trips.

**N+1 potential in recommendations:**
- Problem: Cart-based recommendations fetch is triggered on every cart item count change, potentially causing unnecessary API calls.
- Files: `src/app/checkout/page.tsx` (line 188 - `useEffect` depends on `items.length`)
- Cause: The dependency on `items.length` means adding/removing any item triggers a re-fetch even if the product IDs haven't changed.
- Improvement path: Depend on a memoized string of product IDs instead of `items.length`.

## Fragile Areas

**Stripe webhook handler:**
- Files: `src/app/api/stripe/webhook/route.ts`
- Why fragile: Handles payment confirmation, stock management, order status updates, and triggers 4+ notification channels (email, SMS, admin email, low stock alert) all in one request handler. A failure in any notification step could leave the system in an inconsistent state. Fire-and-forget notifications with `.then().catch()` mean notification failures are silently logged.
- Safe modification: When adding new webhook event handlers, add them as separate cases. Never modify the `checkout.session.completed` handler without testing the full payment flow. Notification failures should not affect order processing.
- Test coverage: Has test file at `src/__tests__/api/stripe-webhook.test.ts` (500 lines), but fire-and-forget patterns are inherently hard to test.

**Cart state management:**
- Files: `src/components/CartProvider.tsx`
- Why fragile: Cart is stored in localStorage only. No server-side cart validation until checkout submission. Price changes between add-to-cart and checkout are not reflected. Stock warnings are fetched once on page load and not updated.
- Safe modification: Always ensure `addItem` and `updateQuantity` maintain the invariant that `items` is serializable to JSON for localStorage.
- Test coverage: Test file exists at `src/__tests__/components/CartProvider.test.tsx` but is currently failing due to `crypto.randomUUID` mock issues.

**Auth callback chain:**
- Files: `src/lib/auth.ts`, `src/lib/auth.config.ts`
- Why fragile: The auth flow involves callbacks in two separate files (`auth.config.ts` for edge middleware, `auth.ts` for full callbacks). The `jwt` callback in `auth.config.ts` must stay in sync with the one in `auth.ts`. The `as any` casts mask type errors.
- Safe modification: Any changes to user properties stored in the JWT must be updated in both files and in the session callback.
- Test coverage: `src/__tests__/lib/admin-auth.test.ts` covers the admin auth helper but not the NextAuth callback chain itself.

## Test Coverage Gaps

**5 failing test files (43 tests):**
- What's not tested: CartProvider, ImageUploader, PushNotificationPrompt, Resend service, S3 service
- Files: `src/__tests__/components/CartProvider.test.tsx`, `src/__tests__/components/ImageUploader.test.tsx`, `src/__tests__/components/PushNotificationPrompt.test.tsx`, `src/__tests__/lib/resend.test.ts`, `src/__tests__/lib/s3.test.ts`
- Risk: Core cart functionality and external service integrations have broken test suites. Issues stem from `vi.hoisted()` mock patterns and class constructor mocking. Detailed in project MEMORY.md.
- Priority: High - these cover critical user flows (cart) and external service integrations.

**No tests for auth flow:**
- What's not tested: Registration, login, password reset, Google OAuth flow, NextAuth callbacks
- Files: `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/lib/auth.ts`
- Risk: Auth bugs could lock users out or grant unauthorized access. The role-based access control depends on JWT token contents that are never tested end-to-end.
- Priority: High

**No tests for addresses API:**
- What's not tested: Address CRUD operations, default address handling
- Files: `src/app/api/addresses/route.ts`, `src/app/api/addresses/[id]/route.ts`
- Risk: Low - secondary feature, but used during checkout flow.
- Priority: Low

**No tests for account/password APIs:**
- What's not tested: Account profile update, password change
- Files: `src/app/api/account/route.ts`, `src/app/api/account/password/route.ts`
- Risk: Medium - password change without proper old password validation could be a security issue.
- Priority: Medium

**No E2E tests:**
- What's not tested: Full user flows (browse -> add to cart -> checkout -> payment -> confirmation)
- Files: No E2E test framework detected (no Playwright, Cypress, etc.)
- Risk: Integration issues between components are only caught in production.
- Priority: Medium

## Dependencies at Risk

**NextAuth v5 beta:**
- Risk: The project uses `next-auth` v5 which was in beta. API surface may change between releases, breaking auth flow.
- Impact: Authentication for all users (customers, wholesale, admin) would break.
- Migration plan: Pin the exact version in `package.json`. Monitor for stable release and plan migration.

## Missing Critical Features

**No CSRF protection on state-changing endpoints:**
- Problem: POST endpoints like `/api/auth/register`, `/api/newsletter`, `/api/wholesale/apply` accept requests without CSRF token validation.
- Blocks: Security hardening for production use.

**No order cancellation by customer:**
- Problem: Customers cannot cancel orders themselves. Only admin can change order status.
- Blocks: Self-service order management.

**No email unsubscribe for newsletter:**
- Problem: Newsletter subscription at `src/app/api/newsletter/route.ts` has no unsubscribe mechanism. This could violate anti-spam regulations (CAN-SPAM, Australian Spam Act).
- Blocks: Legal compliance for email marketing.

**Abandoned order cleanup:**
- Problem: Orders created at checkout that are never paid (user abandons Stripe checkout) remain as PENDING orders indefinitely in the database.
- Blocks: Clean order data, accurate reporting.
- Files: `src/app/api/checkout/route.ts` creates the order before Stripe redirect; `src/app/api/stripe/webhook/route.ts` only updates on payment success/failure.

---

*Concerns audit: 2026-03-06*
