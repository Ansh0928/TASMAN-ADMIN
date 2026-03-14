# Multi-Category Products Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow products to belong to multiple categories via a many-to-many join table, with a primary category for display.

**Architecture:** Replace the direct `categoryId` FK on `products` with a `product_categories` join table containing `isPrimary` flag. Public API preserves singular `category` response shape (using primary). Admin API exposes full categories array. Frontend filtering uses `categorySlugs` field for multi-group display.

**Tech Stack:** Prisma ORM, PostgreSQL, Next.js App Router, React

**Spec:** `docs/superpowers/specs/2026-03-14-multi-category-products-design.md`

---

## Chunk 1: Schema Migration & Data Population

### Task 1: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma:102-145`

- [ ] **Step 1: Add ProductCategory model and update relations**

In `prisma/schema.prisma`, replace the Category and Product models:

```prisma
model Category {
  id          String            @id @default(cuid())
  name        String
  slug        String            @unique
  description String?
  imageUrl    String?           @map("image_url")
  sortOrder   Int               @default(0) @map("sort_order")
  products    ProductCategory[]

  @@map("categories")
}

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

model Product {
  id                String            @id @default(cuid())
  name              String
  slug              String            @unique
  description       String?
  imageUrls         String[]          @map("image_urls")
  categories        ProductCategory[]
  price             Decimal           @db.Decimal(10, 2)
  stockQuantity     Int               @default(0) @map("stock_quantity")
  unit              Unit              @default(PIECE)
  isAvailable       Boolean           @default(true) @map("is_available")
  isFeatured        Boolean           @default(false) @map("is_featured")
  isTodaysSpecial   Boolean           @default(false) @map("is_todays_special")
  discountPercent   Int?              @map("discount_percent")
  countryOfOrigin   String            @default("Australia") @map("country_of_origin")
  tags              String[]
  relatedProductIds String[]          @map("related_product_ids")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  orderItems        OrderItem[]
  reviews           Review[]

  @@index([isAvailable])
  @@index([isFeatured])
  @@index([isTodaysSpecial])
  @@index([isAvailable, isFeatured])
  @@index([isAvailable, isTodaysSpecial])
  @@index([createdAt])
  @@map("products")
}
```

Key changes vs current:
- `Product`: removed `categoryId`, `category`, `@@index([categoryId])`. Added `categories ProductCategory[]`
- `Category`: changed `products Product[]` to `products ProductCategory[]`
- Added new `ProductCategory` model

- [ ] **Step 2: Generate migration (do NOT apply yet)**

Run: `npx prisma migrate dev --create-only --name multi-category-products`
Expected: Creates a new migration folder in `prisma/migrations/` with a `migration.sql` file

- [ ] **Step 3: Edit the generated migration SQL**

The generated SQL will try to drop `category_id` and create the join table. We need to insert data BETWEEN these steps. Edit the generated `migration.sql` to have this order:

```sql
-- 1. Create the join table FIRST
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- 2. Populate from existing data BEFORE dropping the column
INSERT INTO "product_categories" ("id", "product_id", "category_id", "is_primary")
SELECT gen_random_uuid(), "id", "category_id", true
FROM "products"
WHERE "category_id" IS NOT NULL;

-- 3. Create indexes and constraints
CREATE UNIQUE INDEX "product_categories_product_id_category_id_key" ON "product_categories"("product_id", "category_id");
CREATE INDEX "product_categories_category_id_idx" ON "product_categories"("category_id");
CREATE INDEX "product_categories_product_id_idx" ON "product_categories"("product_id");

-- 4. Enforce exactly one primary per product
CREATE UNIQUE INDEX "product_categories_primary_unique" ON "product_categories" ("product_id") WHERE "is_primary" = true;

-- 5. Add foreign keys
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. NOW safe to drop the old column and its index
DROP INDEX IF EXISTS "products_category_id_idx";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_category_id_fkey";
ALTER TABLE "products" DROP COLUMN "category_id";
```

**Important:** Remove any auto-generated lines that conflict with this order (Prisma may generate DROP COLUMN before CREATE TABLE — reorder them).

- [ ] **Step 4: Apply the migration**

Run: `npx prisma migrate dev`
Expected: Migration applied successfully

