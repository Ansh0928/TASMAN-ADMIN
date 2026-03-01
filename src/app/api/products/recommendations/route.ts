import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProduct(p: any) {
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || undefined,
        price: Number(p.price).toString(),
        imageUrls: p.imageUrls,
        category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : { id: '', name: '', slug: '' },
        unit: p.unit,
        stockQuantity: p.stockQuantity,
        isAvailable: p.isAvailable,
        isFeatured: p.isFeatured,
        isTodaysSpecial: p.isTodaysSpecial,
        tags: p.tags,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productIds } = body as { productIds: string[] };

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ recommendations: [] });
        }

        const MAX_ITEMS = 8;

        // ── 2. Get categories of the given products for fallback ──
        const cartProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { categoryId: true },
        });
        const cartCategoryIds = [...new Set(cartProducts.map(p => p.categoryId))];

        // ── 3. Fallback: featured products from different categories (declared early for type) ──
        const featuredFallback = await prisma.product.findMany({
            where: {
                id: { notIn: productIds },
                isAvailable: true,
                isFeatured: true,
                ...(cartCategoryIds.length > 0 ? { categoryId: { notIn: cartCategoryIds } } : {}),
            },
            include: { category: true },
            take: MAX_ITEMS,
            orderBy: { createdAt: 'desc' },
        });
        type ProductWithCategory = typeof featuredFallback;

        // ── 1. Find orders containing any of the given products ──
        const orderItemsWithProducts = await prisma.orderItem.findMany({
            where: { productId: { in: productIds } },
            select: { orderId: true },
            take: 200,
        });
        const orderIds = [...new Set(orderItemsWithProducts.map(oi => oi.orderId))];

        let coOccurrenceProducts: ProductWithCategory = [];

        if (orderIds.length > 0) {
            // Find other products in those same orders
            const coItems = await prisma.orderItem.findMany({
                where: {
                    orderId: { in: orderIds },
                    productId: { notIn: productIds },
                },
                select: { productId: true },
            });

            // Count co-occurrence frequency
            const freq: Record<string, number> = {};
            for (const item of coItems) {
                freq[item.productId] = (freq[item.productId] || 0) + 1;
            }

            // Sort by frequency desc
            const sortedIds = Object.entries(freq)
                .sort((a, b) => b[1] - a[1])
                .map(([id]) => id)
                .slice(0, MAX_ITEMS * 2);

            if (sortedIds.length > 0) {
                const products = await prisma.product.findMany({
                    where: {
                        id: { in: sortedIds },
                        isAvailable: true,
                    },
                    include: { category: true },
                });

                // Maintain frequency order
                const productMap = new Map(products.map(p => [p.id, p]));
                coOccurrenceProducts = sortedIds
                    .map(id => productMap.get(id))
                    .filter((p): p is NonNullable<typeof p> => p != null);
            }
        }

        // ── 4. Additional fallback: featured from same categories (if not enough) ──
        const featuredSameCategory = await prisma.product.findMany({
            where: {
                id: { notIn: productIds },
                isAvailable: true,
                isFeatured: true,
                ...(cartCategoryIds.length > 0 ? { categoryId: { in: cartCategoryIds } } : {}),
            },
            include: { category: true },
            take: MAX_ITEMS,
            orderBy: { createdAt: 'desc' },
        });

        // ── Build results ──
        const seen = new Set<string>(productIds);
        const results: ProductWithCategory = [];

        for (const p of coOccurrenceProducts) {
            if (results.length >= MAX_ITEMS) break;
            if (!seen.has(p.id)) {
                seen.add(p.id);
                results.push(p);
            }
        }
        for (const p of featuredFallback) {
            if (results.length >= MAX_ITEMS) break;
            if (!seen.has(p.id)) {
                seen.add(p.id);
                results.push(p);
            }
        }
        for (const p of featuredSameCategory) {
            if (results.length >= MAX_ITEMS) break;
            if (!seen.has(p.id)) {
                seen.add(p.id);
                results.push(p);
            }
        }

        return NextResponse.json({
            recommendations: results.map(serializeProduct),
        });
    } catch (err) {
        console.error('Cart recommendations API error:', err);
        return NextResponse.json({ message: 'Failed to fetch recommendations' }, { status: 500 });
    }
}
