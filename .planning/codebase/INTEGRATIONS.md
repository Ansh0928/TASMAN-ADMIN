# External Integrations

**Analysis Date:** 2026-03-06

## APIs & External Services

**Payments - Stripe:**
- Purpose: Checkout payments, invoices, refunds
- SDK: `stripe` ^20.4.0 (server), `@stripe/stripe-js` ^8.8.0 (client)
- API Version: `2026-02-25.clover`
- Client: `src/lib/stripe.ts` (lazy singleton Proxy pattern)
- Auth: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- Webhook secret: `STRIPE_WEBHOOK_SECRET`
- Features used: Checkout Sessions, Invoices, Refunds (via charge.refunded)

**Email - Resend:**
- Purpose: Transactional email (order confirmations, status updates, wholesale notifications, admin alerts)
- SDK: `resend` ^6.9.2
- Client: `src/lib/resend.ts` (lazy singleton Proxy pattern)
- Auth: `RESEND_API_KEY`
- Sender: `orders@tasmanstarseafoodmarket.com.au` (configured in `EMAIL_FROM` constant)
- Email templates: All inline HTML in `src/lib/resend.ts` (branded templates with logo, header, footer)
- Email types sent:
  - Order confirmation (customer)
  - Order status update (customer)
  - Refund notification (customer)
  - Payment failure recovery (customer)
  - New order notification (admin)
  - Low stock alert (admin)
  - Wholesale application received (applicant)
  - Wholesale new application (admin)
  - Wholesale approval/rejection (applicant)
  - Wholesale price list updated (broadcast to wholesalers, via `src/lib/wholesale-notifications.ts`)
- Admin recipient: `ADMIN_NOTIFICATION_EMAIL` env var (fallback: `anshumaansaraf24@gmail.com`)

**SMS - Twilio:**
- Purpose: SMS notifications mirroring email flow
- SDK: `twilio` ^5.12.2
- Client: `src/lib/twilio.ts` (lazy singleton pattern)
- Auth: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- Sender: `TWILIO_PHONE_NUMBER`
- SMS templates (in `src/lib/twilio.ts`):
  - Order status updates (preparing, ready, delivered, cancelled)
  - Wholesale application received/approved/rejected
  - Wholesale price list updated
- Pattern: Fire-and-forget (`.then().catch()` without await)

**File Storage - AWS S3:**
- Purpose: Product image uploads
- SDK: `@aws-sdk/client-s3` ^3.1000.0, `@aws-sdk/s3-request-presigner` ^3.1000.0
- Client: `src/lib/s3.ts` (lazy singleton pattern)
- Auth: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Config: `AWS_S3_BUCKET_NAME`, `AWS_S3_REGION` (default: `ap-southeast-2`)
- Operations:
  - `generatePresignedUploadUrl()` - Client-side upload via presigned PUT (5 min expiry)
  - `deleteObject()` - Delete images from S3
  - `getPublicUrl()` - Construct public URL from key
- Key format: `{folder}/{timestamp}-{sanitized-filename}`
- Upload API: `src/app/api/upload/route.ts`
- Public URL pattern: `https://{bucket}.s3.{region}.amazonaws.com/{key}`

**Push Notifications - Web Push (VAPID):**
- Purpose: Browser push notifications
- SDK: `web-push` ^3.6.7
- Client: `src/lib/web-push.ts`
- Auth: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- Contact: `mailto:info@tasmanstar.com.au`
- Service worker: `public/sw.js`
- Subscription storage: `PushSubscription` model in database
- Subscription API: `src/app/api/push/`
- UI component: `src/components/PushNotificationPrompt.tsx`

## Data Storage

**Database - PostgreSQL (Neon):**
- Provider: Neon Serverless PostgreSQL 17.8
- Region: `ap-southeast-2` (Sydney)
- Connection: `DATABASE_URL` env var
- Client: Prisma ORM with `@prisma/adapter-pg` (driver-based adapter)
- Connection pool: `pg.Pool` with max 5 connections, 30s idle timeout, 10s connect timeout
- Schema: `prisma/schema.prisma`
- Generated client output: `src/generated/prisma/`
- Prisma client: `src/lib/prisma.ts` (global singleton, cached in dev)
- Models: User, Address, Category, Product, Order, OrderItem, Notification, WholesaleCategory, WholesalePriceItem, WholesaleOrder, WholesaleOrderItem, PushSubscription, NewsletterSubscription, Review

