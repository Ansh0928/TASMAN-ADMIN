import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

function serializeProduct(p: any) {
    const primaryCat = p.categories?.find((pc: any) => pc.isPrimary)?.category || p.categories?.[0]?.category;
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || undefined,
        price: Number(p.price).toString(),
        imageUrls: p.imageUrls,
        category: primaryCat
            ? { id: primaryCat.id, name: primaryCat.name, slug: primaryCat.slug }
            : { id: '', name: '', slug: '' },
        unit: p.unit,
        stockQuantity: p.stockQuantity,
        isAvailable: p.isAvailable,
        isFeatured: p.isFeatured,
        isTodaysSpecial: p.isTodaysSpecial,
        tags: p.tags,
    };
}

function getPrimaryCategoryId(p: any): string {
    return p.categories?.find((pc: any) => pc.isPrimary)?.categoryId || p.categories?.[0]?.categoryId || '';
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const includeCategories = { categories: { include: { category: true } } };

        const product = await prisma.product.findUnique({
            where: { slug },
            include: includeCategories,
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const primaryCategoryId = getPrimaryCategoryId(product);
        const MAX_ITEMS = 8;

        // ── 3. Same-category fallback (declared first for type inference) ──
        const sameCategoryProducts = await prisma.product.findMany({
            where: {
                categories: { some: { categoryId: primaryCategoryId } },
                id: { not: product.id },
                isAvailable: true,
            },
            include: includeCategories,
            take: MAX_ITEMS,
            orderBy: { isFeatured: 'desc' },
        });

        type ProductWithCategories = typeof sameCategoryProducts;

        let frequentlyBoughtTogether: ProductWithCategories = [];
        let youMayAlsoLike: ProductWithCategories = [];

        // ── 1. Manual relatedProductIds ──
        let manualRelated: ProductWithCategories = [];
        if (product.relatedProductIds.length > 0) {
            manualRelated = await prisma.product.findMany({
                where: {
                    id: { in: product.relatedProductIds },
                    isAvailable: true,
                },
                include: includeCategories,
                take: MAX_ITEMS,
            });
        }

        // ── 2. Order co-occurrence ──
        let coOccurrenceProducts: ProductWithCategories = [];
        const ordersContainingProduct = await prisma.orderItem.findMany({
            where: { productId: product.id },
            select: { orderId: true },
            take: 100,
        });
        const orderIds = ordersContainingProduct.map(oi => oi.orderId);

        if (orderIds.length > 0) {
            const coItems = await prisma.orderItem.findMany({
                where: {
                    orderId: { in: orderIds },
                    productId: { not: product.id },
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
                const coProducts = await prisma.product.findMany({
                    where: {
                        id: { in: sortedIds },
                        isAvailable: true,
                    },
                    include: includeCategories,
                });

                const productMap = new Map(coProducts.map(p => [p.id, p]));
                coOccurrenceProducts = sortedIds
                    .map(id => productMap.get(id))
                    .filter((p): p is NonNullable<typeof p> => p != null);
            }
        }

        // ── 4. "You May Also Like" — featured from other categories ──
        const otherCategoryFeatured = await prisma.product.findMany({
            where: {
                NOT: { categories: { some: { categoryId: primaryCategoryId } } },
                isAvailable: true,
                isFeatured: true,
            },
            include: includeCategories,
            take: MAX_ITEMS,
            orderBy: { createdAt: 'desc' },
        });

        // ── Build "Frequently Bought Together" ──
        const fbtSeen = new Set<string>([product.id]);
        const fbtList: ProductWithCategories = [];

        for (const p of manualRelated) {
            if (fbtList.length >= MAX_ITEMS) break;
            if (!fbtSeen.has(p.id)) {
                fbtSeen.add(p.id);
                fbtList.push(p);
            }
        }
        for (const p of coOccurrenceProducts) {
            if (fbtList.length >= MAX_ITEMS) break;
            if (!fbtSeen.has(p.id)) {
                fbtSeen.add(p.id);
                fbtList.push(p);
            }
        }
        for (const p of sameCategoryProducts) {
            if (fbtList.length >= MAX_ITEMS) break;
            if (!fbtSeen.has(p.id)) {
                fbtSeen.add(p.id);
                fbtList.push(p);
            }
        }

        frequentlyBoughtTogether = fbtList;

        // ── Build "You May Also Like" ──
        const ymalSeen = new Set<string>([product.id, ...fbtList.map(p => p.id)]);
        const ymalList: ProductWithCategories = [];

        for (const p of coOccurrenceProducts) {
            if (ymalList.length >= MAX_ITEMS) break;
            if (!ymalSeen.has(p.id) && getPrimaryCategoryId(p) !== primaryCategoryId) {
                ymalSeen.add(p.id);
                ymalList.push(p);
            }
        }
        for (const p of otherCategoryFeatured) {
            if (ymalList.length >= MAX_ITEMS) break;
            if (!ymalSeen.has(p.id)) {
                ymalSeen.add(p.id);
                ymalList.push(p);
            }
        }

        youMayAlsoLike = ymalList;

        return NextResponse.json({
            frequentlyBoughtTogether: frequentlyBoughtTogether.map(serializeProduct),
            youMayAlsoLike: youMayAlsoLike.map(serializeProduct),
        });
    } catch (err) {
        captureError(err, 'Recommendations API error');
        return NextResponse.json({ message: 'Failed to fetch recommendations' }, { status: 500 });
    }
}
