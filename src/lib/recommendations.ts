import { prisma } from './prisma';

// Infer the product shape from Prisma so it stays in sync with the schema.
type ProductWithCategory = Awaited<
  ReturnType<typeof prisma.product.findMany<{ include: { category: true } }>>
>[number];

export async function getProductRecommendations(
  productId: string,
  categoryId: string,
  relatedProductIds: string[],
): Promise<{
  relatedProducts: ProductWithCategory[];
  suggestedProducts: ProductWithCategory[];
}> {
  const MAX_ITEMS = 8;

  // Run all independent queries in parallel.
  const [
    sameCategoryProducts,
    manualRelated,
    ordersContainingProduct,
    otherCategoryFeatured,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId, id: { not: productId }, isAvailable: true },
      include: { category: true },
      take: MAX_ITEMS,
      orderBy: { isFeatured: 'desc' },
    }),
    relatedProductIds.length > 0
      ? prisma.product.findMany({
          where: { id: { in: relatedProductIds }, isAvailable: true },
          include: { category: true },
          take: MAX_ITEMS,
        })
      : Promise.resolve([] as ProductWithCategory[]),
    prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 100,
    }),
    prisma.product.findMany({
      where: { categoryId: { not: categoryId }, isAvailable: true, isFeatured: true },
      include: { category: true },
      take: MAX_ITEMS,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

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
        include: { category: true },
      });
      const productMap = new Map(coProducts.map(p => [p.id, p]));
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
    if (!ymalSeen.has(p.id) && p.categoryId !== categoryId) {
      ymalSeen.add(p.id); suggestedProducts.push(p);
    }
  }
  for (const p of otherCategoryFeatured) {
    if (suggestedProducts.length >= MAX_ITEMS) break;
    if (!ymalSeen.has(p.id)) { ymalSeen.add(p.id); suggestedProducts.push(p); }
  }

  return { relatedProducts, suggestedProducts };
}
