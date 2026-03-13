import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

interface Props {
    params: Promise<{ slug: string }>;
}

function serializeProduct(p: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: { toString(): string } | number;
    imageUrls: string[];
    category: { id: string; name: string; slug: string } | null;
    unit: string;
    stockQuantity: number;
    isAvailable: boolean;
    isFeatured: boolean;
    isTodaysSpecial: boolean;
    countryOfOrigin: string;
    tags: string[];
}) {
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || undefined,
        price: Number(p.price).toString(),
        imageUrls: p.imageUrls,
        category: p.category
            ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
            : { id: '', name: '', slug: '' },
        unit: p.unit,
        stockQuantity: p.stockQuantity,
        isAvailable: p.isAvailable,
        isFeatured: p.isFeatured,
        isTodaysSpecial: p.isTodaysSpecial,
        countryOfOrigin: p.countryOfOrigin,
        tags: p.tags,
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
    });

    if (!product) {
        return { title: 'Product Not Found | Tasman Star Seafoods' };
    }

    return {
        title: product.name,
        description: product.description || `Buy fresh ${product.name} from Tasman Star Seafoods. Premium quality seafood from the Gold Coast.`,
        alternates: { canonical: `/product/${slug}` },
        openGraph: {
            title: `${product.name} | Tasman Star Seafoods`,
            description: product.description || `Buy fresh ${product.name} from Tasman Star Seafoods.`,
            type: 'website',
            images: product.imageUrls[0] ? [{ url: product.imageUrls[0] }] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
    });

    if (!product) {
        notFound();
    }

    const MAX_ITEMS = 8;

    // ── 3. Same-category fallback (declared first for type reference) ──
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

    // ── 1. Manual related products ──
    let manualRelated: typeof sameCategoryProducts = [];
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
    let coOccurrenceProducts: typeof sameCategoryProducts = [];
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
                where: { id: { in: sortedIds }, isAvailable: true },
                include: { category: true },
            });
            const productMap = new Map(coProducts.map(p => [p.id, p]));
            coOccurrenceProducts = sortedIds
                .map(id => productMap.get(id))
                .filter((p): p is NonNullable<typeof p> => p != null);
        }
    }

    // ── 4. Featured from other categories ──
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
    const fbtSeen = new Set<string>([product.id]);
    const relatedProducts: typeof sameCategoryProducts = [];
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

    // ── Build "You May Also Like" ──
    const ymalSeen = new Set<string>([product.id, ...relatedProducts.map(p => p.id)]);
    const suggestedProducts: typeof sameCategoryProducts = [];
    for (const p of coOccurrenceProducts) {
        if (suggestedProducts.length >= MAX_ITEMS) break;
        if (!ymalSeen.has(p.id) && p.categoryId !== product.categoryId) {
            ymalSeen.add(p.id); suggestedProducts.push(p);
        }
    }
    for (const p of otherCategoryFeatured) {
        if (suggestedProducts.length >= MAX_ITEMS) break;
        if (!ymalSeen.has(p.id)) { ymalSeen.add(p.id); suggestedProducts.push(p); }
    }

    const serialized = serializeProduct(product);

    return (
        <>
            <ProductDetailClient
                product={serialized}
                relatedProducts={relatedProducts.map(serializeProduct)}
                suggestedProducts={suggestedProducts.map(serializeProduct)}
            />

            {/* JSON-LD Product Structured Data (M-3: escape </script> breakout) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description || `Fresh ${product.name} from Tasman Star Seafoods`,
                        image: product.imageUrls.length > 0 ? product.imageUrls : undefined,
                        sku: product.id,
                        category: product.category?.name,
                        brand: {
                            '@type': 'Brand',
                            name: 'Tasman Star Seafoods',
                        },
                        countryOfOrigin: {
                            '@type': 'Country',
                            name: product.countryOfOrigin,
                        },
                        offers: {
                            '@type': 'Offer',
                            url: `https://tasman-admin.vercel.app/product/${product.slug}`,
                            price: Number(product.price).toFixed(2),
                            priceCurrency: 'AUD',
                            availability: product.isAvailable && product.stockQuantity > 0
                                ? 'https://schema.org/InStock'
                                : 'https://schema.org/OutOfStock',
                            seller: {
                                '@type': 'Organization',
                                name: 'Tasman Star Seafoods',
                            },
                            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        },
                    }).replace(/</g, '\\u003c'),
                }}
            />

            {/* JSON-LD Breadcrumb Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tasman-admin.vercel.app' },
                            { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://tasman-admin.vercel.app/our-business/online-delivery' },
                            ...(product.category ? [{ '@type': 'ListItem', position: 3, name: product.category.name, item: `https://tasman-admin.vercel.app/our-products?category=${product.category.slug}` }] : []),
                            { '@type': 'ListItem', position: product.category ? 4 : 3, name: product.name },
                        ],
                    }).replace(/</g, '\\u003c'),
                }}
            />
        </>
    );
}