- [ ] **Step 5: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: Prisma client regenerated with new types

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add product_categories join table for multi-category support"
```

---

## Chunk 2: Admin API Updates

### Task 2: Update Admin Product GET (single)

**Files:**
- Modify: `src/app/api/admin/products/[id]/route.ts:13-41`

- [ ] **Step 1: Update GET handler query and response**

Change the `include` from `{ category: true }` to `{ categories: { include: { category: true }, orderBy: { isPrimary: 'desc' } } }`.

Update the response mapping:

```typescript
// In GET handler, replace lines 14-41:
const product = await prisma.product.findUnique({
    where: { id },
    include: {
        categories: {
            include: { category: true },
            orderBy: { isPrimary: 'desc' as const },
        },
    },
});

if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
}

const primaryCat = product.categories.find(pc => pc.isPrimary)?.category;

return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    imageUrls: product.imageUrls,
    categories: product.categories.map(pc => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
        isPrimary: pc.isPrimary,
    })),
    primaryCategoryId: primaryCat?.id || '',
    stockQuantity: product.stockQuantity,
    unit: product.unit,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    isTodaysSpecial: product.isTodaysSpecial,
    discountPercent: product.discountPercent,
    tags: product.tags,
    countryOfOrigin: product.countryOfOrigin,
    relatedProductIds: product.relatedProductIds,
});
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 3: Update Admin Product PUT

**Files:**
- Modify: `src/app/api/admin/products/[id]/route.ts:48-85`

- [ ] **Step 1: Update PUT handler to accept categoryIds + primaryCategoryId**

Replace the PUT handler body (lines 54-80):

```typescript
const body = await request.json();
const { name, description, price, categoryIds, primaryCategoryId, imageUrls, stockQuantity, unit, isAvailable, isFeatured, isTodaysSpecial, discountPercent, tags, countryOfOrigin, relatedProductIds } = body;

// Validate category inputs: both must be provided together or both omitted
if ((categoryIds && !primaryCategoryId) || (!categoryIds && primaryCategoryId)) {
    return NextResponse.json({ message: 'categoryIds and primaryCategoryId must be provided together' }, { status: 400 });
}

if (categoryIds) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return NextResponse.json({ message: 'At least one category is required' }, { status: 400 });
    }
    if (!categoryIds.includes(primaryCategoryId)) {
        return NextResponse.json({ message: 'primaryCategoryId must be in categoryIds' }, { status: 400 });
    }
}

const product = await prisma.$transaction(async (tx) => {
    // Update product fields
    const updated = await tx.product.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(price && { price: parseFloat(price) }),
            ...(imageUrls && { imageUrls: (imageUrls as string[]).map((u: string) => u.split('?')[0]) }),
            ...(stockQuantity !== undefined && { stockQuantity }),
            ...(unit && { unit }),
            ...(isAvailable !== undefined && { isAvailable }),
            ...(isFeatured !== undefined && { isFeatured }),
            ...(isTodaysSpecial !== undefined && { isTodaysSpecial }),
            ...(discountPercent !== undefined && { discountPercent: discountPercent ? parseInt(discountPercent, 10) : null }),
            ...(countryOfOrigin !== undefined && { countryOfOrigin }),
            ...(tags && { tags }),
            ...(relatedProductIds !== undefined && { relatedProductIds }),
        },
    });

    // Update categories if provided
    if (categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        await tx.productCategory.createMany({
            data: categoryIds.map((catId: string) => ({
                productId: id,
                categoryId: catId,
                isPrimary: catId === primaryCategoryId,
            })),
        });
    }

    return updated;
});

revalidateTag('products', 'max');
// Invalidate categories cache so product counts update
await deleteCached('categories');
return NextResponse.json({ product });
```

Add `import { deleteCached } from '@/lib/redis-cache';` at the top of the file.

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 4: Update Admin Product POST (create)

**Files:**
- Modify: `src/app/api/admin/products/route.ts:60-104`

- [ ] **Step 1: Update POST handler**

Replace the POST body destructuring and create logic:

```typescript
const body = await request.json();
const { name, description, price, categoryIds, primaryCategoryId, imageUrls, stockQuantity, unit, isAvailable, isFeatured, isTodaysSpecial, discountPercent, tags, countryOfOrigin } = body;

if (!name || !price || !categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    return NextResponse.json({ message: 'Name, price, and at least one category are required' }, { status: 400 });
}

if (primaryCategoryId && !categoryIds.includes(primaryCategoryId)) {
    return NextResponse.json({ message: 'primaryCategoryId must be in categoryIds' }, { status: 400 });
}
const effectivePrimary = primaryCategoryId || categoryIds[0];

const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const existing = await prisma.product.findUnique({ where: { slug } });
const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
        data: {
            name,
            slug: finalSlug,
            description: description || null,
            price: parseFloat(price),
            imageUrls: imageUrls || [],
            stockQuantity: stockQuantity || 0,
            unit: unit || 'PIECE',
            isAvailable: isAvailable ?? true,
            isFeatured: isFeatured ?? false,
            isTodaysSpecial: isTodaysSpecial ?? false,
            discountPercent: isTodaysSpecial && discountPercent ? parseInt(discountPercent, 10) : null,
            countryOfOrigin: countryOfOrigin || 'Australia',
            tags: tags || [],
        },
    });

    await tx.productCategory.createMany({
        data: categoryIds.map((catId: string) => ({
            productId: created.id,
            categoryId: catId,
            isPrimary: catId === effectivePrimary,
        })),
    });

    return created;
});

revalidateTag('products', 'max');
await deleteCached('categories');
return NextResponse.json({ product }, { status: 201 });
```

Add `import { deleteCached } from '@/lib/redis-cache';` at the top.

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 5: Update Admin Product GET (list)

**Files:**
- Modify: `src/app/api/admin/products/route.ts:26-53`

- [ ] **Step 1: Update list query and response mapping**

Change `include: { category: true }` to:
```typescript
include: {
    categories: {
        include: { category: true },
        where: { isPrimary: true },
    },
},
```

Update the response mapping (line 44):
```typescript
category: { id: p.categories[0]?.category.id || '', name: p.categories[0]?.category.name || 'Uncategorized' },
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 6: Update Admin Categories API

**Files:**
- Modify: `src/app/api/admin/categories/route.ts:11-18`

- [ ] **Step 1: Update product count query**

The `_count: { select: { products: true } }` will now count `ProductCategory` join records, which is correct (each represents a product assignment). No code change needed, but verify the count works correctly.

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Commit all admin API changes**

```bash
git add src/app/api/admin/products/ src/app/api/admin/categories/
git commit -m "feat: update admin APIs for multi-category products"
```

---

## Chunk 3: Public API Updates

### Task 7: Update Public Product List API

**Files:**
- Modify: `src/app/api/products/route.ts`

- [ ] **Step 1: Update category filter query and response**

Change the category filter (lines 28-32) from:
```typescript
if (categorySlug) {
    where.category = {
        slug: categorySlug,
    };
}
```
to:
```typescript
if (categorySlug) {
    where.categories = {
        some: { category: { slug: categorySlug } },
    };
}
```

Change the select (lines 62-68) from:
```typescript
category: {
    select: {
        id: true,
        name: true,
        slug: true,
    },
},
```
to:
```typescript
categories: {
    select: { isPrimary: true, category: { select: { id: true, name: true, slug: true } } },
},
```

Change the response mapping (lines 88-92) from:
```typescript
category: {
    id: p.category.id,
    name: p.category.name,
    slug: p.category.slug,
},
```
to:
```typescript
category: (() => {
    const primary = p.categories.find((pc: any) => pc.isPrimary)?.category || p.categories[0]?.category;
    return primary ? { id: primary.id, name: primary.name, slug: primary.slug } : { id: '', name: '', slug: '' };
})(),
categorySlugs: p.categories.map((pc: any) => pc.category.slug),
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 8: Update Public Product Detail API

**Files:**
- Modify: `src/app/api/products/[slug]/route.ts`

- [ ] **Step 1: Update query and response**

Change `include: { category: true }` to:
```typescript
include: {
    categories: {
        include: { category: true },
    },
},
```

