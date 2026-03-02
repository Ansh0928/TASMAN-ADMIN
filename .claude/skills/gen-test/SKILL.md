---
name: gen-test
description: Generate Vitest tests following the project's established testing patterns
user-invocable: true
---

# Generate Tests

Generate tests for the specified file or feature. The user will provide a file path or component name as the argument (e.g., `/gen-test src/app/api/addresses/route.ts`).

## Project Test Conventions

- **Framework**: Vitest 4 + @testing-library/react + jsdom
- **Test location**: `src/__tests__/` mirroring `src/` structure (e.g., `src/app/api/foo/route.ts` → `src/__tests__/api/foo.test.ts`)
- **Setup file** at `src/__tests__/setup.ts` provides: localStorage mock, `next/navigation` mock, `next-auth/react` mock, env vars
- **Shared mocks** at `src/__tests__/helpers/mocks.ts` provides: `prismaMock`, `stripeMock`, `resendMock`, `twilioMock`, `s3Mock`, `webPushMock`, `mockAuth()`, `mockAdminAuth()`, `createMockRequest()`, and `factories` (product, category, user, order, wholesalePriceItem, wholesaleOrder, pushSubscription)

## Test Structure Rules

1. **Import from vitest**: `import { describe, it, expect, vi, beforeEach } from 'vitest';`
2. **Import shared mocks**: `import { prismaMock, factories, createMockRequest, mockAuth } from '../helpers/mocks';`
3. **Mock modules before imports**: Use `vi.mock()` at the top level BEFORE importing the code under test
4. **Use `vi.hoisted()`** for mock references that need to be available in `vi.mock()` factory functions
5. **Use `vi.fn().mockImplementation()`** for class constructor mocks (not plain `vi.fn()`)
6. **Clear mocks in beforeEach**: `vi.clearAllMocks();`
7. **Decimal fields**: Prisma Decimal fields are serialized as strings — use string values like `'29.99'` in assertions

## API Route Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock, factories, mockAdminAuth, createMockRequest } from '../helpers/mocks';

// Mock modules BEFORE importing route handlers
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/admin-auth', () => ({ requireAdmin: mockAdminAuth(true) }));

// Import route handler AFTER mocks
import { GET, POST } from '@/app/api/example/route';

describe('GET /api/example', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns data with 200 status', async () => {
    prismaMock.example.findMany.mockResolvedValue([factories.product()]);
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
  });

  it('returns 500 on database error', async () => {
    prismaMock.example.findMany.mockRejectedValue(new Error('DB error'));
    const response = await GET();
    expect(response.status).toBe(500);
  });
});
```

## Component Test Pattern

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '@/components/ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

## What to Test

For **API routes**: happy path, validation errors, auth/permission checks, database errors (500), edge cases
For **components**: renders correctly, user interactions, conditional rendering, loading/error states
For **lib services**: successful operations, error handling, parameter validation

## Steps

1. Read the target file to understand its exports, dependencies, and logic
2. Read `src/__tests__/helpers/mocks.ts` to check if needed mocks/factories already exist
3. If the target file has dependencies not in the shared mocks, add them to `mocks.ts`
4. Write the test file at the correct path under `src/__tests__/`
5. Run the test with `npx vitest run <test-file-path> --reporter=verbose` to verify it passes
6. Fix any failures and re-run until all tests pass
