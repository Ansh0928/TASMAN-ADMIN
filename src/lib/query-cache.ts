import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cached featured products (Best Buys) for home page
export const getCachedFeaturedProducts = unstable_cache(
  async (limit: number = 10) => {
    const products = await prisma.product.findMany({
      where: { isAvailable: true, isFeatured: true },
      select: {
        id: true, name: true, slug: true, description: true,
        price: true, imageUrls: true, unit: true, stockQuantity: true,
        isFeatured: true, isTodaysSpecial: true, tags: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    // Serialize Decimal to string for client components
    return products.map(p => ({ ...p, price: p.price.toString() }));
  },
  ['featured-products'],
  { revalidate: 60, tags: ['products'] }
);

// Cached categories
export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      select: { id: true, name: true, slug: true, imageUrl: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    });
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);
