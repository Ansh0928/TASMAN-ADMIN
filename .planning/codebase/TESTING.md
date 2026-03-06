# Testing Patterns

**Analysis Date:** 2026-03-06

## Test Framework

**Runner:**
- Vitest 4.x
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in (`expect`)
- `@testing-library/jest-dom/vitest` for DOM matchers (`.toBeInTheDocument()`, `.toHaveAttribute()`)

**Run Commands:**
```bash
npm test                # Run all tests (vitest run)
npm run test:watch      # Watch mode (vitest)
npm run test:coverage   # Coverage with v8 provider
```

## Test File Organization

**Location:**
- Centralized in `src/__tests__/` (NOT co-located with source)

**Naming:**
- `*.test.ts` for lib/API tests
- `*.test.tsx` for component tests

**Structure:**
```
src/__tests__/
├── setup.ts                          # Global setup (mocks, env vars)
├── helpers/
│   └── mocks.ts                      # Shared mock objects and factories
├── api/
│   ├── checkout.test.ts
│   ├── stripe-webhook.test.ts
│   ├── categories.test.ts
│   ├── wholesale-apply.test.ts
│   ├── wholesale-orders.test.ts
│   ├── wholesale-prices.test.ts
│   ├── checkout-validate-coupon.test.ts
│   ├── products-recommendations.test.ts
│   ├── push-subscribe.test.ts
│   ├── upload-presign.test.ts
│   ├── upload-delete.test.ts
│   └── admin/
│       ├── orders.test.ts
│       ├── orders-refund.test.ts
│       ├── products.test.ts
│       ├── customers.test.ts
│       ├── wholesale.test.ts
│       ├── wholesale-broadcast.test.ts
│       └── wholesale-orders.test.ts
├── lib/
│   ├── admin-auth.test.ts
│   ├── resend.test.ts
│   ├── s3.test.ts
│   ├── twilio.test.ts
│   ├── web-push.test.ts
│   └── wholesale-notifications.test.ts
└── components/
    ├── ProductCard.test.tsx
    ├── CartProvider.test.tsx
    ├── ImageUploader.test.tsx
    └── PushNotificationPrompt.test.tsx
```

**Total: 28 test files, ~330 tests**

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Hoisted mock declarations (when needed for vi.mock factories)
const mockRequireAdmin = vi.hoisted(() => vi.fn());

// 2. vi.mock() calls (before imports of modules under test)
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/admin-auth', () => ({ requireAdmin: mockRequireAdmin }));

// 3. Import module under test (AFTER mocks)
import { GET, POST } from '@/app/api/admin/orders/route';

// 4. Helper functions for test setup
function adminOk() { mockRequireAdmin.mockResolvedValue({ error: null, session: {...} }); }

// 5. Test suites
describe('Admin Orders API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('auth guard', () => {
        it('rejects non-admin', async () => { ... });
    });

    describe('GET /api/admin/orders', () => {
        it('lists orders with pagination', async () => { ... });
        it('returns 500 on database error', async () => { ... });
    });
});
```

**Key patterns:**
- `beforeEach(() => vi.clearAllMocks())` in every describe block
- Group tests by HTTP method or logical concern using nested `describe`
- Section comments with `// -- Section Name --` for visual separation
- Helper functions like `adminOk()`, `adminForbidden()` to reduce repetition

## Mocking

**Framework:** Vitest built-in (`vi.mock()`, `vi.fn()`, `vi.hoisted()`)

**Global Setup (`src/__tests__/setup.ts`):**
```typescript
import '@testing-library/jest-dom/vitest';

// Mock localStorage
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    useParams: () => ({}),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
    useSession: () => ({ data: null, status: 'unauthenticated' }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }) => children,
}));

// Set test environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.RESEND_API_KEY = 're_test_fake';
// ... etc
```

