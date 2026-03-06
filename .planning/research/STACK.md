# Stack Research

**Domain:** Seafood e-commerce production hardening
**Researched:** 2026-03-06
**Confidence:** HIGH

## Recommendations

### Rate Limiting: `@upstash/ratelimit` ^2.0.8 + `@upstash/redis` ^1.36.3

- De facto standard for serverless rate limiting on Vercel
- HTTP-based (no persistent connections) -- perfect for serverless
- Free tier: 500K commands/month, 256MB -- more than enough for pre-launch
- Sliding window algorithm for smooth rate limiting

**Why not Arcjet:** Overkill for 5-6 endpoints. Upstash is simpler and has a clear free tier.
**Why not in-memory:** Vercel serverless is stateless; in-memory maps reset on cold start.

### Error Tracking: `@sentry/nextjs` ^10.42.0

- First-class Next.js 16 integration (App Router, RSC, API routes)
- Turbopack support, hydration error diffs, session replay
- Automatic source map upload via Vercel integration
- Free tier: 5,000 errors/month, 1 user

**Why not LogRocket/Datadog:** No meaningful free tier for pre-launch.

### CSRF: Custom Origin Header Check (no library)

- Next.js Server Actions already validate Origin vs Host
- For API route handlers: ~10 lines of Origin check in middleware.ts
- `@edge-csrf/nextjs` is stale (last update 1+ year ago, RC version only)
- `next-csrf` is Pages Router only

### Security Headers: `next.config.ts` headers (built-in)

- CSP with nonces via middleware (Next.js official pattern)
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- No library needed (Helmet requires custom server, against Next.js patterns)
- **CSP caveat:** Tailwind requires `unsafe-inline` for styles; Three.js and Stripe need explicit allowlisting in script-src
- Start with `Content-Security-Policy-Report-Only` before enforcing

### Password Strength: `@zxcvbn-ts/core` ^3.0.4

- TypeScript rewrite of Dropbox's zxcvbn
- Better than regex rules ("P@ssw0rd1" passes regex but is trivially guessable)
- Lower priority -- nice to have for registration UX

### XSS Prevention: Custom `escapeHtml()` Utility (no library)

- 5-line function for HTML email templates
- CONCERNS.md already identifies exact lines needing fixes (113, 267, 339, 398, 486-488, 630, 698-702 in `resend.ts`)

### Abandoned Order Cleanup: Vercel Cron Jobs (built-in)

- Define cron in `vercel.json`, hits an API route on schedule
- Free on Hobby plan (1 cron, daily)
- Listen for `checkout.session.expired` webhook event from Stripe as supplementary

## Installation

```bash
# Rate limiting
npm install @upstash/ratelimit @upstash/redis

# Error tracking (wizard creates config files automatically)
npx @sentry/wizard@latest -i nextjs

# Password strength (optional)
npm install @zxcvbn-ts/core @zxcvbn-ts/language-en
```

## New Environment Variables

```
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
```

## Cost Analysis

| Service | Free Tier | Enough for Launch? |
|---------|-----------|-------------------|
| Upstash Redis | 500K commands/month, 256MB | Yes |
| Sentry | 5K errors/month, 1 user | Yes |
| Vercel Cron | 1 daily cron (Hobby) | Yes |
| zxcvbn-ts | npm package, no service | N/A |

**Total new cost: $0/month**

---

*Stack research: 2026-03-06*
