# Technology Stack

**Analysis Date:** 2026-03-06

## Languages

**Primary:**
- TypeScript ^5 - All application code (`src/`, `prisma/seed.ts`)

**Secondary:**
- JavaScript - Service worker (`public/sw.js`), config files (`postcss.config.mjs`)

## Runtime

**Environment:**
- Node.js (no `.nvmrc` — version not pinned)
- Target: ES2017 (per `tsconfig.json` compilerOptions)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework (App Router)
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**Testing:**
- Vitest 4.0.18 - Test runner (`vitest.config.ts`)
- @testing-library/react 16.3.2 - Component testing
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @testing-library/user-event 14.6.1 - User interaction simulation
- jsdom 28.1.0 - Browser environment for tests

**Build/Dev:**
- TypeScript ^5 - Type checking (`npx tsc --noEmit`)
- Tailwind CSS ^4 - Utility-first CSS (via `@tailwindcss/postcss`)
- PostCSS - CSS processing (`postcss.config.mjs`)
- ESLint ^9 + eslint-config-next - Linting
- Prisma CLI ^7.4.1 - Database schema management and migrations
- tsx ^4.21.0 - TypeScript execution for seed scripts

## Key Dependencies

**Critical:**
- `next` 16.1.6 - Application framework
- `@prisma/client` ^7.4.1 - Database ORM client
- `@prisma/adapter-pg` ^7.4.1 - PostgreSQL adapter for Prisma (driver-based)
- `pg` ^8.19.0 - PostgreSQL client (used via Prisma adapter)
- `next-auth` ^5.0.0-beta.30 - Authentication (beta release)
- `stripe` ^20.4.0 - Server-side Stripe SDK
- `@stripe/stripe-js` ^8.8.0 - Client-side Stripe SDK

**Infrastructure:**
- `resend` ^6.9.2 - Transactional email API
- `twilio` ^5.12.2 - SMS messaging
- `@aws-sdk/client-s3` ^3.1000.0 - AWS S3 file storage
- `@aws-sdk/s3-request-presigner` ^3.1000.0 - Presigned URL generation
- `web-push` ^3.6.7 - Web Push notifications (VAPID)
- `bcryptjs` ^3.0.3 - Password hashing

**UI/UX:**
- `tailwind-merge` ^3.5.0 - Tailwind class merging
- `class-variance-authority` ^0.7.1 - Component variant management
- `clsx` ^2.1.1 - Conditional class names
- `lucide-react` ^0.575.0 - Icon library
- `react-icons` ^5.5.0 - Additional icons
- `framer-motion` ^12.34.4 / `motion` ^12.34.4 - Animations
- `sonner` ^2.0.7 - Toast notifications
- `@radix-ui/react-popover` ^1.1.15 - Accessible popover primitives
- `@radix-ui/react-slot` ^1.2.4 - Slot pattern primitive
- `react-day-picker` ^9.14.0 - Date picker component

**3D/Visual:**
- `three` ^0.183.1 - 3D rendering engine
- `@react-three/fiber` ^9.5.0 - React renderer for Three.js
- `@react-three/drei` ^10.7.7 - Three.js helpers and abstractions

**Data:**
- `decimal.js` ^10.6.0 - Precise decimal arithmetic
- `date-fns` ^4.1.0 - Date formatting utilities
- `sharp` ^0.34.5 - Image optimization (used by Next.js)

**Maps:**
- `@vnedyalk0v/react19-simple-maps` ^2.0.2 - Map visualization (React 19 compatible fork)

## Configuration

**TypeScript:**
- Config: `tsconfig.json`
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Module resolution: bundler
- JSX: react-jsx

**Tailwind CSS:**
- Version 4 (PostCSS plugin-based, no `tailwind.config.*`)
- Config: `postcss.config.mjs` with `@tailwindcss/postcss` plugin
- Custom theme classes: `text-theme-text`, `bg-theme-primary`, `border-theme-border`, `text-theme-accent` (#FF8543)

**ESLint:**
- Config: `eslint.config.mjs` (ESLint 9 flat config)
- Extends: `eslint-config-next`

**Vitest:**
- Config: `vitest.config.ts`
- Environment: jsdom
- Setup file: `src/__tests__/setup.ts`
- Test pattern: `src/__tests__/**/*.test.{ts,tsx}`
- Coverage: v8 provider, covers `src/app/api/**`, `src/lib/**`, `src/components/**`

**Next.js:**
- Config: `next.config.ts`
- Remote image patterns: Shopify CDN, Unsplash, AWS S3 bucket
- No custom webpack config

**Environment:**
- `.env` file present (contains all secrets and connection strings)
- See Environment Variables section in INTEGRATIONS.md for full list

**Build:**
- Build script: `prisma generate && next build` (generates Prisma client before building)
- Prisma output: `src/generated/prisma/` (generated, not committed)

## Platform Requirements

**Development:**
- Node.js (version not pinned)
- PostgreSQL database (remote Neon instance)
- npm for package management

**Production:**
- Vercel (serverless deployment)
- Deployed at: `https://tasman-admin.vercel.app/`
- Neon PostgreSQL (Sydney region, `ap-southeast-2`)
- Connection pooling configured: max 5 connections, 30s idle timeout, 10s connect timeout

## NPM Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # prisma generate && next build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:generate  # npx prisma generate
npm run db:migrate   # npx prisma migrate dev
npm run db:seed      # npx tsx prisma/seed.ts
npm run db:studio    # npx prisma studio
npm run test         # vitest run
npm run test:watch   # vitest (watch mode)
npm run test:coverage # vitest run --coverage
```

---

*Stack analysis: 2026-03-06*