Update response (lines 30-34):
```typescript
category: (() => {
    const primary = product.categories.find(pc => pc.isPrimary)?.category || product.categories[0]?.category;
    return primary ? { id: primary.id, name: primary.name, slug: primary.slug } : { id: '', name: '', slug: '' };
})(),
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 9: Update Product Detail Page (Server Component)

**Files:**
- Modify: `src/app/product/[slug]/page.tsx`

- [ ] **Step 1: Update Prisma query, recommendation call, and serialization**

Change both `include: { category: true }` calls (lines 51 and 75) to:
```typescript
include: {
    categories: {
        include: { category: true },
    },
},
```

Update the `serializeProduct` function parameter type (line 18):
```typescript
category: { id: string; name: string; slug: string } | null;
```
No change needed here — the function already handles it.

Before calling `serializeProduct`, map the primary category:
```typescript
const primaryCat = product.categories.find(pc => pc.isPrimary)?.category || product.categories[0]?.category;
const productWithCategory = { ...product, category: primaryCat || null };
const serialized = serializeProduct(productWithCategory);
```

Update the `getProductRecommendations` call (line 82-86):
```typescript
const primaryCategoryId = product.categories.find(pc => pc.isPrimary)?.categoryId || product.categories[0]?.categoryId || '';
const { relatedProducts, suggestedProducts } = await getProductRecommendations(
    product.id,
    primaryCategoryId,
    product.relatedProductIds,
);
```

Update the JSON-LD structured data (line 109):
```typescript
category: primaryCat?.name,
```

Update the breadcrumb JSON-LD (line 146):
```typescript
...(primaryCat ? [{ '@type': 'ListItem', position: 3, name: primaryCat.name, item: `https://tasman-admin.vercel.app/our-products?category=${primaryCat.slug}` }] : []),
{ '@type': 'ListItem', position: primaryCat ? 4 : 3, name: product.name },
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 10: Update OpenGraph Image

**Files:**
- Modify: `src/app/product/[slug]/opengraph-image.tsx:17-19`

- [ ] **Step 1: Update query**

Change line 19 from:
```typescript
select: { name: true, price: true, imageUrls: true, category: { select: { name: true } } },
```
to:
```typescript
select: {
    name: true,
    price: true,
    imageUrls: true,
    categories: {
        include: { category: { select: { name: true } } },
        where: { isPrimary: true },
    },
},
```

Update line 24 from:
```typescript
productCategory = product.category?.name || '';
```
to:
```typescript
productCategory = product.categories[0]?.category?.name || '';
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 11: Update Recommendations Library

**Files:**
- Modify: `src/lib/recommendations.ts`

- [ ] **Step 1: Update queries to use join table**

The function signature stays the same (`categoryId: string` — this is the primary category ID passed by the caller).

Change line 26 from:
```typescript
where: { categoryId, id: { not: productId }, isAvailable: true },
```
to:
```typescript
where: {
    categories: { some: { categoryId } },
    id: { not: productId },
    isAvailable: true,
},
```

Change line 44 from:
```typescript
where: { categoryId: { not: categoryId }, isAvailable: true, isFeatured: true },
```
to:
```typescript
where: {
    NOT: { categories: { some: { categoryId } } },
    isAvailable: true,
    isFeatured: true,
},
```

Update the `include` on all queries: change `include: { category: true }` to:
```typescript
include: {
    categories: {
        include: { category: true },
        where: { isPrimary: true },
    },
},
```

Update the type at line 4-6. The return type needs to match — the serializers in the calling code expect a `category` field. Add a helper to map the response:

```typescript
type ProductWithCategories = Awaited<
  ReturnType<typeof prisma.product.findMany<{
    include: { categories: { include: { category: true }; where: { isPrimary: true } } }
  }>>
>[number];

type ProductWithCategory = ProductWithCategories & {
  category: ProductWithCategories['categories'][0]['category'];
  categoryId: string;
};

