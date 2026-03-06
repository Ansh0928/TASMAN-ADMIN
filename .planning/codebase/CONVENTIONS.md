# Coding Conventions

**Analysis Date:** 2026-03-06

## Naming Patterns

**Files:**
- React components: PascalCase (`ProductCard.tsx`, `CartProvider.tsx`, `ImageUploader.tsx`)
- Lib/service modules: kebab-case (`admin-auth.ts`, `web-push.ts`, `wholesale-notifications.ts`)
- API routes: `route.ts` inside directory-based paths (`src/app/api/checkout/route.ts`)
- Test files: mirror source structure under `src/__tests__/` with `.test.ts` / `.test.tsx` suffix
- CSS: `globals.css` in `src/app/`

**Functions:**
- camelCase for all functions: `requireAdmin()`, `sendSMS()`, `generatePresignedUploadUrl()`
- React components: PascalCase default exports: `export default function ProductCard()`
- SMS template functions: descriptive camelCase (`wholesaleApprovedSMS()`, `sendOrderStatusSMS()`)
- Email functions: prefixed with `send` (`sendOrderConfirmationEmail()`, `sendRefundNotificationEmail()`)

**Variables:**
- camelCase for local variables: `serverSubtotal`, `stripeCustomerId`, `validatedCouponId`
- UPPER_SNAKE_CASE for module-level constants: `EMAIL_FROM`, `CART_STORAGE_KEY`, `VAPID_PUBLIC_KEY`
- Private singleton instances prefixed with underscore: `_client`, `_resend`, `_stripe`, `_s3`

**Types/Interfaces:**
- PascalCase with descriptive names: `OrderEmailData`, `CartItem`, `ProductCardData`
- Props interfaces suffixed with `Props`: `ProductCardProps`
- Context types suffixed with `Type` or `ContextType`: `CartContextType`
- Use `interface` for object shapes, `type` for unions/aliases: `export type CartItem = { ... }`

## Code Style

**Formatting:**
- No Prettier config detected -- relies on editor defaults and ESLint
- 4-space indentation in most files
- Single quotes for strings
- Trailing commas in multi-line constructs
- Semicolons required

**Linting:**
- ESLint 9 with flat config at `eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- No custom rules -- inherits all Next.js recommended rules

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. External packages (`next/server`, `react`, `stripe`, `decimal.js`)
2. Internal lib modules (`@/lib/prisma`, `@/lib/stripe`, `@/lib/auth`)
3. Internal components (`@/components/CartProvider`)
4. Types (often inline with the module they belong to)

**Path Aliases:**
- `@/` maps to `./src/` -- use for all internal imports
- Example: `import { prisma } from '@/lib/prisma'`
- Never use relative paths for cross-directory imports

**Pattern in API routes:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
```

**Pattern in components:**
```typescript
'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { Check, Heart } from 'lucide-react';
import Link from 'next/link';
```

## Error Handling

**API Routes -- try/catch with JSON responses:**
```typescript
export async function POST(request: NextRequest) {
    try {
        // ... business logic
        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        console.error('Descriptive context:', error);
        return NextResponse.json(
            { message: 'User-friendly error message' },
            { status: 500 }
        );
    }
}
```

**Validation errors return early with 400:**
```typescript
if (!items || items.length === 0) {
    return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
}
```

**Service functions return result objects:**
```typescript
// Success: { success: true, id: result.data?.id }
// Failure: { success: false, error }
```

**Admin routes guard with `requireAdmin()`:**
```typescript
const { error } = await requireAdmin();
if (error) return error;
```

**Fire-and-forget notifications (do not await):**
```typescript
sendOrderConfirmationEmail(data).then(result => {
    // log notification
}).catch(err => console.error(err));
```

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- `console.error('Context description:', error)` for caught errors
- `console.warn('...')` for non-critical issues (e.g., missing VAPID keys)
- No `console.log` in production paths -- only error/warn
- Error messages include context prefix: `'Failed to send order confirmation email:'`, `'Checkout error:'`

## Comments

**When to Comment:**
- Section dividers in long files using `// -- Section Name --` pattern
- Brief inline comments for non-obvious logic
- No JSDoc/TSDoc used consistently

**Section divider pattern (in `src/lib/resend.ts`, `src/lib/twilio.ts`):**
```typescript
// -- Order Status Update Email --
// -- Refund Notification Email --
// -- Pre-built SMS templates --
```

## Function Design

**Size:** Functions tend to be medium-large. API route handlers can be 50-100+ lines. Service functions are shorter (10-30 lines).

**Parameters:**
- API data passed as typed objects/interfaces: `OrderEmailData`, `OrderStatusEmailData`
- Inline object types for simpler functions: `(data: { orderId: string; customerName: string; ... })`
- Destructure request body at top of route handlers

**Return Values:**
- API routes: Always return `NextResponse.json()`
- Service functions: Return `{ success: boolean; id?: string; error?: any }`
- SMS template functions: Return plain strings
- Utility functions: Return computed values directly

## Module Design

**Exports:**
- Components: `export default function ComponentName()` (default export)
- Lib modules: Named exports for functions: `export async function sendSMS()`
- Service clients: Named export via Proxy pattern: `export const stripe = new Proxy(...)`
- Types/interfaces: Named exports alongside the component/module that uses them

**Barrel Files:** Not used. Import directly from source files.

**Lazy Singleton Pattern (all external service clients):**
```typescript
let _client: ClientType | null = null;

function getClient(): ClientType {
    if (!_client) {
        const key = process.env.REQUIRED_KEY;
        if (!key) throw new Error('REQUIRED_KEY environment variable is not set');
        _client = new ClientType(key);
    }
    return _client;
}

export const client = new Proxy({} as ClientType, {
    get(_target, prop) {
        return (getClient() as any)[prop];
    },
});
```

Files using this pattern:
- `src/lib/stripe.ts` (Stripe)
- `src/lib/resend.ts` (Resend)
- `src/lib/s3.ts` (S3Client)
- `src/lib/twilio.ts` (Twilio -- uses function call instead of constructor)

**Prisma client pattern (different -- global singleton):**
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```
Used in `src/lib/prisma.ts`.

## Styling Conventions

**Use Tailwind theme classes instead of hardcoded colors:**
- `text-theme-text`, `text-theme-text-muted` (not `text-white`, `text-gray-400`)
- `bg-theme-primary`, `bg-theme-secondary`, `bg-theme-tertiary`
- `border-theme-border`, `border-theme-accent`
- `text-theme-accent`, `bg-theme-accent` (orange accent color)
- `hover:border-theme-accent`, `group-hover:text-theme-accent`

**Theme variables defined in `src/app/globals.css` via CSS custom properties:**
- Dark theme (default): `--bg-primary: #020C1B`, `--accent: #FF8543`
- Light theme: `--bg-primary: #f8fafc`, `--accent: #E2743A`

**Utility function for conditional classes:**
```typescript
import { cn } from '@/lib/utils';
// cn() combines clsx + tailwind-merge
```

**Client components must declare:**
```typescript
'use client';
```

## API Response Format

**Success responses:**
```typescript
NextResponse.json({ data, pagination? }, { status: 200 })
```

**Error responses always include `message` field:**
```typescript
NextResponse.json({ message: 'Human-readable error' }, { status: 400|401|403|404|500 })
```

**Decimal/money values serialized as strings via `.toString()`:**
```typescript
total: o.total.toString(),
subtotal: o.subtotal.toString(),
```

---

*Convention analysis: 2026-03-06*
