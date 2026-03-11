# SEO, AEO & Brand Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve search engine visibility, answer engine optimization, and brand consistency across the Tasman Star Seafoods site with structured data, metadata, dynamic OG images, and semantic HTML.

**Architecture:** Three parallel divisions — Market (site-wide SEO/AEO schemas & metadata), Product (product-specific schemas, OG images, brand standardization), Testing (validation tests). Market and Product run in parallel, Testing runs after both.

**Tech Stack:** Next.js Metadata API, JSON-LD structured data (schema.org), Next.js `ImageResponse` for dynamic OG images, Vitest for tests.

**Base URL:** `https://tasman-admin.vercel.app`
**Brand Name:** "Tasman Star Seafoods" (canonical), "Tasman Star" (short form)

---

## Division 1: Market Division — Site-Wide SEO & AEO

### Task 1: Add Organization + WebSite JSON-LD schemas to root layout

**Files:**
- Modify: `src/app/layout.tsx:25-34` (metadata) and `:43-136` (body)

**Step 1: Update root metadata with canonical URL, Twitter cards, and standardized brand name**

Replace lines 25-34 in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: {
    default: 'Tasman Star Seafoods | Premium Seafood Gold Coast',
    template: '%s | Tasman Star Seafoods',
  },
  description: 'Fresh from the ocean, delivered to your door. Premium seafood from Tasman Star Seafoods — prawns, oysters, salmon, platters & more. Gold Coast\'s trusted seafood market.',
  metadataBase: new URL('https://tasman-admin.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tasman Star Seafoods | Premium Seafood Gold Coast',
    description: 'Fresh from the ocean, delivered to your door. Premium seafood — prawns, oysters, salmon, platters & more.',
    type: 'website',
    siteName: 'Tasman Star Seafoods',
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tasman Star Seafoods | Premium Seafood Gold Coast',
    description: 'Fresh from the ocean, delivered to your door. Premium seafood — prawns, oysters, salmon, platters & more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

**Step 2: Add Organization + WebSite JSON-LD to the body**

Add before the closing `</body>` tag (after `<Toaster>`):

```tsx
{/* Site-wide structured data */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://tasman-admin.vercel.app/#organization',
          name: 'Tasman Star Seafoods',
          url: 'https://tasman-admin.vercel.app',
          logo: {
            '@type': 'ImageObject',
            url: 'https://tasman-admin.vercel.app/assets/tasman-star-logo.png',
          },
          description: 'Gold Coast\'s trusted seafood destination — wholesale, retail, fleet, and freight all under one roof.',
          telephone: '+61755290844',
          email: 'admin@tasmanstarseafood.com',
          foundingDate: '2012',
          address: [
            {
              '@type': 'PostalAddress',
              streetAddress: '5-7 Olsen Ave',
              addressLocality: 'Labrador',
              addressRegion: 'QLD',
              postalCode: '4215',
              addressCountry: 'AU',
            },
            {
              '@type': 'PostalAddress',
              streetAddress: '201 Varsity Parade',
              addressLocality: 'Varsity Lakes',
              addressRegion: 'QLD',
              postalCode: '4227',
              addressCountry: 'AU',
            },
          ],
          sameAs: [
            'https://www.facebook.com/TasmanStarSeafoodMarket/',
            'https://www.instagram.com/tasmanstarseafoodmarket/',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://tasman-admin.vercel.app/#website',
          url: 'https://tasman-admin.vercel.app',
          name: 'Tasman Star Seafoods',
          publisher: { '@id': 'https://tasman-admin.vercel.app/#organization' },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://tasman-admin.vercel.app/search?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    }),
  }}
/>
```

**Step 3: Run `npx tsc --noEmit` to verify no type errors**

Expected: No errors

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(seo): add Organization + WebSite JSON-LD schemas, Twitter cards, and canonical URL to root layout"
```

---

### Task 2: Add FAQ Schema to About page

**Files:**
- Modify: `src/app/about/page.tsx:152-169` (existing JSON-LD script)

**Step 1: Enhance the About page JSON-LD with FAQ schema**

Replace the existing `<script type="application/ld+json">` block (lines 152-169) with a `@graph` containing both LocalBusiness and FAQPage:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LocalBusiness',
          '@id': 'https://tasman-admin.vercel.app/about#localbusiness',
          name: 'Tasman Star Seafoods',
          description: 'Gold Coast\'s trusted seafood destination — wholesale, retail, fleet, and freight.',
          url: 'https://tasman-admin.vercel.app',
          telephone: '+61755290844',
          address: [
            { '@type': 'PostalAddress', streetAddress: '5-7 Olsen Ave', addressLocality: 'Labrador', addressRegion: 'QLD', postalCode: '4215', addressCountry: 'AU' },
            { '@type': 'PostalAddress', streetAddress: '201 Varsity Parade', addressLocality: 'Varsity Lakes', addressRegion: 'QLD', postalCode: '4227', addressCountry: 'AU' },
          ],
          openingHours: 'Mo-Su 07:00-18:00',
          sameAs: [
            'https://www.facebook.com/TasmanStarSeafoodMarket/',
            'https://www.instagram.com/tasmanstarseafoodmarket/',
          ],
          image: 'https://tasman-admin.vercel.app/assets/tasman-star-logo.png',
          priceRange: '$$',
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Where are Tasman Star Seafoods stores located?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tasman Star Seafoods has two retail stores on the Gold Coast: 5-7 Olsen Ave, Labrador QLD 4215 and 201 Varsity Parade, Varsity Lakes QLD 4227. Both stores are open 7 days a week, 7am to 6pm.',
              },
            },
            {
              '@type': 'Question',
              name: 'What services does Tasman Star Seafoods offer?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tasman Star Seafoods offers retail seafood sales, wholesale supply for restaurants and grocers, their own fishing fleet (trawlers), and temperature-controlled transport and freight services across the east coast of Australia.',
              },
            },
            {
              '@type': 'Question',
              name: 'Does Tasman Star Seafoods deliver seafood?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, Tasman Star Seafoods offers online ordering with delivery. They also run their own temperature-controlled logistics fleet for wholesale deliveries across the Gold Coast and east coast of Australia.',
              },
            },
            {
              '@type': 'Question',
              name: 'How long has Tasman Star Seafoods been in business?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Tasman Star Seafoods has been serving the Gold Coast for over 13 years, growing from a small operation to a complete seafood supply chain with their own trawler fleet, retail stores, wholesale division, and freight services.',
              },
            },
            {
              '@type': 'Question',
              name: 'Can I buy wholesale seafood from Tasman Star?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, Tasman Star Seafoods supplies wholesale seafood to restaurants, cafes, and independent grocers. You can apply for a wholesale account through their website to access wholesale pricing and ordering.',
              },
            },
          ],
        },
      ],
    }),
  }}
/>
```

**Step 2: Update the About page metadata to include canonical URL**

Update lines 6-14:

```typescript
export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about Tasman Star Seafoods — Gold Coast\'s trusted seafood destination with 13+ years of experience in wholesale, retail, fleet, and freight.',
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        title: 'About Us | Tasman Star Seafoods',
        description: 'Gold Coast\'s trusted seafood destination — wholesale, retail, fleet, and freight all under one roof.',
        type: 'website',
    },
};
```

**Step 3: Run `npx tsc --noEmit`**

Expected: No errors

**Step 4: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat(seo): add FAQ schema and canonical URL to About page"
```

---

### Task 3: Add metadata to all auth pages

**Files:**
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/app/auth/register/page.tsx`
- Modify: `src/app/auth/forgot-password/page.tsx`
- Modify: `src/app/auth/reset-password/page.tsx`
- Modify: `src/app/auth/error/page.tsx`

**Step 1: Add metadata export to each auth page**

Add at the top of each file (after imports, before the component):

**login/page.tsx:**
```typescript
export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your Tasman Star Seafoods account to manage orders, track deliveries, and access exclusive deals.',
    robots: { index: false, follow: false },
};
```

**register/page.tsx:**
```typescript
export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create your Tasman Star Seafoods account for online ordering, order tracking, and exclusive deals on premium seafood.',
    robots: { index: false, follow: false },
};
```

**forgot-password/page.tsx:**
```typescript
export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your Tasman Star Seafoods account password.',
    robots: { index: false, follow: false },
};
```

**reset-password/page.tsx:**
```typescript
export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Set a new password for your Tasman Star Seafoods account.',
    robots: { index: false, follow: false },
};
```

**error/page.tsx:**
```typescript
export const metadata: Metadata = {
    title: 'Authentication Error',
    description: 'An authentication error occurred.',
    robots: { index: false, follow: false },
};
```

Note: Auth pages are `'use client'` — if so, extract the metadata into a separate `layout.tsx` for each auth route, or convert the page to a server component wrapping a client component. Check each file first.

If the page is `'use client'`, create a `layout.tsx` in the same directory:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: '...',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
```

**Step 2: Add `import type { Metadata } from 'next'` where needed**

**Step 3: Run `npx tsc --noEmit`**

**Step 4: Commit**

```bash
git add src/app/auth/
git commit -m "feat(seo): add metadata to all auth pages (noindex)"
```

---

### Task 4: Add metadata to checkout, order-confirmation, and account pages

**Files:**
- Modify/Create: `src/app/checkout/page.tsx` or layout
- Modify/Create: `src/app/order-confirmation/page.tsx` or layout
- Modify/Create: `src/app/account/page.tsx` or layout
- Modify/Create: `src/app/account/orders/page.tsx` or layout
- Modify/Create: `src/app/account/addresses/page.tsx` or layout

**Step 1: Add metadata to each page**

Same pattern as Task 3. All these pages should have `robots: { index: false, follow: false }`.

**checkout:**
```typescript
export const metadata: Metadata = {
    title: 'Checkout',
    description: 'Complete your Tasman Star Seafoods order. Secure checkout with Stripe.',
    robots: { index: false, follow: false },
};
```

**order-confirmation:**
```typescript
export const metadata: Metadata = {
    title: 'Order Confirmed',
    description: 'Your Tasman Star Seafoods order has been confirmed. Thank you for your purchase!',
    robots: { index: false, follow: false },
};
```

**account:**
```typescript
export const metadata: Metadata = {
    title: 'My Account',
    description: 'Manage your Tasman Star Seafoods account, orders, and delivery addresses.',
    robots: { index: false, follow: false },
};
```

**account/orders:**
```typescript
export const metadata: Metadata = {
    title: 'My Orders',
    description: 'View your Tasman Star Seafoods order history and track current orders.',
    robots: { index: false, follow: false },
};
```

**account/addresses:**
```typescript
export const metadata: Metadata = {
    title: 'My Addresses',
    description: 'Manage your delivery addresses for Tasman Star Seafoods orders.',
    robots: { index: false, follow: false },
};
```

**Step 2: Handle `'use client'` pages — use layout.tsx pattern from Task 3**

**Step 3: Run `npx tsc --noEmit`**

**Step 4: Commit**

```bash
git add src/app/checkout/ src/app/order-confirmation/ src/app/account/
git commit -m "feat(seo): add metadata to checkout, order-confirmation, and account pages (noindex)"
```

---

### Task 5: Add metadata to wholesale pages

**Files:**
- Modify/Create: `src/app/wholesale/page.tsx` or layout
- Modify/Create: `src/app/wholesale/login/page.tsx` or layout
- Modify/Create: `src/app/wholesale/apply/page.tsx` or layout
- Modify/Create: `src/app/wholesale/pending/page.tsx` or layout
- Modify/Create: `src/app/wholesale/prices/page.tsx` or layout
- Modify/Create: `src/app/wholesale/order/page.tsx` or layout

**Step 1: Add metadata to each wholesale page**

**wholesale/page.tsx** (public landing — indexable):
```typescript
export const metadata: Metadata = {
    title: 'Wholesale Seafood',
    description: 'Wholesale seafood supply for restaurants, cafes, and grocers on the Gold Coast. Apply for a Tasman Star Seafoods wholesale account today.',
    alternates: { canonical: '/wholesale' },
};
```

**wholesale/apply/page.tsx** (public — indexable):
```typescript
export const metadata: Metadata = {
    title: 'Apply for Wholesale',
    description: 'Apply for a Tasman Star Seafoods wholesale account. Bulk seafood supply for restaurants, cafes, and independent grocers.',
    alternates: { canonical: '/wholesale/apply' },
};
```

**wholesale/login, pending, prices, order** — all noindex:
```typescript
export const metadata: Metadata = {
    title: 'Wholesale Login',  // or Pending, Prices, Order
    description: '...',
    robots: { index: false, follow: false },
};
```

**Step 2: Handle `'use client'` pages**

**Step 3: Run `npx tsc --noEmit`**

**Step 4: Commit**

```bash
git add src/app/wholesale/
git commit -m "feat(seo): add metadata to wholesale pages"
```

---

### Task 6: Add canonical URLs to all existing pages with metadata

**Files:**
- Modify: `src/app/our-partner/page.tsx`
- Modify: `src/app/our-products/page.tsx`
- Modify: `src/app/our-products/layout.tsx`
- Modify: `src/app/our-business/online-delivery/page.tsx`
- Modify: `src/app/our-business/retail-stores/page.tsx`
- Modify: `src/app/our-business/wholesale/page.tsx`
- Modify: `src/app/our-business/transport/page.tsx`
- Modify: `src/app/deals/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/app/product/[slug]/page.tsx`

**Step 1: Add `alternates.canonical` to each metadata export**

For static pages, add:
```typescript
alternates: {
    canonical: '/path-here',
},
```

For the product page (`generateMetadata`), add:
```typescript
alternates: {
    canonical: `/product/${slug}`,
},
```

**Step 2: Run `npx tsc --noEmit`**

**Step 3: Commit**

```bash
git add src/app/
git commit -m "feat(seo): add canonical URLs to all pages with metadata"
```

---

### Task 7: Add metadata to homepage and fishing fleet page

**Files:**
- Modify: `src/app/page.tsx` — homepage is `'use client'`, needs a layout or conversion
- Modify: `src/app/our-business/fishing-fleet/page.tsx`

**Step 1: Create `src/app/(home)/layout.tsx` or add metadata via the root layout template**

Since homepage is `'use client'`, the root layout metadata already covers it. Just verify the root layout title template works. The homepage will inherit the default title from the template.

For fishing-fleet, add metadata (check if it's a server or client component first):

```typescript
export const metadata: Metadata = {
    title: 'Our Fishing Fleet',
    description: 'Tasman Star Seafoods operates its own fleet of commercial prawn trawlers, delivering the freshest catch direct from sea to store on the Gold Coast.',
    alternates: { canonical: '/our-business/fishing-fleet' },
};
```

**Step 2: Run `npx tsc --noEmit`**

**Step 3: Commit**

```bash
git add src/app/
git commit -m "feat(seo): add metadata to homepage and fishing fleet page"
```

---

## Division 2: Product Division — Product Pages, OG Images & Brand

### Task 8: Standardize brand name across the codebase

**Files:**
- Multiple files — grep for "Tasman Star Market", "Tasman Star Seafood Market" in metadata/OG/content

**Step 1: Find all brand name variants**

Run:
```bash
grep -r "Tasman Star Market\|Tasman Star Seafood Market" src/ --include="*.tsx" --include="*.ts" -l
```

**Step 2: Replace all metadata/OG occurrences**

- `"Tasman Star Market"` → `"Tasman Star Seafoods"` (in metadata titles)
- `"Tasman Star Seafood Market"` → `"Tasman Star Seafoods"` (in OG siteName, page content headings)

Note: Keep "Tasman Star Seafood Market" only when explicitly referring to the physical retail store (e.g., alt text for store photos). In all metadata, OG, and schema contexts, use "Tasman Star Seafoods".

**Step 3: Check the About page h2 on line 58**

Change: `Tasman Star Seafood Market` → `Tasman Star Seafoods`

**Step 4: Run `npx tsc --noEmit`**

**Step 5: Commit**

```bash
git add src/
git commit -m "feat(brand): standardize brand name to 'Tasman Star Seafoods' across all pages"
```

---

### Task 9: Enhance Product JSON-LD schema

**Files:**
- Modify: `src/app/product/[slug]/page.tsx:197-222`

**Step 1: Replace the existing Product JSON-LD with enhanced version**

Replace lines 197-222:

```tsx
{/* JSON-LD Product Structured Data */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || `Fresh ${product.name} from Tasman Star Seafoods`,
      image: product.imageUrls.length > 0 ? product.imageUrls : undefined,
      sku: product.id,
      category: product.category?.name,
      brand: {
        '@type': 'Brand',
        name: 'Tasman Star Seafoods',
      },
      offers: {
        '@type': 'Offer',
        url: `https://tasman-admin.vercel.app/product/${product.slug}`,
        price: Number(product.price).toFixed(2),
        priceCurrency: 'AUD',
        availability: product.isAvailable && product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Tasman Star Seafoods',
        },
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    }),
  }}
