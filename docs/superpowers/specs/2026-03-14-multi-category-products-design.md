# Multi-Category Products Design

## Problem

Products can only belong to one category. Some products (e.g. Sockeye Salmon) logically belong in both "Frozen Traded" and "Fish (Fillets & Steaks)" and are currently duplicated as separate entries with different slugs. The owner wants to assign multiple categories to a single product via the admin panel.

## Design Decisions

- **No customer-facing indication** — products appear normally in each category, multi-category is an organizational tool
- **Checkbox list in admin** — all 15 categories shown as checkboxes for selection
- **Primary category** — one category marked as primary for breadcrumbs and canonical display; others are for filtering only
- **Public API shape preserved** — public endpoints continue returning `category: { id, name, slug }` (using the primary category) to avoid breaking frontend components. Only admin endpoints expose the full `categories` array.

## Schema Change

Replace the direct `categoryId` foreign key on `Product` with a many-to-many join table:

```prisma
model ProductCategory {
  id         String   @id @default(cuid())
  productId  String   @map("product_id")
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  categoryId String   @map("category_id")
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  isPrimary  Boolean  @default(false) @map("is_primary")

  @@unique([productId, categoryId])
  @@index([categoryId])
  @@index([productId])
  @@map("product_categories")
}
```

**Product model changes:**
- Remove: `categoryId String @map("category_id")` and `category Category @relation(...)`
- Remove: `@@index([categoryId])`
- Add: `categories ProductCategory[]`

**Category model changes:**
- Remove: `products Product[]`
- Add: `products ProductCategory[]`

**Database constraint:** Add a partial unique index to enforce exactly one primary category per product:
```sql
CREATE UNIQUE INDEX product_categories_primary_unique
ON product_categories (product_id) WHERE is_primary = true;
```

## Data Migration

The Prisma-generated migration SQL must be **manually edited** to include the data population step. `prisma migrate dev` only generates DDL — the DML insert must be added by hand.

Migration SQL order:
1. `CREATE TABLE product_categories` (join table)
2. `INSERT INTO product_categories (id, product_id, category_id, is_primary) SELECT gen_random_uuid(), id, category_id, true FROM products` (populate from existing data)
3. `CREATE UNIQUE INDEX product_categories_primary_unique ON product_categories (product_id) WHERE is_primary = true` (enforce single primary)
4. `ALTER TABLE products DROP COLUMN category_id` (remove old column)
5. Drop the old `products_category_id_idx` index

## API Changes

### Admin Product Create (POST /api/admin/products)

**Before:** `{ categoryId: string, ... }`
**After:** `{ categoryIds: string[], primaryCategoryId: string, ... }`

Validation:
- `categoryIds` must be non-empty
- `primaryCategoryId` must be included in `categoryIds`
- All category IDs must exist

Implementation: Create product, then bulk-create `ProductCategory` records. Invalidate categories cache key after creation.

### Admin Product Update (PUT /api/admin/products/[id])

**Before:** `{ categoryId?: string, ... }`
**After:** `{ categoryIds?: string[], primaryCategoryId?: string, ... }`

Validation: `categoryIds` and `primaryCategoryId` must be provided together or both omitted. If both omitted, existing category assignments are preserved.

Implementation: Delete existing `ProductCategory` records, re-create with new set. Invalidate categories cache key after update.

### Admin Product Get (GET /api/admin/products/[id])

**Before:** Returns `{ categoryId, category: { id, name } }`
**After:** Returns `{ categories: [{ id, name, slug, isPrimary }], primaryCategoryId }`

### Public Product List (GET /api/products)

**Query change:**
- Before: `where: { category: { slug: categorySlug } }`
- After: `where: { categories: { some: { category: { slug: categorySlug } } } }`

**Response shape preserved:** Continue returning `category: { id, name, slug }` using the primary category. This avoids breaking `ProductCardData` and all frontend consumers.

### Public Product Detail (GET /product/[slug])

Same approach — return `category` as singular using the primary. No response shape change for public consumers.

### Product Recommendations

`src/lib/recommendations.ts` and recommendation API routes use `categoryId` for "same category" logic. With multi-category, "same category" means **shares the primary category**. This preserves existing recommendation quality without ambiguity. The implementation changes from `product.categoryId` to `product.categories.find(c => c.isPrimary)?.categoryId`.

## Admin Form Changes

