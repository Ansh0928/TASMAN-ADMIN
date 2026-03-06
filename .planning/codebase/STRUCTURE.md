# Codebase Structure

**Analysis Date:** 2026-03-06

## Directory Layout

```
tasman-star-seafood/
├── prisma/
│   ├── schema.prisma           # Database schema (models, enums, relations)
│   ├── seed.ts                 # Database seeder
│   └── migrations/             # Prisma migration history
├── public/
│   ├── sw.js                   # Service worker for push notifications
│   └── assets/                 # Static images (logo, product photos, store photos)
│       └── products/           # Product images (local fallbacks)
├── scripts/                    # Utility scripts
├── src/
│   ├── middleware.ts            # Next.js Edge middleware (auth cookie check)
│   ├── app/                    # Next.js App Router (pages + API routes)
│   │   ├── layout.tsx          # Root layout (providers, header, footer)
│   │   ├── page.tsx            # Landing page (bento grid, carousels)
│   │   ├── globals.css         # CSS custom properties, theme definitions
│   │   ├── error.tsx           # Global error boundary
│   │   ├── loading.tsx         # Global loading skeleton
│   │   ├── not-found.tsx       # 404 page
│   │   ├── sitemap.ts          # Dynamic sitemap generation
│   │   ├── robots.ts           # robots.txt generation
│   │   ├── api/                # API route handlers
│   │   ├── admin/              # Admin panel pages
│   │   ├── auth/               # Auth pages (login, register, forgot/reset password)
│   │   ├── wholesale/          # Wholesale portal pages
│   │   ├── product/[slug]/     # Product detail page (SSR + client)
│   │   ├── checkout/           # Checkout page
│   │   ├── order-confirmation/ # Post-purchase page
│   │   ├── account/            # User account (addresses, orders)
│   │   ├── our-products/       # Product listing/browse
│   │   ├── deals/              # Deals/promotions page
│   │   ├── search/             # Search results page
│   │   ├── about/              # About page
│   │   ├── our-business/       # Business info sub-pages
│   │   ├── our-partner/        # Partner page
│   │   └── unauthorized/       # Unauthorized access page
│   ├── components/             # Shared React components
│   │   ├── admin/              # Admin-only components
│   │   ├── map/                # Map/regional components
│   │   └── ui/                 # Reusable UI primitives
│   ├── lib/                    # Service libraries (singletons, auth, utils)
│   ├── types/                  # TypeScript type augmentations
│   ├── data/                   # Static data files
│   └── generated/prisma/       # Generated Prisma client (DO NOT EDIT)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration (if present)
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── CLAUDE.md                   # Project instructions
```

## Directory Purposes

**`src/app/api/`** — API Route Handlers:
- Purpose: Backend REST-style endpoints
- Contains: `route.ts` files exporting HTTP method handlers (GET, POST, PATCH, DELETE)
- Key subdirectories:
  - `api/admin/` — Admin-protected endpoints (products, orders, customers, categories, coupons, wholesale, stats, notifications)
  - `api/auth/` — NextAuth catch-all, register, forgot-password, reset-password
  - `api/checkout/` — Stripe checkout session creation, coupon validation
  - `api/stripe/webhook/` — Stripe event handler
  - `api/wholesale/` — Wholesale apply, prices, orders
  - `api/upload/` — S3 presigned URL generation, file deletion
  - `api/push/subscribe/` — Web push subscription management
  - `api/products/` — Product listing, detail, recommendations, stock check

**`src/app/admin/`** — Admin Panel Pages:
- Purpose: Admin dashboard for managing the store
- Contains: Client components fetching from `/api/admin/*`
- Key pages: `products/`, `orders/`, `customers/`, `categories/`, `coupons/`, `wholesale/`, `wholesale-orders/`, `notifications/`, `login/`

**`src/app/wholesale/`** — Wholesale Portal:
- Purpose: Wholesale customer-facing pages
- Contains: Apply form, login, price list view, order form, pending status page
- Key pages: `apply/`, `login/`, `prices/`, `order/`, `pending/`

