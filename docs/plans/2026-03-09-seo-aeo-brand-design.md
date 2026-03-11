# SEO, AEO & Brand Consistency Design

**Date:** 2026-03-09
**Status:** Approved

## Overview
Comprehensive SEO/AEO/brand improvements for Tasman Star Seafoods, organized into three parallel divisions: Market, Product, and Testing.

## Brand Standards
- **Canonical name:** Tasman Star Seafoods
- **Short form:** Tasman Star
- **Social links:**
  - Facebook: https://www.facebook.com/TasmanStarSeafoodMarket/
  - Instagram: https://www.instagram.com/tasmanstarseafoodmarket/
- **Base URL:** https://tasman-admin.vercel.app

## Market Division — Site-Wide SEO & AEO

### 1a. Organization Schema (root layout)
Add JSON-LD `Organization` schema with: name, URL, logo, description, social links, contact info, addresses (Labrador + Varsity Lakes), founding date.

### 1b. Website + SearchAction Schema (root layout)
Add `WebSite` schema with `SearchAction` pointing to `/search?q={query}`.

### 1c. FAQ Schema (About page)
Wrap existing FAQ-like content in `FAQPage` + `Question`/`Answer` JSON-LD.

### 1d. Missing Page Metadata
Add `export const metadata` to: auth pages (login, register, forgot-password, reset-password), checkout, order-confirmation, account pages, wholesale pages. Non-indexable pages get `robots: { index: false }`.

### 1e. Canonical URLs
Add `alternates.canonical` to all pages.

### 1f. Twitter Card Tags
Add `twitter` metadata to root layout with `card: 'summary_large_image'`.

## Product Division — Product Pages, OG Images & Brand

### 2a. Brand Name Standardization
Replace all "Tasman Star Seafood Market", "Tasman Star Market" variants with "Tasman Star Seafoods".

### 2b. Product Schema Enhancements
Add `brand`, `manufacturer`, `sku`, `category`, multiple images array, `offers.url` to Product JSON-LD.

### 2c. BreadcrumbList JSON-LD
Add `BreadcrumbList` structured data on product detail and section pages.

### 2d. Dynamic OG Images
- `src/app/opengraph-image.tsx` — site-wide default with branding
- `src/app/product/[slug]/opengraph-image.tsx` — per-product with product info
- Template: navy background (#0A192F), orange accent (#FF8543), logo

### 2e. Semantic HTML Improvements
Wrap product cards in `<article>`, ensure heading hierarchy, add `<nav>` to breadcrumbs.

## Testing Division — Validation & QA

### 3a. Structured Data Validation Tests
Test all JSON-LD schemas render correctly and match schema.org specs.

### 3b. Metadata Coverage Tests
Verify every page has title, description, OG tags. Test canonical URLs. Test robots directives.

### 3c. OG Image Tests
Verify OG images render with correct branding and product data.

### 3d. Brand Consistency Checks
Grep for remaining brand name variants. Verify social links.

## Execution Strategy
Market and Product divisions run in parallel. Testing division runs after both complete.