**Shared Mocks (`src/__tests__/helpers/mocks.ts`):**
```typescript
// Prisma mock -- manual object with vi.fn() for each method
export const prismaMock = {
    product: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), ... },
    order: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), ... },
    $transaction: vi.fn((fn: any) => fn(prismaMock)),
};

// Stripe mock
export const stripeMock = {
    checkout: { sessions: { create: vi.fn(), retrieve: vi.fn() } },
    customers: { list: vi.fn(), create: vi.fn() },
    webhooks: { constructEvent: vi.fn() },
    // ...
};

// Data factories
export const factories = {
    product: (overrides = {}) => ({ id: 'prod-1', name: 'Atlantic Salmon', ... , ...overrides }),
    order: (overrides = {}) => ({ id: 'order-1', status: 'PENDING', ... , ...overrides }),
    user: (overrides = {}) => ({ id: 'user-1', role: 'CUSTOMER', ... , ...overrides }),
};

// Request helper
export function createMockRequest(method: string, body?: any, searchParams?: Record<string, string>): Request
```

**Module Mocking Pattern for API tests:**
```typescript
// Mock BEFORE importing the module under test
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/stripe', () => ({ stripe: stripeMock }));

// Then import the route handler
import { POST } from '@/app/api/checkout/route';
```

**Hoisted mocks for functions that need reference before vi.mock:**
```typescript
const mockSendOrderStatusEmail = vi.hoisted(() => vi.fn().mockResolvedValue({ success: true }));

vi.mock('@/lib/resend', () => ({
    sendOrderStatusEmail: mockSendOrderStatusEmail,
}));
```

**What to Mock:**
- `@/lib/prisma` -- always mock with `prismaMock`
- `@/lib/stripe` -- always mock with `stripeMock`
- `@/lib/admin-auth` -- mock `requireAdmin` for admin route tests
- `@/lib/auth` -- mock `auth` for session-dependent tests
- `@/lib/resend` -- mock individual email functions
- `@/lib/twilio` -- mock `sendSMS` and SMS template functions
- `@/lib/web-push` -- mock `sendPushNotification`
- `next/link`, `next/image` -- mock for component tests (render as plain HTML)
- `@/components/CartProvider` -- mock `useCart` hook for component tests

**What NOT to Mock:**
- The route handler itself (that is the unit under test)
- `NextRequest`/`NextResponse` -- use real instances
- `Decimal` -- use real calculations
- Pure utility functions (`cn()`, template functions)

## Fixtures and Factories

**Test Data (in `src/__tests__/helpers/mocks.ts`):**
```typescript
export const factories = {
    product: (overrides = {}) => ({
        id: 'prod-1',
        name: 'Atlantic Salmon',
        slug: 'atlantic-salmon',
        price: '29.99',
        stockQuantity: 50,
        isAvailable: true,
        ...overrides,
    }),

    order: (overrides = {}) => ({
        id: 'order-1',
        status: 'PENDING',
        total: '109.89',
        fulfillment: 'DELIVERY',
        guestEmail: 'test@example.com',
        ...overrides,
    }),

    user: (overrides = {}) => ({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CUSTOMER',
        ...overrides,
    }),
};
```

**Usage in tests:**
```typescript
prismaMock.product.findMany.mockResolvedValue([
    factories.product({ id: 'prod-1', stockQuantity: 0, isAvailable: true }),
]);
```

**Request creation helpers:**
```typescript
// For API route tests
function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

// Generic helper from mocks.ts
createMockRequest('GET', undefined, { page: '1', limit: '20' })
createMockRequest('PATCH', { status: 'CONFIRMED' })
```

**Component test data helpers:**
```typescript
function createProduct(overrides: Partial<ProductCardData> = {}): ProductCardData {
    return {
        id: 'prod-1',
        name: 'Atlantic Salmon',
        slug: 'atlantic-salmon',
        price: '29.99',
        ...overrides,
    };
}
```

**Location:** All shared fixtures in `src/__tests__/helpers/mocks.ts`. Test-specific helpers defined inline in the test file.

## Coverage

**Requirements:** No enforced threshold

**Provider:** v8

