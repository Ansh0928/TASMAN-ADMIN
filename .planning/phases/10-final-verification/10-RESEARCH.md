# Phase 10: Final Verification - Research

**Researched:** 2026-03-09
**Domain:** Production readiness verification + map layout fix
**Confidence:** HIGH

## Summary

Phase 10 is a comprehensive verification phase with one piece of NEW WORK: fixing the map layout so fish species info appears adjacent to the map (not below) and species link to actual product pages. The verification portion covers all user flows (customer, wholesale, admin), mobile responsiveness, SEO/performance audits, security re-verification, and browser compatibility. The map fix requires restructuring the `RegionalMap.tsx` component layout and connecting species data to real product slugs from the database.

The project currently has 426 tests with 4 failures in rate-limit and middleware tests. These must be fixed as part of verification. The existing codebase is mature with all phases 1-9 implemented. The map component uses `@vnedyalk0v/react19-simple-maps` with hardcoded regional species data and links to category pages (not individual products).

**Primary recommendation:** Structure this phase as: (1) fix failing tests, (2) implement map layout fix, (3) systematic verification checklist execution across all flows, (4) fix-as-you-go for any issues found.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use Stripe test mode (test cards) on production for checkout verification
- Full round-trip checkout verification: order appears in admin, items match, confirmation email arrives at techsupport@tasmanstarseafood.com
- Full wholesale lifecycle: create account -> apply -> admin approves -> login -> view prices -> place order
- Mobile verification with Chrome DevTools responsive mode AND real device
- Both light and dark themes verified on mobile
- Full SEO audit: meta tags, sitemap.xml, robots.txt, OpenGraph, canonical URLs, Lighthouse (Performance 80+, Accessibility 90+, SEO 90+, Best Practices 90+)
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Map shows only fish species that Tasman Star actually sells, clicking a fish redirects to that product's page
- Desktop: info panel adjacent to map (not below)
- Browser compatibility: Chrome (desktop + mobile), Safari (desktop + iOS), Firefox, Edge
- WCAG AA compliance: keyboard navigation, color contrast 4.5:1, ARIA labels, focus indicators
- 100% pass bar -- every test must pass, fix immediately if anything fails
- All 383+ tests must pass green (currently 426 tests, 4 failing)
- Security re-verification on production: headers, rate limiting, CSRF, admin access control

### Claude's Discretion
- Stripe webhook testing approach (via checkout or CLI)
- Map layout details (left/right panel position, preview panel vs direct redirect, mobile breakpoint)
- Mobile fail criteria bar (functional vs cosmetic)

### Deferred Ideas (OUT OF SCOPE)
- SMS notification testing (Twilio) -- skipped for launch
- Push notification testing -- skipped for launch
- E2E test framework (Playwright) -- v2 requirement
- Guest checkout -- v2 requirement
</user_constraints>

## Architecture Patterns

### Map Layout Fix -- Current State

The `RegionalMap.tsx` component at `src/components/map/RegionalMap.tsx` currently renders a region info panel BELOW the map using Framer Motion `AnimatePresence`. The component structure is:

```
<div> (wrapper, bg-[#0A192F])
  <div> (map section, h-[500px] md:h-[600px] lg:h-[800px])
    ... map with zoom controls ...
  </div>
  <AnimatePresence>
    {activeRegion && <motion.div> (info panel, BELOW map)}
  </AnimatePresence>
</div>
```

### Map Layout Fix -- Target Architecture

Desktop (lg+): Side-by-side layout with map on left, info panel on right (or vice versa). Use CSS Grid or Flexbox.

```
<div> (wrapper)
  <div className="lg:flex lg:flex-row"> (or grid)
    <div> (map, flex-1 or lg:w-2/3)
    <div> (info panel, lg:w-1/3, adjacent)
  </div>
</div>
```

Mobile (<lg): Stack vertically as currently implemented (map on top, info below).