/>
```

**Step 2: Run `npx tsc --noEmit`**

**Step 3: Commit**

```bash
git add src/app/product/
git commit -m "feat(seo): enhance Product JSON-LD with brand, SKU, offer URL, and multiple images"
```

---

### Task 10: Add BreadcrumbList JSON-LD to product pages

**Files:**
- Modify: `src/app/product/[slug]/page.tsx:189-224`

**Step 1: Add BreadcrumbList JSON-LD alongside the Product schema**

Add a second `<script type="application/ld+json">` after the Product schema:

```tsx
{/* JSON-LD Breadcrumb Structured Data */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://tasman-admin.vercel.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Shop',
          item: 'https://tasman-admin.vercel.app/our-business/online-delivery',
        },
        ...(product.category ? [{
          '@type': 'ListItem',
          position: 3,
          name: product.category.name,
          item: `https://tasman-admin.vercel.app/our-products?category=${product.category.slug}`,
        }] : []),
        {
          '@type': 'ListItem',
          position: product.category ? 4 : 3,
          name: product.name,
        },
      ],
    }),
  }}
/>
```

**Step 2: Run `npx tsc --noEmit`**

**Step 3: Commit**

```bash
git add src/app/product/
git commit -m "feat(seo): add BreadcrumbList JSON-LD to product pages"
```

---

### Task 11: Create default site-wide OG image

**Files:**
- Create: `src/app/opengraph-image.tsx`

**Step 1: Create the default OG image**

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Tasman Star Seafoods — Premium Seafood Gold Coast';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020C1B 0%, #0A192F 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255,133,67,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo placeholder — orange circle with T */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#FF8543',
            marginBottom: '24px',
            fontSize: '40px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          TS
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Tasman Star Seafoods
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#FF8543',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Premium Seafood — Gold Coast
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '18px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          From the boats to the cold trucks, and straight to your business or home.
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #FF8543, transparent)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
```

