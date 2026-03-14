import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cached featured products (Best Buys) for home page
export const getCachedFeaturedProducts = unstable_cache(
  async (limit: number = 10) => {
    const products = await prisma.product.findMany({
      where: { isAvailable: true, isFeatured: true },
      include: {
        categories: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    // Serialize Decimal + extract primary category for client components
    return products.map(p => {
      const primaryCat = p.categories.find(c => c.isPrimary)?.category ?? p.categories[0]?.category;
      const { categories: _cats, ...rest } = p;
      return {
        ...rest,
        price: p.price.toString(),
        category: primaryCat ? { id: primaryCat.id, name: primaryCat.name, slug: primaryCat.slug } : { id: '', name: '', slug: '' },
      };
    });
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