function mapPrimaryCategory(p: ProductWithCategories): ProductWithCategory {
  const primary = p.categories[0];
  return {
    ...p,
    category: primary?.category ?? { id: '', name: '', slug: '', description: null, imageUrl: null, sortOrder: 0 },
    categoryId: primary?.categoryId ?? '',
  };
}
```

Then map all results through `mapPrimaryCategory` before returning.

Update the "You May Also Like" filter at line 104 from:
```typescript
if (!ymalSeen.has(p.id) && p.categoryId !== categoryId) {
```
to use the mapped `categoryId` field (which comes from `mapPrimaryCategory`), which stays the same since we mapped it.

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 12: Update Slug Recommendations Route

**Files:**
- Modify: `src/app/api/products/[slug]/recommendations/route.ts`

- [ ] **Step 1: Update all queries from categoryId to join table**

Change `include: { category: true }` to `include: { categories: { include: { category: true } } }` in the product lookup (line 44-47).

After fetching the product, extract primary category:
```typescript
const primaryCategoryId = product.categories.find(pc => pc.isPrimary)?.categoryId || product.categories[0]?.categoryId || '';
```

Replace all `product.categoryId` references with `primaryCategoryId`.

For `sameCategoryProducts` (line 56-65), change `where: { categoryId: product.categoryId, ... }` to:
```typescript
where: {
    categories: { some: { categoryId: primaryCategoryId } },
    id: { not: product.id },
    isAvailable: true,
},
```

For `otherCategoryFeatured` (line 134-143), change `where: { categoryId: { not: product.categoryId }, ... }` to:
```typescript
where: {
    NOT: { categories: { some: { categoryId: primaryCategoryId } } },
    isAvailable: true,
    isFeatured: true,
},
```

All `include: { category: true }` in sub-queries change to:
```typescript
include: {
    categories: {
        include: { category: true },
        where: { isPrimary: true },
    },
},
```

Update `serializeProduct` function to map from categories array:
```typescript
function serializeProduct(p: any) {
    const primaryCat = p.categories?.find((pc: any) => pc.isPrimary)?.category || p.categories?.[0]?.category;
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || undefined,
        price: Number(p.price).toString(),
        imageUrls: p.imageUrls,
        category: primaryCat ? { id: primaryCat.id, name: primaryCat.name, slug: primaryCat.slug } : { id: '', name: '', slug: '' },
        unit: p.unit,
        stockQuantity: p.stockQuantity,
        isAvailable: p.isAvailable,
        isFeatured: p.isFeatured,
        isTodaysSpecial: p.isTodaysSpecial,
        tags: p.tags,
    };
}
```

Update `p.categoryId !== product.categoryId` filter (line 182) to use the mapped primary:
```typescript
// Add categoryId to each product after query for filtering
const withCategoryId = (p: any) => ({
    ...p,
    categoryId: p.categories?.find((pc: any) => pc.isPrimary)?.categoryId || p.categories?.[0]?.categoryId || '',
});
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

### Task 13: Update Cart Recommendations Route

**Files:**
- Modify: `src/app/api/products/recommendations/route.ts`

- [ ] **Step 1: Update cart category lookups**

Change the cart products query (lines 36-40) from:
```typescript
const cartProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { categoryId: true },
});
const cartCategoryIds = [...new Set(cartProducts.map(p => p.categoryId))];
```
to:
```typescript
const cartProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
        categories: {
            select: { categoryId: true },
            where: { isPrimary: true },
        },
    },
});
const cartCategoryIds = [...new Set(cartProducts.map(p => p.categories[0]?.categoryId).filter(Boolean))];
```

Change `categoryId: { notIn: cartCategoryIds }` (line 48) to:
```typescript
NOT: { categories: { some: { categoryId: { in: cartCategoryIds }, isPrimary: true } } },
```

Change `categoryId: { in: cartCategoryIds }` (line 111) to:
```typescript
categories: { some: { categoryId: { in: cartCategoryIds }, isPrimary: true } },
```

Update all `include: { category: true }` to:
```typescript
include: {
    categories: {
        include: { category: true },
        where: { isPrimary: true },
    },
},
```

Update `serializeProduct` the same way as Task 12.

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit all public API changes**

```bash
git add src/app/api/products/ src/app/product/ src/lib/recommendations.ts
git commit -m "feat: update public APIs and recommendations for multi-category"
```

---

## Chunk 4: Admin Form UI Changes

### Task 14: Update New Product Form

**Files:**
- Modify: `src/app/admin/products/new/page.tsx`

- [ ] **Step 1: Update form state**

Replace the form state (lines 21-35):
```typescript
const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryIds: [] as string[],
    primaryCategoryId: '',
    imageUrls: [] as string[],
    stockQuantity: '0',
    unit: 'PIECE',
    isAvailable: true,
    isFeatured: false,
    isTodaysSpecial: false,
    discountPercent: '',
    countryOfOrigin: 'Australia',
    tags: '',
});
```

- [ ] **Step 2: Replace category select with checkbox list**