**Step 2: Run `npm run build` to verify the OG image generates without error**

Or test with `npm run dev` and visit `http://localhost:3000/opengraph-image`.

**Step 3: Commit**

```bash
git add src/app/opengraph-image.tsx
git commit -m "feat(seo): add default site-wide dynamic OG image with Tasman Star branding"
```

---

### Task 12: Create per-product dynamic OG image

**Files:**
- Create: `src/app/product/[slug]/opengraph-image.tsx`

**Step 1: Create the product OG image**

```tsx
import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const alt = 'Tasman Star Seafoods Product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let productName = 'Premium Seafood';
  let productPrice = '';
  let productCategory = '';
  let productImage = '';

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { name: true, price: true, imageUrls: true, category: { select: { name: true } } },
    });
    if (product) {
      productName = product.name;
      productPrice = `$${Number(product.price).toFixed(2)}`;
      productCategory = product.category?.name || '';
      productImage = product.imageUrls[0] || '';
    }
  } catch {
    // Fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020C1B 0%, #0A192F 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Left side — product info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            flex: 1,
          }}
        >
          {/* Category badge */}
          {productCategory && (
            <div
              style={{
                fontSize: '14px',
                color: '#FF8543',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            >
              {productCategory}
            </div>
          )}

          {/* Product name */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}
          >
            {productName}
          </div>

          {/* Price */}
          {productPrice && (
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#FF8543',
                marginBottom: '24px',
              }}
            >
              {productPrice}
            </div>
          )}

          {/* Brand */}
          <div
            style={{
              fontSize: '16px',
              color: '#94a3b8',
            }}
          >
            Tasman Star Seafoods — Gold Coast
          </div>
        </div>

        {/* Right side — product image */}
        {productImage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '500px',
              padding: '40px',
            }}
          >
            <img
              src={productImage}
              alt={productName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '16px',
              }}
            />
          </div>
        )}

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #FF8543, transparent)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
```

