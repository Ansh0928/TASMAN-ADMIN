# Tasman Star Seafood - Project Guide

## Overview
E-commerce platform for Tasman Star Seafoods (Gold Coast seafood retailer). Built with Next.js 16, PostgreSQL/Prisma, NextAuth, Stripe, Resend (email), Twilio (SMS), and AWS S3.

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** PostgreSQL + Prisma ORM (with `@prisma/adapter-pg`)
- **Auth:** NextAuth v5 (beta) — Credentials + Google OAuth
- **Payments:** Stripe Checkout + Invoices
- **Email:** Resend (sender: `onboarding@resend.dev` free tier)
- **SMS:** Twilio
- **Storage:** AWS S3 (presigned uploads)
- **Push:** Web Push (VAPID)
- **Styling:** Tailwind CSS with custom theme classes
- **3D:** Three.js / React Three Fiber (landing page)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npx prisma migrate dev` — Run migrations
- `npx prisma generate` — Regenerate Prisma client
- `npx prisma studio` — Database GUI
- `npx tsc --noEmit` — Type-check without building

## Project Structure
```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── admin/              # Admin panel (products, orders, customers, wholesale)
│   ├── api/                # API routes
│   │   ├── admin/          # Admin-only APIs (requireAdmin middleware)
│   │   ├── checkout/       # Stripe checkout session creation
│   │   ├── stripe/webhook/ # Stripe webhook handler
│   │   ├── wholesale/      # Wholesale apply, prices, orders
│   │   ├── upload/         # S3 presigned URL & delete
│   │   ├── push/           # Web push subscription
│   │   └── products/       # Product recommendations
│   ├── auth/               # Customer login/register
│   ├── wholesale/          # Wholesale portal (apply, login, prices, order, pending)
│   ├── product/[slug]/     # Product detail (server + client components)
│   ├── checkout/           # Checkout page
│   ├── order-confirmation/ # Post-purchase confirmation
│   └── deals/              # Deals/promotions page
├── components/             # Shared React components
│   ├── admin/              # Admin-specific (ImageUploader)
│   ├── ProductCard.tsx     # Reusable product card
│   ├── CartProvider.tsx    # Cart context
│   ├── PushNotificationPrompt.tsx
│   └── ...
├── lib/                    # Service libraries (lazy singleton pattern)
│   ├── prisma.ts           # Database client
│   ├── auth.ts             # NextAuth config
│   ├── admin-auth.ts       # requireAdmin() middleware
│   ├── stripe.ts           # Stripe client
│   ├── resend.ts           # Email service + templates
│   ├── twilio.ts           # SMS service + templates
│   ├── s3.ts               # AWS S3 (presigned URLs, delete)
│   ├── web-push.ts         # Push notification service
│   └── wholesale-notifications.ts  # Broadcast to wholesalers
└── generated/prisma/       # Generated Prisma client (don't edit)
prisma/
├── schema.prisma           # Database schema
├── seed.ts                 # Seed data
└── migrations/             # Migration history
public/
├── sw.js                   # Service worker for push notifications
└── assets/                 # Static images
```

## Key Patterns

### Lazy Singleton Services
All external service clients (`resend.ts`, `stripe.ts`, `twilio.ts`, `s3.ts`) use a lazy singleton with Proxy pattern:
```typescript
let _client: Client | null = null;
function getClient(): Client { /* init on first use */ }
export const client = new Proxy({} as Client, { get(_, prop) { return (getClient() as any)[prop]; } });
```

### Auth Roles
- **CUSTOMER** — Default, can browse and checkout
- **WHOLESALE** — With status: PENDING, APPROVED, REJECTED
- **ADMIN** — Full admin panel access

### Admin API Protection
All admin routes use `requireAdmin()` from `@/lib/admin-auth`:
```typescript
const { error } = await requireAdmin();
if (error) return error;
```

### Theme Classes
Use Tailwind theme classes (not hardcoded colors):
- `text-theme-text`, `text-theme-text-muted`
- `bg-theme-primary`, `bg-theme-secondary`
- `border-theme-border`
- `text-theme-accent`, `bg-theme-accent` (orange #FF8543)

### Fire-and-Forget Notifications
Email/SMS notifications use `.then().catch()` without await to avoid blocking API responses.

## Database Models
- **User** — Auth, roles, wholesale status
- **Product** — Retail products with categories, related products
- **Order / OrderItem** — Checkout orders with Stripe
- **Notification** — Email/SMS/Push log (can be order-linked or user-linked)
- **WholesaleCategory / WholesalePriceItem** — Separate wholesale price list with specials/featured
- **WholesaleOrder / WholesaleOrderItem** — Wholesale order requests
- **PushSubscription** — Web push endpoints
- **Address** — User delivery addresses

## Environment Variables
```
DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
AWS_S3_BUCKET_NAME, AWS_S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
```

## Deployment
- Hosted on **Vercel** at https://tasman-admin.vercel.app/
- Stripe webhook endpoint: `https://tasman-admin.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_failed`