**`src/components/`** — Shared Components:
- Purpose: Reusable React components used across pages
- Key files:
  - `CartProvider.tsx` — Cart context + localStorage persistence
  - `CartSidebar.tsx` — Slide-out cart drawer
  - `CartIcon.tsx` — Header cart icon with item count badge
  - `WishlistProvider.tsx` — Wishlist context + localStorage
  - `ProductCard.tsx` — Product card used in listings/carousels
  - `ProductCarousel.tsx` — Horizontal product carousel
  - `SearchBar.tsx` — Header search with dropdown results
  - `UserMenu.tsx` — User dropdown menu (login/account/admin links)
  - `SessionProvider.tsx` — NextAuth SessionProvider wrapper
  - `ThemeProvider.tsx` — Dark/light theme context
  - `ThemeToggle.tsx` — Theme switcher button
  - `MobileMenu.tsx` — Mobile navigation drawer
  - `Footer.tsx` — Site footer
  - `PushNotificationPrompt.tsx` — Push notification opt-in UI

**`src/components/admin/`** — Admin Components:
- `ImageUploader.tsx` — Drag-and-drop image upload to S3 with reordering

**`src/components/ui/`** — UI Primitives:
- `button.tsx`, `calendar.tsx`, `popover.tsx` — Basic UI components
- `glowing-effect.tsx` — Decorative glow effect
- `scroll-expansion-hero.tsx` — Scroll-based hero animation
- `bento-grid.tsx` — Bento grid layout component
- `circular-testimonials.tsx`, `stagger-testimonials.tsx` — Testimonial displays

**`src/lib/`** — Service Libraries:
- Purpose: External service clients, auth, utilities
- Key files:
  - `prisma.ts` — Prisma client with PG pool (singleton, hot-reload safe)
  - `auth.ts` — Full NextAuth v5 config (Credentials + Google providers, callbacks)
  - `auth.config.ts` — Edge-compatible auth config subset (used by middleware)
  - `admin-auth.ts` — `requireAdmin()` guard function
  - `stripe.ts` — Stripe client (lazy singleton Proxy)
  - `resend.ts` — Resend email client + all email template functions
  - `twilio.ts` — Twilio SMS client + SMS template functions
  - `s3.ts` — S3 client, presigned URL generation, file deletion
  - `web-push.ts` — Web Push notification sender
  - `wholesale-notifications.ts` — Broadcast notifications to wholesale users
  - `utils.ts` — `cn()` utility (clsx + tailwind-merge)

**`src/types/`** — Type Declarations:
- `next-auth.d.ts` — NextAuth session/JWT type augmentation (adds `role`, `wholesaleStatus`)

**`src/data/`** — Static Data:
- `platform-content.ts` — Static content data for pages

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout — providers, header, nav, footer
- `src/app/page.tsx`: Landing page (client component with bento grid)
- `src/middleware.ts`: Edge middleware for route protection
- `next.config.ts`: Next.js config (image remote patterns)

**Configuration:**
- `prisma/schema.prisma`: Database schema
- `src/lib/auth.ts`: Full auth configuration
- `src/lib/auth.config.ts`: Edge-compatible auth config
- `src/app/globals.css`: Theme CSS custom properties
- `next.config.ts`: Image domains, Next.js settings

**Core Business Logic:**
- `src/app/api/checkout/route.ts`: Retail checkout (order creation, Stripe session)
- `src/app/api/stripe/webhook/route.ts`: Payment confirmation, stock management, notifications
- `src/app/api/admin/orders/[id]/route.ts`: Order status management with notifications
- `src/app/api/wholesale/orders/route.ts`: Wholesale order creation
- `src/lib/resend.ts`: All email templates and sending logic
- `src/lib/twilio.ts`: SMS templates and sending logic

