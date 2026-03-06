# Phase 1: Security Blockers — Context

**Phase:** 1 of 10
**Requirements:** SEC-01 through SEC-06
**Goal:** Eliminate dangerous defaults exploitable from day one.
**Created:** 2026-03-06

---

## SEC-01: Remove Test Email Endpoint

**Decision:** Delete `src/app/api/test-email/route.ts` entirely.

**Rationale:**
- No authentication — anyone can trigger emails
- Sends to hardcoded personal email (`anshumaansaraf24@gmail.com`)
- No production purpose; the test-sms route (which has `requireAdmin()`) is sufficient for testing
- Keeping it is a liability with zero upside

**Action:** Delete the file.

---

## SEC-02: Strong Default Admin Password in Seed

**Decision:** Update `prisma/seed.ts` to use a strong default password instead of `admin123`.

**Rationale:**
- Seed script uses `admin123` which is trivially guessable
- Even though production password should be changed, the seed default sets a bad baseline
- A strong default reduces risk if someone forgets to change it

**Action:** Replace password in seed script with a strong random-looking default (e.g., `TasmanStar!Seed2026#`). Add a comment that production password should be changed via the app or database.

**Note:** The actual production admin password is already set in the database. This change only affects future seed runs.

---

## SEC-03: HTML Injection Prevention (escapeHtml Utility)

**Decision:** Create `src/lib/security.ts` with an `escapeHtml()` function. Apply it to all user-supplied values interpolated into HTML email templates.

**Rationale:**
- Email templates in `src/lib/resend.ts` interpolate user input (customerName, deliveryNotes, companyName, etc.) directly into HTML strings
- `src/app/api/auth/forgot-password/route.ts` also interpolates user-facing values into HTML
- A malicious user could inject HTML/scripts into emails sent to admins or other users
- Standard 5-character entity escaping (`& < > " '`) is sufficient

**Action:**
1. Create `src/lib/security.ts` with `escapeHtml()` function
2. Import and apply in `src/lib/resend.ts` to all user-supplied template variables
3. Import and apply in `src/app/api/auth/forgot-password/route.ts`

**escapeHtml spec:**
```typescript
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

---

## SEC-04: Security Headers

**Decision:** Add security headers in `next.config.ts` using the built-in `headers()` config.

**Headers to add (all routes `/**`):**

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

**Rationale:**
- HSTS enforces HTTPS (Vercel serves HTTPS but browser needs the hint for preload)
- X-Frame-Options prevents clickjacking
- X-Content-Type-Options prevents MIME sniffing attacks
- Referrer-Policy limits referrer data leakage
- Permissions-Policy disables unused browser APIs

---

## SEC-05: Content Security Policy (Report-Only)

**Decision:** Add `Content-Security-Policy-Report-Only` header in `next.config.ts`.

**Mode:** Report-Only (no enforcement yet — zero breakage risk). Enforcement deferred to a later phase after monitoring.

**Policy directives:**

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.amazonaws.com;
font-src 'self';
connect-src 'self' https://api.stripe.com https://*.amazonaws.com https://accounts.google.com;
frame-src https://js.stripe.com https://hooks.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
```

**Allowlist rationale:**
- **Stripe:** `js.stripe.com` for scripts, `api.stripe.com` for connect, `hooks.stripe.com` for iframes
- **S3:** `*.amazonaws.com` for images and connect (presigned uploads)
- **Google OAuth:** `accounts.google.com` for connect
- **unsafe-inline/eval:** Required for Next.js inline scripts and Three.js; can be tightened with nonces in a future phase

**Note:** Three.js may load from CDN — if so, add its domain. Monitor report-only violations before enforcing.

---

## SEC-06: Admin Email Fallback

**Decision:** Replace all `anshumaansaraf24@gmail.com` fallback references with `admin@tasmanstar.com.au`.

**Files affected:**
- `src/lib/resend.ts` — 3 occurrences (lines 534, 603, 725)
- `src/app/api/stripe/webhook/route.ts` — 2 occurrences (lines 117, 202)

**Pattern:** All follow the form `process.env.ADMIN_NOTIFICATION_EMAIL || 'anshumaansaraf24@gmail.com'`

**Action:** Change the fallback string to `'admin@tasmanstar.com.au'` in all 5 locations. The env var pattern is good — we're only fixing the default.

---

## Open Questions for Planning

- **Three.js loading:** Does the landing page load Three.js from a CDN or is it bundled? Affects CSP allowlist. Check during SEC-05 implementation.
- **`unsafe-eval` necessity:** Verify if Next.js 16 still requires `unsafe-eval` in CSP. If not, remove it.
- **Forgot-password template:** Confirm exact variables interpolated into HTML to ensure all are escaped.

## Dependencies

None — this phase has no dependencies on other phases. All subsequent phases depend on this one completing first.
