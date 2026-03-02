# Test Suite Design — Tasman Star Seafood

## Stack
- Vitest (runner + mocking)
- @testing-library/react + @testing-library/jest-dom (components)
- PGlite (in-memory PostgreSQL for real DB tests)
- All external services mocked (Stripe, S3, Twilio, Resend, web-push)

## Scope
- API routes (18 files) — business logic, auth, DB operations
- Lib services (6 files) — initialization, templates, error handling
- Components (4 files) — rendering, interactions, state

## DB Strategy
- PGlite per test suite, Prisma migrations at setup
- Truncate between tests for isolation
- No external PostgreSQL needed
