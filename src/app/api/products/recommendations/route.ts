import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productIds } = body as { productIds: string[] };

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ recommendations: [] });
        }

        const MAX_ITEMS = 8;
        const includeCategories = { categories: { include: { category: true }, where: { isPrimary: true } } };

        // ── 2. Get primary categories of the given products for fallback ──
        const cartProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { categories: { select: { categoryId: true }, where: { isPrimary: true } } },
        });
        const cartCategoryIds = [...new Set(cartProducts.map(p => p.categories[0]?.categoryId).filter(Boolean))];

        // ── 3. Fallback: featured products from different categories (declared early for type) ──
        const featuredFallback = await prisma.product.findMany({
            where: {
                id: { notIn: productIds },
                isAvailable: true,
                isFeatured: true,
                ...(cartCategoryIds.length > 0 ? { NOT: { categories: { some: { categoryId: { in: cartCategoryIds }, isPrimary: true } } } } : {}),
            },
            include: includeCategories,
            take: MAX_ITEMS,
            orderBy: { createdAt: 'desc' },
        });
        type ProductWithCategories = typeof featuredFallback;

        // ── 1. Find orders containing any of the given products ──
        const orderItemsWithProducts = await prisma.orderItem.findMany({
            where: { productId: { in: productIds } },
            select: { orderId: true },
            take: 200,
        });
        const orderIds = [...new Set(orderItemsWithProducts.map(oi => oi.orderId))];

        let coOccurrenceProducts: ProductWithCategories = [];

        if (orderIds.length > 0) {
            const coItems = await prisma.orderItem.findMany({
                where: {
                    orderId: { in: orderIds },
                    productId: { notIn: productIds },
                },
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
                const products = await prisma.product.findMany({
                    where: {
                        id: { in: sortedIds },
                        isAvailable: true,
                    },
                    include: includeCategories,
                });

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
                ...(cartCategoryIds.length > 0 ? { categories: { some: { categoryId: { in: cartCategoryIds }, isPrimary: true } } } : {}),
            },
            include: includeCategories,
            take: MAX_ITEMS,
            orderBy: { createdAt: 'desc' },
        });

        // ── Build results ──
        const seen = new Set<string>(productIds);
        const results: ProductWithCategories = [];

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
        captureError(err, 'Cart recommendations API error');
        return NextResponse.json({ message: 'Failed to fetch recommendations' }, { status: 500 });
    }
}
