# 🛒 TASMAN-ADMIN — Full-Stack E-Commerce Admin Platform

> **Live:** [https://tasman-admin.vercel.app](https://tasman-admin.vercel.app)
>
> The complete back-office and e-commerce platform for **Tasman Star Seafoods** (Gold Coast seafood retailer). Handles product management, order processing, wholesale operations, customer management, payments, notifications (email/SMS/push), and image uploads — all from a single admin dashboard.
>
> ---
>
> ## ✨ What It Does
>
> - **Admin Dashboard** — Manage products, orders, customers, and wholesale accounts
> - - **Product Management** — CRUD operations for retail products with categories, images (S3), and related products
>   - - **Order Processing** — Track orders placed via Stripe Checkout, view order history
>     - - **Wholesale Portal** — Separate wholesale application flow (apply → pending → approved), wholesale-specific pricing, and wholesale order management
>       - - **Stripe Payments** — Checkout session creation, webhook handling for order fulfillment
>         - - **Email Notifications** — Transactional emails via Resend (order confirmations, wholesale approvals, etc.)
>           - - **SMS Notifications** — SMS alerts via Twilio (order updates, wholesale notifications)
>             - - **Push Notifications** — Web push via VAPID keys with service worker
>               - - **Image Uploads** — AWS S3 presigned URL uploads for product images
>                 - - **Customer Auth** — NextAuth v5 with Credentials + Google OAuth (Customer, Wholesale, Admin roles)
>                   - - **3D Landing Page** — Three.js / React Three Fiber hero on the customer-facing pages
>                     - - **Deals Page** — Promotions and special offers
>                      
>                       - ---
>
> ## 🛠️ Tech Stack
>
> | Category | Technology |
> |----------|-----------|
> | Framework | Next.js 16 (App Router), React 19, TypeScript |
> | Database | PostgreSQL + Prisma ORM (@prisma/adapter-pg) |
> | Auth | NextAuth v5 (beta) — Credentials + Google OAuth |
> | Payments | Stripe Checkout + Invoices |
> | Email | Resend |
> | SMS | Twilio |
> | Storage | AWS S3 (presigned uploads) |
> | Push | Web Push (VAPID) |
> | Styling | Tailwind CSS with custom theme classes |
> | 3D | Three.js / React Three Fiber |
>
> ---
>
> ## 📁 Project Structure
>
> ```
> src/
> ├── app/
> │   ├── admin/                  # Admin panel (products, orders, customers, wholesale)
> │   ├── api/
> │   │   ├── admin/              # Admin-only APIs (requireAdmin middleware)
> │   │   ├── checkout/           # Stripe checkout session creation
> │   │   ├── stripe/webhook/     # Stripe webhook handler
> │   │   ├── wholesale/          # Wholesale apply, prices, orders
> │   │   ├── upload/             # S3 presigned URL & delete
> │   │   ├── push/               # Web push subscription
> │   │   └── products/           # Product recommendations
> │   ├── auth/                   # Customer login/register
> │   ├── wholesale/              # Wholesale portal (apply, login, prices, order, pending)
> │   ├── product/[slug]/         # Product detail pages
> │   ├── checkout/               # Checkout page
> │   ├── order-confirmation/     # Post-purchase confirmation
> │   └── deals/                  # Deals/promotions page
> ├── components/
> │   ├── admin/                  # Admin-specific (ImageUploader, etc.)
> │   ├── ProductCard.tsx         # Reusable product card
> │   ├── CartProvider.tsx        # Cart context
> │   └── PushNotificationPrompt.tsx
> ├── lib/
> │   ├── prisma.ts               # Database client
> │   ├── auth.ts                 # NextAuth config
> │   ├── admin-auth.ts           # requireAdmin() middleware
> │   ├── stripe.ts               # Stripe client
> │   ├── resend.ts               # Email service + templates
> │   ├── twilio.ts               # SMS service + templates
> │   ├── s3.ts                   # AWS S3 (presigned URLs, delete)
> │   ├── web-push.ts             # Push notification service
> │   └── wholesale-notifications.ts
> └── generated/prisma/           # Generated Prisma client (don't edit)
>
> prisma/
> ├── schema.prisma               # Database schema
> ├── seed.ts                     # Seed data
> └── migrations/                 # Migration history
> ```
>
> ---
>
> ## 👤 Auth Roles
>
> | Role | Access |
> |------|--------|
> | `CUSTOMER` | Browse, cart, checkout |
> | `WHOLESALE` | Wholesale portal (status: PENDING / APPROVED / REJECTED) |
> | `ADMIN` | Full admin panel access |
>
> ---
>
> ## 🗃️ Database Models
>
> - **User** — Auth, roles, wholesale status
> - - **Product** — Retail products with categories and related products
>   - - **Order / OrderItem** — Checkout orders with Stripe integration
>     - - **Notification** — Email/SMS/Push log (order-linked or user-linked)
>       - - **WholesaleCategory / WholesalePriceItem** — Separate wholesale price list
>         - - **WholesaleOrder / WholesaleOrderItem** — Wholesale order requests
>           - - **PushSubscription** — Web push endpoints
>             - - **Address** — User delivery addresses
>              
>               - ---
>
> ## 🚀 Getting Started
>
> ### Prerequisites
> - Node.js 18+
> - - PostgreSQL database
>   - - Stripe account
>     - - AWS S3 bucket (for image uploads)
>      
>       - ### Installation
>      
>       - ```bash
>         # Clone the repo
>         git clone https://github.com/Ansh0928/TASMAN-ADMIN.git
>         cd TASMAN-ADMIN
>
>         # Install dependencies
>         npm install
>
>         # Set up environment variables
>         cp .env.example .env.local
>         # Fill in all required keys (see below)
>
>         # Run database migrations
>         npx prisma migrate dev
>
>         # Generate Prisma client
>         npx prisma generate
>
>         # Seed the database (optional)
>         npx prisma db seed
>
>         # Start development server
>         npm run dev
>         ```
>
> Open [http://localhost:3000](http://localhost:3000) to view the app.
>
> ### Environment Variables
>
> ```
> DATABASE_URL=
> NEXTAUTH_SECRET=
> NEXTAUTH_URL=
>
> GOOGLE_CLIENT_ID=
> GOOGLE_CLIENT_SECRET=
>
> STRIPE_SECRET_KEY=
> STRIPE_PUBLISHABLE_KEY=
> STRIPE_WEBHOOK_SECRET=
>
> RESEND_API_KEY=
>
> TWILIO_ACCOUNT_SID=
> TWILIO_AUTH_TOKEN=
> TWILIO_PHONE_NUMBER=
>
> AWS_S3_BUCKET_NAME=
> AWS_S3_REGION=
> AWS_ACCESS_KEY_ID=
> AWS_SECRET_ACCESS_KEY=
>
> NEXT_PUBLIC_VAPID_PUBLIC_KEY=
> VAPID_PRIVATE_KEY=
> ```
>
> ### Useful Commands
>
> ```bash
> npm run dev              # Start dev server
> npm run build            # Production build
> npx prisma migrate dev   # Run migrations
> npx prisma generate      # Regenerate Prisma client
> npx prisma studio        # Database GUI
> npx tsc --noEmit         # Type-check without building
> ```
>
> ---
>
> ## 🚢 Deployment
>
> Deployed on **Vercel** with auto-deploys from the `master` branch.
>
> **Live URL:** [https://tasman-admin.vercel.app](https://tasman-admin.vercel.app)
>
> **Stripe Webhook:** `https://tasman-admin.vercel.app/api/stripe/webhook`
> - Events: `checkout.session.completed`, `checkout.session.async_payment_failed`
>
> - ---
>
> ## 🔗 Related Tasman Projects
>
> | Project | Description | Link |
> |---------|------------|------|
> | [TASMAN-STAR](https://github.com/Ansh0928/TASMAN-STAR) | Customer-facing storefront (Shopify Storefront API) | [tasman-star.vercel.app](https://tasman-star.vercel.app) |
> | [TASMAN-STAR-transport](https://github.com/Ansh0928/TASMAN-STAR-transport) | Freight/transport booking app (mobile + admin web) | [tasman-transport-admin.vercel.app](https://tasman-transport-admin.vercel.app) |
> | [Tasman-Sales-Rep](https://github.com/Ansh0928/Tasman-Sales-Rep) | iOS sales rep visit tracker + admin dashboard | [tasman-sales-rep.vercel.app](https://tasman-sales-rep.vercel.app) |
> | [tasmanstarseafoodmarket](https://github.com/Ansh0928/tasmanstarseafoodmarket) | Marketing website (React + Vite) with product showcase | — |
>
> ---
>
> ## 📄 License
>
> MIT