**Important:** Edge runtime cannot use Prisma with the pg adapter. If this fails, switch to `export const runtime = 'nodejs'` or use a direct fetch to an API route. Check at build time.

**Step 2: Test with `npm run dev` — visit a product page and check `/product/[slug]/opengraph-image`**

**Step 3: Commit**

```bash
git add src/app/product/[slug]/opengraph-image.tsx
git commit -m "feat(seo): add per-product dynamic OG image with product name, price, and image"
```

---

### Task 13: Wrap ProductCard in semantic `<article>` element

**Files:**
- Modify: `src/components/ProductCard.tsx`

**Step 1: Read the full ProductCard component to find the outer wrapper element**

**Step 2: Change the outer `<div>` (or `<Link>`) wrapper to an `<article>` element**

The component likely has a root `<div>` or card wrapper. Change it to `<article>`:

```tsx
// Before:
<div className="group relative bg-theme-card ...">

// After:
<article className="group relative bg-theme-card ...">
```

And close with `</article>` instead of `</div>`.

**Step 3: Run `npx tsc --noEmit`**

**Step 4: Commit**

```bash
git add src/components/ProductCard.tsx
git commit -m "feat(seo): wrap ProductCard in semantic article element"
```

---

## Division 3: Testing Division

### Task 14: Write structured data validation tests

