import { prisma } from './prisma';

// Shape returned to callers — a product with a singular `category` field.
interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: any;
  imageUrls: string[];
  category: { id: string; name: string; slug: string };
  unit: string;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isTodaysSpecial: boolean;
  countryOfOrigin: string;
  tags: string[];
  relatedProductIds: string[];
  [key: string]: any;
}

function mapPrimaryCategory(p: any): ProductWithCategory {
  const primary = p.categories?.find((c: any) => c.isPrimary) ?? p.categories?.[0];
  return {
    ...p,
    category: primary?.category ?? { id: '', name: '', slug: '' },
  };
}

function getPrimaryCategoryId(p: any): string {
  const primary = p.categories?.find((c: any) => c.isPrimary) ?? p.categories?.[0];
  return primary?.categoryId ?? '';
}

export async function getProductRecommendations(
  productId: string,
  categoryId: string,
  relatedProductIds: string[],
): Promise<{
  relatedProducts: ProductWithCategory[];
  suggestedProducts: ProductWithCategory[];
}> {
  const MAX_ITEMS = 8;

  const includeCategories = { categories: { include: { category: true }, where: { isPrimary: true } } };

  // Run all independent queries in parallel.
  const [
    sameCategoryProductsRaw,
    manualRelatedRaw,
    ordersContainingProduct,
    otherCategoryFeaturedRaw,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { categories: { some: { categoryId } }, id: { not: productId }, isAvailable: true },
      include: includeCategories,
      take: MAX_ITEMS,
      orderBy: { isFeatured: 'desc' },
    }),
    relatedProductIds.length > 0
      ? prisma.product.findMany({
          where: { id: { in: relatedProductIds }, isAvailable: true },
          include: includeCategories,
          take: MAX_ITEMS,
        })
      : Promise.resolve([]),
    prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 100,
    }),
    prisma.product.findMany({
      where: { NOT: { categories: { some: { categoryId } } }, isAvailable: true, isFeatured: true },
      include: includeCategories,
      take: MAX_ITEMS,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const sameCategoryProducts = sameCategoryProductsRaw.map(mapPrimaryCategory);
  const manualRelated = manualRelatedRaw.map(mapPrimaryCategory);
  const otherCategoryFeatured = otherCategoryFeaturedRaw.map(mapPrimaryCategory);

  // Co-occurrence depends on ordersContainingProduct — must run after.
  let coOccurrenceProducts: ProductWithCategory[] = [];
  const orderIds = ordersContainingProduct.map(oi => oi.orderId);

  if (orderIds.length > 0) {
    const coItems = await prisma.orderItem.findMany({
      where: { orderId: { in: orderIds }, productId: { not: productId } },
      select: { productId: true },
    });

    const freq: Record<string, number> = {};
    for (const item of coItems) {
      freq[item.productId] = (freq[item.productId] || 0) + 1;
    }

    const sortedIds = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, MAX_ITEMS * 2);

    if (sortedIds.length > 0) {
      const coProducts = await prisma.product.findMany({
        where: { id: { in: sortedIds }, isAvailable: true },
        include: includeCategories,
      });
      const productMap = new Map(coProducts.map(p => [p.id, mapPrimaryCategory(p)]));
      coOccurrenceProducts = sortedIds
        .map(id => productMap.get(id))
        .filter((p): p is NonNullable<typeof p> => p != null);
    }
  }

  // Build "Frequently Bought Together".
  const fbtSeen = new Set<string>([productId]);
  const relatedProducts: ProductWithCategory[] = [];
  for (const p of manualRelated) {
    if (relatedProducts.length >= MAX_ITEMS) break;
    if (!fbtSeen.has(p.id)) { fbtSeen.add(p.id); relatedProducts.push(p); }
  }
  for (const p of coOccurrenceProducts) {
    if (relatedProducts.length >= MAX_ITEMS) break;
    if (!fbtSeen.has(p.id)) { fbtSeen.add(p.id); relatedProducts.push(p); }
  }
  for (const p of sameCategoryProducts) {
    if (relatedProducts.length >= MAX_ITEMS) break;
    if (!fbtSeen.has(p.id)) { fbtSeen.add(p.id); relatedProducts.push(p); }
  }

  // Build "You May Also Like".
  const ymalSeen = new Set<string>([productId, ...relatedProducts.map(p => p.id)]);
  const suggestedProducts: ProductWithCategory[] = [];
  for (const p of coOccurrenceProducts) {
    if (suggestedProducts.length >= MAX_ITEMS) break;
    if (!ymalSeen.has(p.id) && getPrimaryCategoryId(p) !== categoryId) {
      ymalSeen.add(p.id); suggestedProducts.push(p);
    }
  }
  for (const p of otherCategoryFeatured) {
    if (suggestedProducts.length >= MAX_ITEMS) break;
    if (!ymalSeen.has(p.id)) { ymalSeen.add(p.id); suggestedProducts.push(p); }
  }

  return { relatedProducts, suggestedProducts };
}