Replace the category `<select>` block (lines 125-138) with:
```tsx
<div>
    <label className="block text-theme-text-muted text-sm mb-1">Categories *</label>
    <div className="bg-theme-secondary border border-theme-border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
        {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-3 py-1 cursor-pointer hover:bg-theme-primary/50 rounded px-2">
                <input
                    type="checkbox"
                    checked={form.categoryIds.includes(c.id)}
                    onChange={(e) => {
                        const newIds = e.target.checked
                            ? [...form.categoryIds, c.id]
                            : form.categoryIds.filter(id => id !== c.id);
                        const newPrimary = !e.target.checked && form.primaryCategoryId === c.id
                            ? newIds[0] || ''
                            : form.primaryCategoryId || (e.target.checked && newIds.length === 1 ? c.id : form.primaryCategoryId);
                        setForm({ ...form, categoryIds: newIds, primaryCategoryId: newPrimary });
                    }}
                    className="accent-theme-accent"
                />
                <span className="text-theme-text text-sm flex-1">{c.name}</span>
                {form.categoryIds.includes(c.id) && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setForm({ ...form, primaryCategoryId: c.id });
                        }}
                        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            form.primaryCategoryId === c.id
                                ? 'bg-theme-accent text-white'
                                : 'bg-theme-primary text-theme-text-muted hover:bg-theme-accent/20'
                        }`}
                    >
                        {form.primaryCategoryId === c.id ? 'Primary' : 'Set primary'}
                    </button>
                )}
            </label>
        ))}
    </div>
    {form.categoryIds.length === 0 && (
        <p className="text-red-400 text-xs mt-1">Select at least one category</p>
    )}