**Coverage includes:**
- `src/app/api/**`
- `src/lib/**`
- `src/components/**`

**View Coverage:**
```bash
npm run test:coverage    # Generates text + HTML report
```

## Test Types

**Unit Tests (majority):**
- API route handlers: Test each HTTP method with mocked dependencies
- Lib functions: Test service functions with mocked external clients
- Components: Render with `@testing-library/react`, test user interactions

**Integration Tests:** Not used. All tests mock external dependencies.

**E2E Tests:** Not used. No Playwright/Cypress setup.

## Common Patterns

**API Route Testing:**
```typescript
it('returns 400 when cart is empty', async () => {
    const response = await POST(createRequest({ ...validBody, items: [] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Cart is empty');
});
```

**Admin Route Testing (auth guard + happy path):**
```typescript
it('rejects non-admin', async () => {
    adminForbidden();
    const req = createMockRequest('GET');
    const res = await GET(req as any);
    expect(res.status).toBe(403);
});

it('lists orders when admin', async () => {
    adminOk();
    prismaMock.order.findMany.mockResolvedValue([factories.order()]);
    prismaMock.order.count.mockResolvedValue(1);
    // ...
    expect(res.status).toBe(200);
});
```

**Component Testing:**
```typescript
it('renders product name and price', () => {
    render(<ProductCard product={createProduct()} />);
    expect(screen.getByText('Atlantic Salmon')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
});

it('calls addItem on click', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={createProduct()} />);
    await user.click(screen.getByLabelText('Add to cart'));
    expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({ productId: 'prod-1' }));
});
```

**Async Testing:**
```typescript
it('handles async operations', async () => {
    prismaMock.order.update.mockResolvedValue(updatedOrder);
    const response = await PATCH(req as any, { params: Promise.resolve({ id: 'order-1' }) });
    expect(response.status).toBe(200);
});
```

**Error Testing:**
```typescript
it('returns 500 on database error', async () => {
    adminOk();
    prismaMock.order.findMany.mockRejectedValue(new Error('DB error'));
    const res = await GET(req as any);
    expect(res.status).toBe(500);
});
```

**Next.js Dynamic Route Params (App Router):**
```typescript
// Params must be wrapped in Promise.resolve() for Next.js 16
const res = await GET_BY_ID(req as any, { params: Promise.resolve({ id: 'order-1' }) });
```

## Known Failing Tests

5 test files have known failures (see `src/__tests__/` memory):

1. `src/__tests__/components/CartProvider.test.tsx` -- `crypto.randomUUID` mock issue
2. `src/__tests__/components/ImageUploader.test.tsx` -- `URL` constructor mock issue
3. `src/__tests__/components/PushNotificationPrompt.test.tsx` -- browser API mocks
4. `src/__tests__/lib/resend.test.ts` -- Resend class constructor not mockable as plain function
5. `src/__tests__/lib/s3.test.ts` -- AWS SDK command classes need class-based mocks

**Common fix pattern:** Use `vi.hoisted()` for mock references and `vi.fn().mockImplementation()` for class constructors.

## Adding New Tests

**For a new API route:**
1. Create test file at `src/__tests__/api/{route-name}.test.ts`
2. Import `prismaMock`, `stripeMock`, `factories` from `../helpers/mocks`
3. Call `vi.mock('@/lib/prisma', ...)` before importing the route handler
4. Use `createMockRequest()` to build request objects
5. Follow describe/beforeEach/it pattern

**For a new component:**
1. Create test file at `src/__tests__/components/{ComponentName}.test.tsx`
2. Mock dependencies (`next/link`, `next/image`, context hooks)
3. Use `render()` from `@testing-library/react` and `userEvent` for interactions
4. Create a factory function for component props

**For a new lib module:**
1. Create test file at `src/__tests__/lib/{module-name}.test.ts`
2. Mock external dependencies with `vi.hoisted()` + `vi.mock()`
3. Import module under test after mocks
4. Test both success and failure paths

---

*Testing analysis: 2026-03-06*