### Files affected:
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`

### UI:
- Replace single `<select>` dropdown with checkbox list of all categories
- Each checked category shows a radio button or star to mark as primary
- First checked category auto-becomes primary if none explicitly selected
- Form state changes from `categoryId: string` to `categoryIds: string[]` and `primaryCategoryId: string`

## Frontend Filtering Changes

### OnlineDeliveryProducts.tsx:
- Product grouping: iterate each product's categories to add the product to each matching group (a product in 2 categories appears in 2 carousels)
- But since the public API returns singular `category`, we need to change the API query approach: when no category filter is applied, the API must return products with ALL their category slugs so the frontend can group them. Add a `categorySlugs: string[]` field to the public product response for grouping purposes, while keeping `category` as the primary.

**Alternative (simpler):** Fetch products per category using the existing `?category=slug` parameter for each category carousel. This means N+1 requests but keeps the API simple and each request is cached.

**Chosen approach:** Add `categorySlugs: string[]` to the public product list response. This is a non-breaking addition (adds a field, doesn't change existing ones) and avoids N+1 requests.

### Product detail page (`src/app/product/[slug]/page.tsx`):
- No changes needed — `category` field still returns the primary category for breadcrumbs and JSON-LD structured data

### CategoryCircles.tsx:
- No changes needed

### ProductCard.tsx / ProductCardData:
- No changes needed — `category` field preserved as singular

## Additional Files Requiring Updates

### Files using `product.category` or `product.categoryId` internally:
- `src/app/api/products/[slug]/route.ts` — Query changes from `include: { category }` to `include: { categories: { include: { category } } }`, but response still maps to singular `category` using primary
- `src/app/api/products/[slug]/recommendations/route.ts` — Uses `product.categoryId` for same-category queries, change to primary category lookup
- `src/app/api/products/recommendations/route.ts` — Same pattern for cart-based recommendations
- `src/lib/recommendations.ts` — Change `categoryId` parameter to use primary category
- `src/app/product/[slug]/opengraph-image.tsx` — Query change, map to primary category name
- `src/app/product/[slug]/ProductDetailClient.tsx` — No change needed (receives already-mapped singular `category`)

### Seed file:
- `prisma/seed.ts` — Update product creation to use `ProductCategory` join table instead of direct `categoryId`

### Test files:
- `src/__tests__/api/admin/products.test.ts` — Update mock data and assertions
- `src/__tests__/api/products-recommendations.test.ts` — Update mock data
- `src/__tests__/helpers/mocks.ts` — Update product mock factory

## Cache Invalidation

When product categories are created or updated via admin API, invalidate the `categories` cache key so category product counts update immediately. Product cache (60s TTL) handles itself naturally.

## Admin Product List

`src/app/admin/products/page.tsx` — change category column from `product.category.name` to display primary category name. The admin product list API query changes to include `categories` relation.

## Files Changed (Complete List)

1. `prisma/schema.prisma` — Add `ProductCategory` model, update `Product` and `Category` relations
2. `prisma/migrations/*/migration.sql` — Generated + manually edited migration
3. `prisma/seed.ts` — Update product seeding to use join table
4. `src/app/api/admin/products/route.ts` — Create product with category assignments
5. `src/app/api/admin/products/[id]/route.ts` — Get/Update product with categories
6. `src/app/api/products/route.ts` — Public product list query + add `categorySlugs`
7. `src/app/api/products/[slug]/route.ts` — Public product detail query
8. `src/app/api/products/[slug]/recommendations/route.ts` — Use primary category
9. `src/app/api/products/recommendations/route.ts` — Use primary category
10. `src/lib/recommendations.ts` — Change categoryId to primary category lookup
11. `src/app/admin/products/new/page.tsx` — Checkbox category form
12. `src/app/admin/products/[id]/edit/page.tsx` — Checkbox category form
13. `src/app/admin/products/page.tsx` — Admin product list category column
14. `src/app/our-business/online-delivery/OnlineDeliveryProducts.tsx` — Multi-category grouping
15. `src/app/product/[slug]/page.tsx` — Query change (response shape unchanged)
16. `src/app/product/[slug]/opengraph-image.tsx` — Query change for category name
17. `src/app/api/admin/categories/route.ts` — Update product count query
18. `src/__tests__/api/admin/products.test.ts` — Update tests
19. `src/__tests__/api/products-recommendations.test.ts` — Update tests
20. `src/__tests__/helpers/mocks.ts` — Update mock factory