</div>
```

This replaces the grid column that had price + category. Now price gets its own row and categories get a full-width section. Adjust the grid layout:
- Keep the price input in its own `<div>` (no grid cols-2 with category anymore)
- Place the categories section as a standalone full-width block

- [ ] **Step 3: Update handleSubmit**

In the `body: JSON.stringify()` call (lines 53-59), ensure `categoryIds` and `primaryCategoryId` are sent instead of `categoryId`:
```typescript
body: JSON.stringify({
    ...form,
    imageUrls: form.imageUrls,
    stockQuantity: parseInt(form.stockQuantity, 10),
    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    countryOfOrigin: form.countryOfOrigin,
}),
```

The spread of `form` already includes `categoryIds` and `primaryCategoryId`.

- [ ] **Step 4: Verify the form renders**

Run: `npm run dev`
Navigate to `/admin/products/new` in browser. Verify:
- Categories show as checkboxes
- Checking a category auto-sets it as primary if it's the first one
- "Set primary" / "Primary" buttons work
- Form submits successfully

### Task 15: Update Edit Product Form

**Files:**
- Modify: `src/app/admin/products/[id]/edit/page.tsx`

- [ ] **Step 1: Update form state**

Replace line 40 `categoryId: '',` with:
```typescript
categoryIds: [] as string[],
primaryCategoryId: '',
```

- [ ] **Step 2: Update form population from API response**

Replace line 65 `categoryId: product.categoryId || '',` with:
```typescript
categoryIds: (product.categories || []).map((c: any) => c.id),
primaryCategoryId: (product.categories || []).find((c: any) => c.isPrimary)?.id || '',
```

- [ ] **Step 3: Replace category select with same checkbox UI as new form**

Replace the category `<select>` block (lines 182-192) with the exact same checkbox component from Task 14.

- [ ] **Step 4: Update handleSubmit**

The `...form` spread already sends `categoryIds` and `primaryCategoryId`. Remove `categoryId` from the spread if still present.

- [ ] **Step 5: Verify the form renders**

Run: `npm run dev`
Navigate to edit an existing product. Verify:
- Existing categories are pre-checked
- Primary category is marked
- Can change categories and primary
- Save works

- [ ] **Step 6: Commit admin form changes**

```bash
git add src/app/admin/products/
git commit -m "feat: admin product forms with multi-category checkbox UI"
```

---

## Chunk 5: Frontend Filtering Updates

### Task 16: Update OnlineDeliveryProducts

**Files:**
- Modify: `src/app/our-business/online-delivery/OnlineDeliveryProducts.tsx`

- [ ] **Step 1: Update ProductCardData usage for multi-category grouping**

The `ProductCardData` type keeps `category` as singular (no changes to ProductCard.tsx). But we need to handle `categorySlugs` from the API.

Update the type used locally. After the imports, add:
```typescript
type ProductWithSlugs = ProductCardData & { categorySlugs?: string[] };
```

Change state types from `ProductCardData[]` to `ProductWithSlugs[]`:
- `allProducts` state (line 26)
- `categoryProducts` state (line 25)
- `bestBuys` (line 22) — stays as `ProductCardData[]` (doesn't need slugs)
- `freshPickups` (line 23) — stays as `ProductCardData[]`

- [ ] **Step 2: Update product grouping logic**

Replace the grouping loop (lines 124-131):
```typescript
const grouped: Record<string, ProductWithSlugs[]> = {};
for (const product of products) {
    const slugs = (product as ProductWithSlugs).categorySlugs || [product.category?.slug].filter(Boolean);
    for (const slug of slugs) {
        if (!grouped[slug]) grouped[slug] = [];
        grouped[slug].push(product);
    }
}
setCategoryProducts(grouped);
```

- [ ] **Step 3: Update loadMoreProducts grouping**

Replace the grouping in `loadMoreProducts` (lines 72-81):
```typescript
setCategoryProducts(prev => {
    const updated = { ...prev };
    for (const product of newProducts) {
        const slugs = (product as ProductWithSlugs).categorySlugs || [product.category?.slug].filter(Boolean);
        for (const slug of slugs) {
            if (!updated[slug]) updated[slug] = [];
            updated[slug].push(product);
        }
    }
    return updated;
});
```

- [ ] **Step 4: Update filter logic**

Replace line 146:
```typescript
: allProducts.filter(p => p.category?.slug === activeCategory);
```
with:
```typescript
: allProducts.filter(p =>
    (p as ProductWithSlugs).categorySlugs?.includes(activeCategory) || p.category?.slug === activeCategory
);
```

- [ ] **Step 5: Verify frontend filtering works**

Run: `npm run dev`
Navigate to `/our-business/online-delivery`. Verify:
- Products appear in all their assigned category carousels
- Category filter shows products in all assigned categories
- Sort and pagination work

- [ ] **Step 6: Commit frontend changes**

```bash
git add src/app/our-business/online-delivery/
git commit -m "feat: frontend multi-category filtering and carousel grouping"
```

---

## Chunk 6: Seed File & Tests

### Task 17: Update Seed File

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update product creation to use join table**

Replace the product creation loop (around line 2187):
```typescript
for (const product of products) {
    const { categorySlug, ...productData } = product;
    const created = await prisma.product.create({
        data: {
            ...productData,
            stockQuantity: Math.floor(Math.random() * 50) + 10,
            isAvailable: true,
        },
    });
    await prisma.productCategory.create({
        data: {
            productId: created.id,
            categoryId: categoryMap[categorySlug],
            isPrimary: true,
        },
    });
}
```

- [ ] **Step 2: Verify seed runs**

Run: `npx prisma db seed` (or `npx tsx prisma/seed.ts`)
Expected: Seeds successfully without errors

- [ ] **Step 3: Commit seed changes**

```bash
git add prisma/seed.ts
git commit -m "feat: update seed file for multi-category schema"
```

### Task 18: Update Test Mocks and Tests

**Files:**
- Modify: `src/__tests__/helpers/mocks.ts`
- Modify: `src/__tests__/api/admin/products.test.ts`
- Modify: `src/__tests__/api/products-recommendations.test.ts`

- [ ] **Step 1: Update mock product factory**

In `src/__tests__/helpers/mocks.ts`, find where mock products are created. Replace `categoryId` and `category` fields with `categories` array:

```typescript
categories: [
    {
        id: 'pc-1',
        productId: 'product-id',
        categoryId: 'cat-1',
        isPrimary: true,
        category: { id: 'cat-1', name: 'Fish (Whole)', slug: 'fish-whole' },
    },
],
```

- [ ] **Step 2: Update admin products test**

In `src/__tests__/api/admin/products.test.ts`, update:
- POST request body: send `categoryIds: ['cat-1']` and `primaryCategoryId: 'cat-1'` instead of `categoryId: 'cat-1'`
- GET response assertions: expect `categories` array instead of `categoryId`
- PUT request body: send `categoryIds` and `primaryCategoryId` instead of `categoryId`

- [ ] **Step 3: Update recommendations test**

In `src/__tests__/api/products-recommendations.test.ts`, update mock products to use `categories` array instead of `category` / `categoryId`.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 5: Commit test updates**

```bash
git add src/__tests__/
git commit -m "test: update mocks and tests for multi-category schema"
```

---

## Chunk 7: Final Verification

### Task 19: Full Build & Type Check

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev` and verify:
1. Admin: Create a product with 2 categories, verify it saves
2. Admin: Edit that product, verify categories are pre-selected with correct primary
3. Admin: Product list shows primary category name
4. Frontend: Product appears in both category carousels
5. Frontend: Filtering by either category shows the product
6. Product detail page: Breadcrumb shows primary category
7. Recommendations: Still work on product detail page

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: multi-category products — complete implementation"
```