**Auth:**
- `src/lib/auth.ts`: NextAuth config with Credentials + Google
- `src/lib/admin-auth.ts`: Admin role guard
- `src/middleware.ts`: Cookie-based route protection
- `src/app/api/auth/register/route.ts`: User registration
- `src/app/api/auth/forgot-password/route.ts`: Password reset initiation

**Testing:**
- `src/__tests__/`: All test files
- `src/__tests__/api/admin/`: Admin API route tests
- `src/__tests__/components/`: Component tests
- `src/__tests__/lib/`: Library unit tests
- `src/__tests__/helpers/`: Test utilities

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx`
- API routes: `route.ts`
- Components: PascalCase (`ProductCard.tsx`, `CartProvider.tsx`)
- Libraries: kebab-case (`admin-auth.ts`, `web-push.ts`, `wholesale-notifications.ts`)
- Tests: `*.test.ts` / `*.test.tsx` mirroring source structure

**Directories:**
- App routes: kebab-case (`order-confirmation/`, `our-products/`)
- Dynamic routes: `[param]` (`[slug]/`, `[id]/`)
- Component dirs: kebab-case or flat (`admin/`, `ui/`, `map/`)

**Exports:**
- Components: default export (PascalCase function name)
- Context hooks: named export (`useCart`, `useWishlist`)
- API route handlers: named exports (`GET`, `POST`, `PATCH`, `DELETE`)
- Library functions: named exports (`requireAdmin`, `sendSMS`, `generatePresignedUploadUrl`)
- Service singletons: named export (`prisma`, `stripe`, `resend`)

## Where to Add New Code

**New Customer-Facing Page:**
- Create directory: `src/app/{page-name}/page.tsx`
- Server component for data fetching, delegate to client component for interactivity
- Follow pattern in `src/app/product/[slug]/page.tsx`

**New API Endpoint:**
- Public: `src/app/api/{resource}/route.ts`
- Admin-protected: `src/app/api/admin/{resource}/route.ts` (use `requireAdmin()`)
- With ID param: `src/app/api/{resource}/[id]/route.ts`
- Export named functions: `GET`, `POST`, `PATCH`, `DELETE`

**New Admin Page:**
- Create: `src/app/admin/{section}/page.tsx` (use `'use client'`)
- Fetch from corresponding `/api/admin/{section}` endpoint
- Follow pattern in `src/app/admin/products/page.tsx`

**New Shared Component:**
- Place in: `src/components/{ComponentName}.tsx`
- Admin-specific: `src/components/admin/{ComponentName}.tsx`
- UI primitive: `src/components/ui/{component-name}.tsx`

**New External Service Integration:**
- Create: `src/lib/{service-name}.ts`
- Use lazy singleton pattern (see `src/lib/stripe.ts` for reference)
- Add env var to `.env` and document in `CLAUDE.md`

**New Email Template:**
- Add function to: `src/lib/resend.ts` (all email templates live here)
- Follow existing pattern: exported async function returning `{ success: boolean }`

**New SMS Template:**
- Add function to: `src/lib/twilio.ts`
- Follow existing pattern: function returning message string

**New Database Model:**
- Add to: `prisma/schema.prisma`
- Run: `npx prisma migrate dev` then `npx prisma generate`
- Generated client updates in `src/generated/prisma/`

**New Test:**
- Unit test: `src/__tests__/lib/{module}.test.ts`
- Component test: `src/__tests__/components/{Component}.test.tsx`
- API test: `src/__tests__/api/{route}.test.ts`

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (currently only has `cn()`)
- Consider creating `src/lib/{domain}-utils.ts` for domain-specific helpers

## Special Directories

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client
- Generated: Yes (via `npx prisma generate`)
- Committed: Yes
- DO NOT edit manually

**`prisma/migrations/`:**
- Purpose: Database migration SQL files
- Generated: Yes (via `npx prisma migrate dev`)
- Committed: Yes
- DO NOT edit after applied

**`public/assets/`:**
- Purpose: Static images served at `/assets/*`
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: Planning and analysis documents
- Generated: By tooling
- Committed: Yes

---

*Structure analysis: 2026-03-06*
