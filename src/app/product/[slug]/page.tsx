import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getProductRecommendations } from '@/lib/recommendations';
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
        include: { categories: { include: { category: true } } },
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
        include: { categories: { include: { category: true } } },
    });

    if (!product) {
        notFound();
    }

    const primaryCat = product.categories.find(pc => pc.isPrimary)?.category || product.categories[0]?.category;
    const primaryCategoryId = product.categories.find(pc => pc.isPrimary)?.categoryId || product.categories[0]?.categoryId || '';

    const { relatedProducts, suggestedProducts } = await getProductRecommendations(
        product.id,
        primaryCategoryId,
        product.relatedProductIds,
    );

    const productWithCategory = { ...product, category: primaryCat || null };
    const serialized = serializeProduct(productWithCategory);

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
                        category: primaryCat?.name,
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
                            ...(primaryCat ? [{ '@type': 'ListItem', position: 3, name: primaryCat.name, item: `https://tasman-admin.vercel.app/our-products?category=${primaryCat.slug}` }] : []),
                            { '@type': 'ListItem', position: primaryCat ? 4 : 3, name: product.name },
                        ],
                    }).replace(/</g, '\\u003c'),
                }}
            />
        </>
    );
}