**Files:**
- Create: `src/__tests__/seo/structured-data.test.tsx`

**Step 1: Create the test file**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    orderItem: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

import { prisma } from '@/lib/prisma';

describe('Structured Data - Organization Schema', () => {
  it('root layout contains Organization JSON-LD', async () => {
    // Read and parse the layout file to verify schema presence
    const fs = await import('fs');
    const layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf-8');
    expect(layoutContent).toContain('@type');
    expect(layoutContent).toContain('Organization');
    expect(layoutContent).toContain('Tasman Star Seafoods');
    expect(layoutContent).toContain('https://www.facebook.com/TasmanStarSeafoodMarket/');
    expect(layoutContent).toContain('https://www.instagram.com/tasmanstarseafoodmarket/');
  });

  it('root layout contains WebSite JSON-LD with SearchAction', async () => {
    const fs = await import('fs');
    const layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf-8');
    expect(layoutContent).toContain('WebSite');
    expect(layoutContent).toContain('SearchAction');
    expect(layoutContent).toContain('search_term_string');
  });
});

describe('Structured Data - FAQ Schema', () => {
  it('about page contains FAQPage JSON-LD', async () => {
    const fs = await import('fs');
    const aboutContent = fs.readFileSync('src/app/about/page.tsx', 'utf-8');
    expect(aboutContent).toContain('FAQPage');
    expect(aboutContent).toContain('Question');
    expect(aboutContent).toContain('Answer');
  });
});