**Key changes needed:**
1. Replace vertical stacking with `lg:flex-row` layout
2. Info panel always visible on desktop (shows placeholder text when no region selected)
3. Species cards should link to individual product pages, not category pages
4. Species data needs to map to actual product slugs from the database (or use hardcoded slugs matching real products)

### Map Species-to-Product Mapping

Current: Species link to `/our-business/online-delivery?category={categorySlug}` (category-level).
Required: Clicking a species card should navigate to `/product/{slug}` for the matching product.

**Two approaches:**
1. **Static mapping (RECOMMENDED):** Add `productSlug` field to species data in `REGIONAL_DATA`, mapping each species to its actual product slug in the database. Simple, no API calls needed.
2. **Dynamic lookup:** Fetch products from API and match by name. Adds complexity and loading states.

Recommendation: Use static mapping. The species list is curated and changes infrequently. Query the database once to get the correct slugs, then hardcode them.

### Verification Checklist Architecture

This phase is primarily a manual verification phase. Structure as:
1. **Wave 0:** Fix failing tests + map layout fix (the only code changes)
2. **Wave 1:** Automated checks (test suite, Lighthouse CLI, security header checks)
3. **Wave 2:** Manual flow verification (customer, wholesale, admin)
4. **Wave 3:** Mobile and cross-browser verification

### Anti-Patterns to Avoid
- **Skipping fixes:** Do not mark issues as "known" and move on. The bar is 100% -- fix immediately.
- **Testing only happy paths:** Verify error states, edge cases, and unauthorized access.
- **Desktop-only verification:** Every flow must be checked on mobile viewport.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lighthouse audit | Manual page inspection | `npx lighthouse URL --output=json` CLI | Consistent, measurable scores |
| Security header check | Manual browser DevTools | `curl -I URL` and verify headers | Scriptable, repeatable |
| Mobile viewport testing | Guessing breakpoints | Chrome DevTools device toolbar | Accurate device simulation |
| Accessibility audit | Manual ARIA checking | Lighthouse accessibility audit + axe DevTools | Comprehensive, standards-based |

## Common Pitfalls

### Pitfall 1: Stripe Test Mode on Production
**What goes wrong:** Production Stripe keys process real charges instead of test charges.
**Why it happens:** Forgetting to use test API keys or test card numbers.
**How to avoid:** Use Stripe test card numbers (4242424242424242) with the LIVE publishable key. Stripe test cards will be declined on live keys. Alternatively, verify in Stripe Dashboard test mode with test keys temporarily.
**Recommendation for Claude's discretion:** Use Stripe CLI `stripe trigger checkout.session.completed` to test webhook processing without real charges. For UI flow testing, use test card numbers.

### Pitfall 2: Map Layout Breaking 3D Transform
**What goes wrong:** The current map has a CSS 3D isometric transform (`rotateX(55deg) rotateZ(-30deg)`) on desktop. Changing the layout container could break this effect.
**Why it happens:** The 3D transform relies on `perspective-[1000px]` on the parent and absolute positioning.
**How to avoid:** Keep the map's internal structure intact. Only change the OUTER wrapper layout from vertical to horizontal. The map section should remain self-contained.

### Pitfall 3: Incomplete Species-to-Product Matching
**What goes wrong:** Species listed on the map don't have corresponding products in the database.
**Why it happens:** The map lists species like "Pearl Meat", "Dhufish", "Gummy Shark" which may not be actual products sold.
**How to avoid:** Query the database for actual product slugs, only show species that have matching products. The CONTEXT.md explicitly states "Map shows only fish species that Tasman Star actually sells."

### Pitfall 4: Test Regression from Map Changes
**What goes wrong:** Modifying RegionalMap.tsx could break existing tests or introduce import errors.
**Why it happens:** Component restructuring without updating test mocks.
**How to avoid:** Run full test suite after map changes. The component is dynamically imported (no SSR) so test impact should be minimal.

