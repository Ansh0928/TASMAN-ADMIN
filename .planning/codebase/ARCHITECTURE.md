# Architecture

**Analysis Date:** 2026-03-06

## Pattern Overview

**Overall:** Next.js App Router monolith with server-rendered pages, client-side interactivity, and API route handlers

**Key Characteristics:**
- Server Components for data fetching (product pages, admin pages), Client Components for interactivity
- API Route Handlers serve as the backend — no separate API server
- Prisma ORM with PostgreSQL adapter (`@prisma/adapter-pg`) for all database access
- External services (Stripe, Resend, Twilio, S3, Web Push) accessed via lazy singleton pattern in `src/lib/`
- Fire-and-forget notification pattern for non-blocking email/SMS/push delivery
- JWT-based auth via NextAuth v5 with role-based access control (CUSTOMER, WHOLESALE, ADMIN)
- Two parallel commerce flows: retail (Stripe Checkout) and wholesale (order request system)

## Layers

**Presentation Layer (Pages & Components):**
- Purpose: Render UI, handle user interaction
- Location: `src/app/` (pages), `src/components/` (shared components)
- Contains: Server Components (data fetching), Client Components (`'use client'`), layouts
- Depends on: API routes (via fetch), lib services (server components only), React context providers
- Used by: End users via browser

**API Layer (Route Handlers):**
- Purpose: Handle HTTP requests, validate input, orchestrate business logic
- Location: `src/app/api/`
- Contains: REST-style route handlers exporting GET/POST/PATCH/DELETE functions
- Depends on: `src/lib/` services (prisma, stripe, resend, twilio, s3, web-push, admin-auth)
- Used by: Client components (fetch), Stripe webhooks, external systems

**Service Layer (Libraries):**
- Purpose: Provide singleton access to external services, encapsulate business logic
- Location: `src/lib/`
- Contains: Client initialization, email templates, SMS templates, auth config
- Depends on: Environment variables, external SDKs
- Used by: API route handlers, server components

**Data Layer (Prisma + PostgreSQL):**
- Purpose: Data persistence and querying
- Location: `prisma/schema.prisma` (schema), `src/lib/prisma.ts` (client), `src/generated/prisma/` (generated)
- Contains: Schema definitions, migrations, generated client
- Depends on: PostgreSQL (Neon)
- Used by: API route handlers, server components, `src/lib/` services

**Auth Layer:**
- Purpose: Authentication, session management, route protection
- Location: `src/lib/auth.ts` (full config), `src/lib/auth.config.ts` (edge-compatible), `src/middleware.ts`, `src/lib/admin-auth.ts`
- Contains: NextAuth v5 configuration, JWT callbacks, middleware route matching
- Depends on: Prisma (user lookup), bcryptjs (password), Google OAuth
- Used by: Middleware (cookie check), API routes (session), server components (session), layout (nav rendering)

## Data Flow

**Retail Checkout Flow:**

1. User adds items to cart (client-side `CartProvider` with localStorage persistence at `src/components/CartProvider.tsx`)
2. Checkout page collects contact info + delivery/pickup details (`src/app/checkout/`)
3. POST to `src/app/api/checkout/route.ts` — validates items, checks stock, calculates server-side prices, creates Order in DB, creates Stripe Checkout Session
4. User redirected to Stripe Checkout for payment
5. On success: Stripe fires `checkout.session.completed` webhook to `src/app/api/stripe/webhook/route.ts`
6. Webhook handler: updates order to CONFIRMED, decrements stock, retrieves invoice URL, sends confirmation email + SMS + admin notification (fire-and-forget)
7. User sees order confirmation at `src/app/order-confirmation/`

**Wholesale Order Flow:**

1. Wholesale user applies via `src/app/api/wholesale/apply/route.ts` (creates WHOLESALE user with PENDING status)
2. Admin approves/rejects at `src/app/api/admin/wholesale/[id]/route.ts`
3. Approved wholesalers view price list at `src/app/wholesale/prices/` (fetches from `src/app/api/wholesale/prices/route.ts`)
4. Wholesale order submitted to `src/app/api/wholesale/orders/route.ts` (creates WholesaleOrder, no Stripe)
5. Admin manages wholesale orders at `src/app/api/admin/wholesale-orders/[id]/route.ts`

**Admin Order Status Update Flow:**

1. Admin updates order status via PATCH to `src/app/api/admin/orders/[id]/route.ts`
2. Handler sends push notification (if user has subscription), email, and SMS on status transitions (PREPARING, READY, DELIVERED, CANCELLED)
3. All notifications logged to `notifications` table

