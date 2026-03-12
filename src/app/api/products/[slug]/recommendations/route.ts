import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

function serializeProduct(p: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: { toString(): string } | number;
    imageUrls: string[];
    category: { id: string; name: string; slug: string };
    unit: string;
    stockQuantity: number;
    isAvailable: boolean;
    isFeatured: boolean;
    isTodaysSpecial: boolean;
    tags: string[];
}) {
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || undefined,
        price: Number(p.price).toString(),
        imageUrls: p.imageUrls,
        category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
        unit: p.unit,
        stockQuantity: p.stockQuantity,
        isAvailable: p.isAvailable,
        isFeatured: p.isFeatured,
        isTodaysSpecial: p.isTodaysSpecial,
        tags: p.tags,
    };
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const product = await prisma.product.findUnique({
            where: { slug },
            include: { category: true },
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const MAX_ITEMS = 8;

        // ── 3. Same-category fallback (declared first for type inference) ──
        const sameCategoryProducts = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id },
                isAvailable: true,
            },
            include: { category: true },
            take: MAX_ITEMS,
            orderBy: { isFeatured: 'desc' },
        });

        type ProductWithCategory = typeof sameCategoryProducts;

        let frequentlyBoughtTogether: ProductWithCategory = [];
        let youMayAlsoLike: ProductWithCategory = [];

        // ── 1. Manual relatedProductIds ──
        let manualRelated: ProductWithCategory = [];
        if (product.relatedProductIds.length > 0) {
            manualRelated = await prisma.product.findMany({
                where: {
                    id: { in: product.relatedProductIds },
                    isAvailable: true,
                },
                include: { category: true },
                take: MAX_ITEMS,
            });
        }

        // ── 2. Order co-occurrence ──
        let coOccurrenceProducts: ProductWithCategory = [];
        const ordersContainingProduct = await prisma.orderItem.findMany({
            where: { productId: product.id },
            select: { orderId: true },
            take: 100,
        });
        const orderIds = ordersContainingProduct.map(oi => oi.orderId);

        if (orderIds.length > 0) {
            // Find other products in those same orders
            const coItems = await prisma.orderItem.findMany({
                where: {
                    orderId: { in: orderIds },
                    productId: { not: product.id },
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
                .slice(0, MAX_ITEMS * 2); // fetch more than needed, we'll filter

            if (sortedIds.length > 0) {
                const coProducts = await prisma.product.findMany({
                    where: {
                        id: { in: sortedIds },
                        isAvailable: true,
                    },
                    include: { category: true },
                });

                // Maintain sort order by frequency
                const productMap = new Map(coProducts.map(p => [p.id, p]));
                coOccurrenceProducts = sortedIds
                    .map(id => productMap.get(id))
                    .filter((p): p is NonNullable<typeof p> => p != null);
            }
        }

        // ── 4. "You May Also Like" — featured from other categories ──
        const otherCategoryFeatured = await prisma.product.findMany({
            where: {
                categoryId: { not: product.categoryId },
                isAvailable: true,
                isFeatured: true,
            },
            include: { category: true },
            take: MAX_ITEMS,
            orderBy: { createdAt: 'desc' },
        });

        // ── Build "Frequently Bought Together" ──
        // Priority: manual > co-occurrence > same-category
        const fbtSeen = new Set<string>([product.id]);
        const fbtList: ProductWithCategory = [];

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
        // Priority: co-occurrence from other categories > featured from other categories
        const ymalSeen = new Set<string>([product.id, ...fbtList.map(p => p.id)]);
        const ymalList: ProductWithCategory = [];

        // Co-occurrence products from OTHER categories
        for (const p of coOccurrenceProducts) {
            if (ymalList.length >= MAX_ITEMS) break;
            if (!ymalSeen.has(p.id) && p.categoryId !== product.categoryId) {
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