### Pitfall 5: Rate Limit Test Failures
**What goes wrong:** 4 tests currently failing in rate-limit.test.ts and middleware.test.ts.
**Why it happens:** Mock structure mismatch with actual Upstash SDK constructors. The middleware uses direct REST calls to Upstash but the test file `rate-limit.test.ts` mocks SDK constructors.
**How to avoid:** Fix the mock patterns to match actual implementation. The middleware uses `fetch()` to Upstash REST API directly, not the SDK.

## Code Examples

### Map Layout Fix -- Side-by-Side Pattern
```typescript
// Source: Project-specific implementation pattern
// Replace current vertical stacking with flex-row on desktop
<div className="w-full bg-[#0A192F] rounded-3xl overflow-hidden border border-theme-accent/20 shadow-2xl">
  <div className="flex flex-col lg:flex-row">
    {/* Map Section -- takes 2/3 on desktop */}
    <div className="relative w-full lg:w-2/3 h-[500px] md:h-[600px] lg:h-[700px]">
      {/* ... existing map code ... */}
    </div>

    {/* Info Panel -- takes 1/3 on desktop, below on mobile */}
    <div className="w-full lg:w-1/3 lg:border-l border-t lg:border-t-0 border-white/10">
      {activeRegion && regionData ? (
        {/* ... species info ... */}
      ) : (
        <div className="p-8 text-center text-slate-400">
          <p>Select a region to explore species</p>
        </div>
      )}
    </div>
  </div>
</div>
```

### Species Card with Product Link
```typescript
// Source: Project-specific implementation pattern
// Each species card links to product page
<Link
  href={`/product/${sp.productSlug}`}
  className="bg-white/5 border border-white/10 rounded-2xl p-4 group hover:border-theme-accent/30 transition-all"
>
  <h4 className="text-white font-bold text-sm group-hover:text-theme-accent transition-colors">
    {sp.name}
  </h4>
  <p className="text-slate-400 text-xs">{sp.desc}</p>
  <span className="text-theme-accent text-xs mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
    View Product →
  </span>
</Link>
```

### Security Header Verification Command
```bash
# Verify all security headers on production
curl -sI https://tasman-admin.vercel.app/ | grep -iE "strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy|content-security"
```

### Lighthouse CLI Audit
```bash
# Run Lighthouse programmatically
npx lighthouse https://tasman-admin.vercel.app/ --output=json --chrome-flags="--headless" | jq '.categories | to_entries[] | {(.key): .value.score}'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Map info below map | Side-by-side layout | This phase | Better UX, info visible without scrolling |
| Species link to category | Species link to product | This phase | Direct add-to-cart flow |
| Hardcoded all species | Only sold species | This phase | Accurate, clickable product mapping |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + @testing-library/react 16.3.2 + jsdom 28.1.0 |
| Config file | vitest.config.ts (assumed, standard location) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Current Test Status
- **33 test files, 426 total tests**
- **4 failures** in `rate-limit.test.ts` (3 failures) and `middleware.test.ts` (1 failure)
- Root cause: Mock pattern mismatch with Upstash REST-based rate limiting implementation

### Phase Requirements -- Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| N/A (test fix) | Rate limit tests pass | unit | `npx vitest run src/__tests__/lib/rate-limit.test.ts -x` | Exists, failing |
| N/A (test fix) | Middleware tests pass | unit | `npx vitest run src/__tests__/middleware.test.ts -x` | Exists, failing |
| N/A (map) | Map layout side-by-side | manual-only | Visual inspection | N/A |
| N/A (map) | Species link to products | manual-only | Visual inspection + click test | N/A |
| N/A (verify) | Full test suite green | unit | `npx vitest run` | All exist |
| N/A (verify) | Lighthouse scores meet targets | automated | `npx lighthouse URL --output=json` | N/A |
| N/A (verify) | Security headers present | automated | `curl -sI URL` | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run` + manual flow check
- **Phase gate:** Full suite green + all manual checklists passed

### Wave 0 Gaps
- [ ] Fix `src/__tests__/lib/rate-limit.test.ts` -- 3 failing tests (mock pattern mismatch)
- [ ] Fix `src/__tests__/middleware.test.ts` -- 1 failing test (global rate limit mock)
- [ ] Map component restructure -- no new tests needed (manual verification)