describe('Structured Data - Product Schema', () => {
  it('product page renders enhanced Product JSON-LD', async () => {
    const fs = await import('fs');
    const productContent = fs.readFileSync('src/app/product/[slug]/page.tsx', 'utf-8');
    expect(productContent).toContain("'@type': 'Product'");
    expect(productContent).toContain("'@type': 'Brand'");
    expect(productContent).toContain("'@type': 'Offer'");
    expect(productContent).toContain('BreadcrumbList');
  });
});

describe('Structured Data - LocalBusiness Schema', () => {
  it('about page contains LocalBusiness JSON-LD', async () => {
    const fs = await import('fs');
    const aboutContent = fs.readFileSync('src/app/about/page.tsx', 'utf-8');
    expect(aboutContent).toContain('LocalBusiness');
    expect(aboutContent).toContain('Labrador');
    expect(aboutContent).toContain('Varsity Lakes');
  });
});
```

**Step 2: Run `npx vitest run src/__tests__/seo/structured-data.test.tsx`**

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/__tests__/seo/
git commit -m "test(seo): add structured data validation tests"
```

---

### Task 15: Write metadata coverage tests

**Files:**
- Create: `src/__tests__/seo/metadata-coverage.test.ts`

**Step 1: Create the test file**

```typescript
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src/app');

// Pages that MUST have metadata (directly or via layout)
const PAGES_WITH_METADATA = [
  'layout.tsx',
  'about/page.tsx',
  'our-partner/page.tsx',
  'our-products/page.tsx',
  'deals/page.tsx',
  'search/page.tsx',
  'product/[slug]/page.tsx',
  'our-business/online-delivery/page.tsx',
  'our-business/retail-stores/page.tsx',
  'our-business/wholesale/page.tsx',
  'our-business/transport/page.tsx',
];

// Pages that must have robots noindex (directly or via layout in same dir)
const NOINDEX_PAGES = [
  'auth/login',
  'auth/register',
  'auth/forgot-password',
  'auth/reset-password',
  'checkout',
  'order-confirmation',
  'account',
];

function hasMetadata(dir: string): boolean {
  const pagePath = path.join(APP_DIR, dir, 'page.tsx');
  const layoutPath = path.join(APP_DIR, dir, 'layout.tsx');

  for (const filePath of [pagePath, layoutPath]) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('export const metadata') || content.includes('generateMetadata')) {
        return true;
      }
    }
  }
  return false;
}

describe('Metadata Coverage', () => {
  for (const page of PAGES_WITH_METADATA) {
    it(`${page} has metadata defined`, () => {
      const filePath = path.join(APP_DIR, page);
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasStaticMeta = content.includes('export const metadata');
      const hasDynamicMeta = content.includes('generateMetadata');
      expect(hasStaticMeta || hasDynamicMeta).toBe(true);
    });
  }
});

describe('Noindex Pages', () => {
  for (const dir of NOINDEX_PAGES) {
    it(`${dir} has noindex robots directive`, () => {
      expect(hasMetadata(dir)).toBe(true);

      const pagePath = path.join(APP_DIR, dir, 'page.tsx');
      const layoutPath = path.join(APP_DIR, dir, 'layout.tsx');
      let found = false;

      for (const filePath of [pagePath, layoutPath]) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content.includes('index: false')) {
            found = true;
            break;
          }
        }
      }
      expect(found).toBe(true);
    });
  }
});

describe('Canonical URLs', () => {
  it('root layout has metadataBase defined', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('metadataBase');
    expect(content).toContain('tasman-admin.vercel.app');
  });
});

describe('Brand Consistency', () => {
  it('no "Tasman Star Market" variants in metadata', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).not.toMatch(/Tasman Star Market(?! )/);
    expect(content).toContain('Tasman Star Seafoods');
  });
});

describe('Twitter Cards', () => {
  it('root layout has twitter card metadata', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('twitter');
    expect(content).toContain('summary_large_image');
  });
});
```

