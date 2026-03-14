import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCached } from '@/lib/redis-cache';
import { NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProduct(p: any) {
    const primaryCat = p.categories?.find((c: any) => c.isPrimary)?.category
        ?? p.categories?.[0]?.category;
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
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

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const MAX_ITEMS = 8;

        if (userId) {
            // Logged-in: personalise by order history
            const products = await getCached(`personalized:${userId}`, 300, async () => {
                const orderItems = await prisma.orderItem.findMany({
                    where: {
                        order: { userId },
                    },
                    select: { productId: true },
                });

                const freq: Record<string, number> = {};
                for (const item of orderItems) {
                    freq[item.productId] = (freq[item.productId] || 0) + 1;
                }

                const sortedIds = Object.entries(freq)
                    .sort((a, b) => b[1] - a[1])
                    .map(([id]) => id)
                    .slice(0, MAX_ITEMS * 2);

                if (sortedIds.length === 0) return [];

                const results = await prisma.product.findMany({
                    where: {
                        id: { in: sortedIds },
                        isAvailable: true,
                        isFeatured: false,
                    },
                    include: { categories: { include: { category: true } } },
                    take: MAX_ITEMS,
                });

                const productMap = new Map(results.map(p => [p.id, p]));
                return sortedIds
                    .map(id => productMap.get(id))
                    .filter((p): p is NonNullable<typeof p> => p != null)
                    .slice(0, MAX_ITEMS);
            });

            return NextResponse.json({ products: products.map(serializeProduct), personalised: true });
        }

        // Guest: top products by order frequency in last 30 days
        const products = await getCached('popular:weekly', 300, async () => {
            const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const orderItems = await prisma.orderItem.findMany({
                where: {
                    order: { createdAt: { gte: since } },
                },
                select: { productId: true },
            });

            const freq: Record<string, number> = {};
            for (const item of orderItems) {
                freq[item.productId] = (freq[item.productId] || 0) + 1;
            }

            const sortedIds = Object.entries(freq)
                .sort((a, b) => b[1] - a[1])
                .map(([id]) => id)
                .slice(0, MAX_ITEMS * 2);

            if (sortedIds.length === 0) {
                // Fallback: featured products
                return prisma.product.findMany({
                    where: { isAvailable: true, isFeatured: true },
                    include: { categories: { include: { category: true } } },
                    take: MAX_ITEMS,
                    orderBy: { createdAt: 'desc' },
                });
            }

            const results = await prisma.product.findMany({
                where: {
                    id: { in: sortedIds },
                    isAvailable: true,
                },
                include: { categories: { include: { category: true } } },
                take: MAX_ITEMS,
            });

            const productMap = new Map(results.map(p => [p.id, p]));
            return sortedIds
                .map(id => productMap.get(id))
                .filter((p): p is NonNullable<typeof p> => p != null)
                .slice(0, MAX_ITEMS);
        });

        return NextResponse.json({ products: products.map(serializeProduct), personalised: false });
    } catch (err) {
        captureError(err, 'Personalized products API error');
        return NextResponse.json({ message: 'Failed to fetch personalized products' }, { status: 500 });
    }
}
