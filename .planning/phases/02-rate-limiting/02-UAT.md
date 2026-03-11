---
status: complete
phase: 02-rate-limiting
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-03-09T00:00:00Z
updated: 2026-03-09T02:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. CSRF Origin Validation
expected: POST/PUT/DELETE with mismatched Origin returns 403. Stripe webhook and OAuth callback are exempt.
result: pass

### 2. Global Rate Limit (100/min per IP)
expected: Any single IP exceeding limit gets blocked with 429. Normal usage works fine.
result: pass

### 3. Auth Endpoint Rate Limit (5/min)
expected: Auth endpoints reject requests exceeding 5/min with 429.
result: pass

### 4. Checkout Rate Limit
expected: Checkout endpoint rate limited at 10/min.
result: pass

### 5. Newsletter Rate Limit
expected: Newsletter endpoint rate limited at 5/min.
result: pass

### 6. Wholesale Apply Rate Limit
expected: Wholesale apply endpoint rate limited at 10/min.
result: pass

### 7. Dev Fallback Without Redis
expected: App works without UPSTASH env vars — rate limiting disabled, no crashes.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
