# Research Summary

**Project:** Tasman Star Seafood -- Production Readiness
**Date:** 2026-03-06

## Key Findings

### 1. Security is the Top Priority
The codebase has **7 security gaps** that must be fixed before any public launch:
- Unprotected test-email endpoint (anyone can trigger emails)
- Zero rate limiting on all endpoints (brute force trivial)
- XSS via HTML email injection (user input unescaped in templates)
- Admin UI accessible to any authenticated user (middleware only checks cookie existence)
- Weak admin password (`admin123`) with no complexity requirements
- No CSRF protection on state-changing endpoints
- Personal email as admin notification fallback

### 2. Stock Overselling is the Most Dangerous Bug
Stock is validated at checkout creation but only decremented in the webhook handler minutes later. Two simultaneous purchases of the last item will both succeed, creating unfulfillable orders. For perishable seafood, this is catastrophic. Fix requires atomic `WHERE stockQuantity >= qty` guards and `$transaction()` wrapping.

### 3. All Recommended Tools Are Free
| Tool | Purpose | Cost |
|------|---------|------|
| `@upstash/ratelimit` + `@upstash/redis` | Rate limiting | $0 (500K commands/month) |
| `@sentry/nextjs` | Error tracking | $0 (5K errors/month) |
| Vercel Cron | Abandoned order cleanup | $0 (1 daily cron) |
| Custom `escapeHtml()` | XSS prevention | No dependency |
| Custom Origin check | CSRF protection | No dependency |
| `next.config.ts` headers | Security headers | Built-in |

### 4. Architecture Changes Are Minimal
- Middleware expansion (add role check + security headers + global rate limit)
- Per-route rate limiters (new `src/lib/rate-limit.ts`)
- `escapeHtml()` utility (new `src/lib/security.ts`)
- Sentry integration (3 config files + error boundary updates)
- Analytics extension (expand existing `/api/admin/stats`)
- No new database models required for core hardening

### 5. Twenty-Eight Table Stakes Features Identified
Across 6 categories: Checkout (5), Product Browsing (2), Auth (3), Admin (5), Mobile (5), Security (8). Most are fixes/polish of existing features, not new builds. Guest checkout is the only major new feature (currently forces login).

### 6. Fifteen Pitfalls Mapped to Phases
- **5 Critical:** Stock race condition, webhook duplication, middleware access gap, abandoned orders, weak admin credentials
- **7 Moderate:** XSS emails, test endpoint, connection pool exhaustion, no monitoring, newsletter compliance, serverless notification loss, NextAuth beta instability
- **3 Minor:** Cart price staleness, no CI, monolithic components

### 7. Build Order is Clear
Security fundamentals (zero-dependency fixes) -> Rate limiting (Upstash setup) -> Auth hardening -> Stock & payment integrity -> Checkout polish -> Admin completeness -> Mobile responsive -> Test fixes -> Infrastructure (Sentry, pooling, notifications) -> Final polish

## Research Files

| File | Content | Lines |
|------|---------|-------|
| `STACK.md` | Technology recommendations with alternatives and costs | ~85 |
| `FEATURES.md` | 28 table stakes, 10 differentiators, 9 anti-features | ~110 |
| `ARCHITECTURE.md` | Rate limiting, security headers, Sentry, analytics architecture | ~100 |
| `PITFALLS.md` | 15 pitfalls with prevention strategies and phase mapping | ~180 |
| `SUMMARY.md` | This file | ~65 |

## Open Questions

1. Does Next.js 16 support `after()` for serverless background work? (affects notification reliability approach)
2. Is the `DATABASE_URL` using Neon's pooled connection string? (affects connection pool recommendations)
3. Is Three.js bundled or loaded from CDN? (affects CSP configuration)
4. Exact NextAuth version pin in `package.json`? (verify `^` vs exact pin)

---

*Research synthesis: 2026-03-06*