**State Management:**
- Cart: React Context + localStorage (`src/components/CartProvider.tsx`)
- Wishlist: React Context + localStorage (`src/components/WishlistProvider.tsx`)
- Auth session: NextAuth JWT in httpOnly cookie, accessed server-side via `auth()`, client-side via `useSession()`
- Theme: React Context + `data-theme` attribute on `<html>` (`src/components/ThemeProvider.tsx`)
- No global state management library (no Redux/Zustand)

## Key Abstractions

**Lazy Singleton Proxy (External Services):**
- Purpose: Defer client initialization until first use, share single instance
- Examples: `src/lib/stripe.ts`, `src/lib/s3.ts`
- Pattern: Module-level `let _client = null`, `getClient()` factory, exported Proxy that delegates to `getClient()`

**requireAdmin() Guard:**
- Purpose: Protect admin API routes with single function call
- Examples: `src/lib/admin-auth.ts`, used in all `src/app/api/admin/*/route.ts`
- Pattern: Returns `{ error, session }` — callers check `if (error) return error;`

**Fire-and-Forget Notifications:**
- Purpose: Send email/SMS/push without blocking the API response
- Examples: `src/app/api/stripe/webhook/route.ts`, `src/app/api/admin/orders/[id]/route.ts`
- Pattern: `sendEmail(...).then(async (result) => { await prisma.notification.create(...) }).catch(err => console.error(...))`

**Notification Logging:**
- Purpose: Track all notification delivery attempts
- Examples: All notification sends create a `Notification` record
- Pattern: After send attempt, create record with type (EMAIL/SMS/PUSH), recipient, category, status (SENT/FAILED)

**Server-Side Price Calculation:**
- Purpose: Prevent client-side price tampering
- Examples: `src/app/api/checkout/route.ts`
- Pattern: Ignore client-submitted prices, recalculate from DB using `decimal.js`, validate stock server-side

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Fetches auth session, wraps app in SessionProvider > ThemeProvider > CartProvider > WishlistProvider, renders header/nav/footer/cart sidebar

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Requests matching `/admin/*` (except login), `/wholesale/prices`, `/account/*`
- Responsibilities: Cookie-based login check only (no role validation). Redirects to appropriate login page. Full auth + role validation happens at page/API level.

**Stripe Webhook:**
- Location: `src/app/api/stripe/webhook/route.ts`
- Triggers: Stripe events (checkout.session.completed, checkout.session.async_payment_failed, charge.refunded)
- Responsibilities: Order confirmation, stock decrement, invoice retrieval, multi-channel notifications, refund processing

**API Auth Catch-All:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: All NextAuth sign-in/sign-out/session requests
- Responsibilities: Delegates to NextAuth handlers from `src/lib/auth.ts`

## Error Handling

**Strategy:** Try-catch with JSON error responses and console.error logging

**Patterns:**
- API routes wrap handler body in try-catch, return `NextResponse.json({ message }, { status })` on error
- Stripe webhook verifies signature before processing, returns 400 on invalid signature
- Fire-and-forget notifications use `.catch(err => console.error(...))` to prevent unhandled rejections
- Client-side error boundary at `src/app/error.tsx` catches rendering errors
- Product pages use `notFound()` from `next/navigation` for missing products
- Prisma pool has `pool.on('error', ...)` handler for unexpected connection errors (`src/lib/prisma.ts`)

## Cross-Cutting Concerns

**Logging:** `console.error` throughout — no structured logging framework. Error logging in API routes and notification handlers.

**Validation:** Manual validation in API route handlers (no validation library like Zod). Input checks at top of handler, return 400 with message on failure. See `src/app/api/checkout/route.ts` for comprehensive example.

**Authentication:** Two-tier approach:
1. Middleware (`src/middleware.ts`): Cookie presence check for protected routes (edge-compatible, no DB access)
2. API/Page level: `auth()` for session + `requireAdmin()` for admin role check

**Theming:** CSS custom properties in `src/app/globals.css` with dark/light themes via `data-theme` attribute. Manual utility classes (`.bg-theme-primary`, `.text-theme-secondary`, etc.) because Tailwind semantic names collide with theme property names.

**Image Handling:** Product images stored on AWS S3 via presigned upload URLs. Upload flow: client requests presigned URL from `src/app/api/upload/presign/route.ts`, uploads directly to S3, stores resulting URL. Admin component: `src/components/admin/ImageUploader.tsx`.

---

*Architecture analysis: 2026-03-06*