**Step 2: Run `npx vitest run src/__tests__/seo/metadata-coverage.test.ts`**

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/__tests__/seo/
git commit -m "test(seo): add metadata coverage and brand consistency tests"
```

---

### Task 16: Write OG image tests

**Files:**
- Create: `src/__tests__/seo/og-images.test.ts`

**Step 1: Create the test file**

```typescript
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src/app');

describe('OG Image Files', () => {
  it('default opengraph-image.tsx exists', () => {
    const filePath = path.join(APP_DIR, 'opengraph-image.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('product opengraph-image.tsx exists', () => {
    const filePath = path.join(APP_DIR, 'product/[slug]/opengraph-image.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('default OG image uses correct brand colors', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'opengraph-image.tsx'), 'utf-8');
    expect(content).toContain('#0A192F'); // Navy
    expect(content).toContain('#FF8543'); // Orange accent
    expect(content).toContain('Tasman Star Seafoods');
  });

  it('product OG image includes product data fields', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'product/[slug]/opengraph-image.tsx'), 'utf-8');
    expect(content).toContain('productName');
    expect(content).toContain('productPrice');
    expect(content).toContain('productImage');
  });

  it('OG images export correct dimensions (1200x630)', () => {
    for (const ogPath of ['opengraph-image.tsx', 'product/[slug]/opengraph-image.tsx']) {
      const content = fs.readFileSync(path.join(APP_DIR, ogPath), 'utf-8');
      expect(content).toContain('1200');
      expect(content).toContain('630');
    }
  });
});
```

**Step 2: Run `npx vitest run src/__tests__/seo/og-images.test.ts`**

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/__tests__/seo/
git commit -m "test(seo): add OG image validation tests"
```

---

### Task 17: Final verification and combined commit

**Step 1: Run full type check**

```bash
npx tsc --noEmit
```

**Step 2: Run all SEO tests**

```bash
npx vitest run src/__tests__/seo/
```

**Step 3: Run full test suite to check for regressions**

```bash
npx vitest run
```

**Step 4: Verify build succeeds**

```bash
npm run build
```

**Step 5: If all pass, commit any remaining changes**

```bash
git add -A
git commit -m "feat(seo): complete SEO/AEO/brand consistency improvements — structured data, metadata, OG images, and tests"
```

---

## Task Execution Order

```
Division 1 (Market):  Task 1 → 2 → 3 → 4 → 5 → 6 → 7
Division 2 (Product): Task 8 → 9 → 10 → 11 → 12 → 13
Division 3 (Testing): Task 14 → 15 → 16 → 17

Division 1 and 2 can run in PARALLEL.
Division 3 runs AFTER both 1 and 2 complete.
```