## Key Technical Details for Planning

### Pages to Verify (Complete List)
**Customer-facing:** `/` (home), `/our-products`, `/deals`, `/product/[slug]`, `/search`, `/checkout`, `/order-confirmation`, `/about`, `/our-partner`, `/our-business/*` (5 sub-pages), `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/account`, `/account/orders`, `/account/addresses`

**Admin:** `/admin` (dashboard), `/admin/login`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/orders`, `/admin/customers`, `/admin/wholesale`, `/admin/wholesale-orders`, `/admin/coupons`, `/admin/notifications`, `/admin/categories`

**Wholesale:** `/wholesale` (portal), `/wholesale/login`, `/wholesale/apply`, `/wholesale/pending`, `/wholesale/prices`, `/wholesale/order`

**Error pages:** `/not-found` (404), `/error` (500), `/unauthorized`

### Existing SEO Infrastructure
- `src/app/sitemap.ts` -- exists
- `src/app/robots.ts` -- exists
- `src/app/not-found.tsx` -- exists (custom 404)
- `src/app/error.tsx` -- exists (custom error)
- `src/app/layout.tsx` -- exists (metadata)

### Database Info
- Production DB: Neon PostgreSQL at `ep-snowy-fire-a7n4izbf-pooler.ap-southeast-2.aws.neon.tech`
- Admin login: `techsupport@tasmanstarseafood.com` / `Admin1234!`
- Production URL: `https://tasman-admin.vercel.app/`

### Map Component Dependencies
- `@vnedyalk0v/react19-simple-maps` (React 19 compatible fork of react-simple-maps)
- `framer-motion` for AnimatePresence animations
- `lucide-react` for icons
- GeoJSON data loaded from `/australia.geojson`
- Dynamic import via `RegionalMapLazy.tsx` (no SSR)

## Open Questions

1. **Which species in REGIONAL_DATA have matching products in the database?**
   - What we know: The map has species like Barramundi, Mud Crab, Tiger Prawn, etc. across 8 regions
   - What's unclear: Which of these actually exist as products with slugs in the database
   - Recommendation: Query database for all product slugs and match against species names. Remove unmatched species from the map.

2. **Stripe test mode approach on production**
   - What we know: Stripe test cards (4242...) are rejected by live keys
   - What's unclear: Whether to temporarily swap to test keys or use Stripe CLI for webhook testing
   - Recommendation: Use Stripe CLI `stripe trigger` for webhook testing. For UI flow, verify the checkout page renders and form validates correctly without completing payment.

3. **Newsletter feature state**
   - What we know: INFRA-05 was to disable newsletter if not used at launch. `NEWSLETTER_ENABLED` env var exists.
   - What's unclear: Whether newsletter subscribe endpoint is actually disabled
   - Recommendation: Verify during testing. If enabled, test full subscribe/unsubscribe flow. If disabled, verify endpoint returns appropriate response.

## Sources

### Primary (HIGH confidence)
- Project codebase -- direct inspection of `src/components/map/RegionalMap.tsx`, `src/app/page.tsx`, `src/middleware.ts`, `src/app/admin/page.tsx`
- `package.json` -- verified dependency versions
- `10-CONTEXT.md` -- user decisions and requirements
- Test suite output -- verified 426 tests, 4 failures

### Secondary (MEDIUM confidence)
- MEMORY.md -- project history and patterns (Phases 1-9 complete)
- REQUIREMENTS.md -- all v1 requirements listed

## Metadata

**Confidence breakdown:**
- Map layout fix: HIGH - component code inspected, straightforward CSS/layout change
- Verification approach: HIGH - all pages and flows identified from codebase
- Test fixes: HIGH - failure output inspected, root cause identified (mock mismatch)
- Species-product mapping: MEDIUM - depends on database content, needs runtime query

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable codebase, no external dependencies changing)