**File Storage:**
- AWS S3 bucket for product images (see AWS S3 section above)

**Caching:**
- None (no Redis or external cache service)

## Authentication & Identity

**Auth Provider - NextAuth v5 (beta):**
- Config: `src/lib/auth.ts` (full config), `src/lib/auth.config.ts` (edge-compatible subset for middleware)
- Strategy: JWT-based sessions (30 day max age)
- Providers:
  1. **Google OAuth** - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  2. **Credentials** - Email/password with bcrypt comparison
- Custom pages: `/auth/login` (sign in), `/auth/error` (error)
- Password hashing: `bcryptjs` ^3.0.3
- Session data: `id`, `email`, `name`, `role`, `wholesaleStatus`
- Google sign-in flow: Auto-creates user in DB if new, links Google to existing email accounts
- Admin protection: `src/lib/admin-auth.ts` - `requireAdmin()` middleware checks session role

**Roles:**
- `CUSTOMER` - Default role, retail shopping
- `WHOLESALE` - Wholesale access (with status: PENDING, APPROVED, REJECTED)
- `ADMIN` - Full admin panel access

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, etc.)

**Logs:**
- `console.error()` for failures (caught in service functions)
- `console.warn()` for non-critical issues (e.g., missing VAPID keys)
- Notification model in database tracks SENT/FAILED status for all emails, SMS, and push

## CI/CD & Deployment

**Hosting:**
- Vercel (serverless)
- Production URL: `https://tasman-admin.vercel.app/`
- Domain: `tasmanstarseafoodmarket.com.au` (referenced in emails)

**CI Pipeline:**
- None detected (no `.github/workflows/`, no CI config files)

**Build Process:**
- `prisma generate && next build` (npm run build)
- Prisma client generated at build time

## Webhooks & Callbacks

**Incoming Webhooks:**

**Stripe Webhook:**
- Endpoint: `src/app/api/stripe/webhook/route.ts`
- URL: `https://tasman-admin.vercel.app/api/stripe/webhook`
- Verification: `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- Events handled:
  1. `checkout.session.completed` - Confirms order, decrements stock, sends confirmation email/SMS, sends admin notification, checks low stock
  2. `checkout.session.async_payment_failed` - Cancels order, sends failure email/SMS
  3. `charge.refunded` - Updates refund status, sends refund notification email/SMS

**Outgoing Webhooks:**
- None

## Environment Configuration

**Required env vars:**
```
# Database
DATABASE_URL

# Auth
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Payments
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

# Email
RESEND_API_KEY

# SMS
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

# Storage
AWS_S3_BUCKET_NAME
AWS_S3_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
```

**Optional env vars:**
```
ADMIN_NOTIFICATION_EMAIL    # Defaults to anshumaansaraf24@gmail.com
```

**Secrets location:**
- Local: `.env` file (gitignored)
- Production: Vercel environment variables

## Integration Patterns

**Lazy Singleton with Proxy:**
All external service clients use the same initialization pattern to avoid cold-start overhead. The Proxy ensures the client is only initialized on first use:
```typescript
// Pattern used in: stripe.ts, resend.ts, twilio.ts, s3.ts
let _client: Client | null = null;
function getClient(): Client { /* init on first use */ }
export const client = new Proxy({} as Client, {
    get(_, prop) { return (getClient() as any)[prop]; }
});
```

**Fire-and-Forget Notifications:**
Non-critical notifications (SMS, admin emails, low stock alerts) use `.then().catch()` without `await` to avoid blocking API responses. The result is logged to the `Notification` model asynchronously.

**Notification Logging:**
All email, SMS, and push notifications are logged in the `notifications` table with type, recipient, category, and SENT/FAILED status. Notifications can be linked to an order (`orderId`) or user (`userId`).

---

*Integration audit: 2026-03-06*
