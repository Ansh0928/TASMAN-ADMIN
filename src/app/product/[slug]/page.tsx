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
        title: `${product.name} | Tasman Star Seafoods`,
        description: product.description || `Buy fresh ${product.name} from Tasman Star Seafoods. Premium quality seafood from the Gold Coast.`,
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

    // Fetch "Frequently Ordered Together" — same category, exclude current
    const relatedProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            isAvailable: true,
        },
        include: { category: true },
        take: 6,
        orderBy: { isFeatured: 'desc' },
    });

    // Fetch "You May Also Like" — featured products from other categories
    const suggestedProducts = await prisma.product.findMany({
        where: {
            categoryId: { not: product.categoryId },
            isAvailable: true,
            isFeatured: true,
        },
        include: { category: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
    });

    const serialized = serializeProduct(product);

    return (
        <>
            <ProductDetailClient
                product={serialized}
                relatedProducts={relatedProducts.map(serializeProduct)}
                suggestedProducts={suggestedProducts.map(serializeProduct)}
            />

            {/* JSON-LD Product Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description || `Fresh ${product.name} from Tasman Star Seafoods`,
                        image: product.imageUrls[0] || undefined,
                        offers: {
                            '@type': 'Offer',
                            price: Number(product.price).toFixed(2),
                            priceCurrency: 'AUD',
                            availability: product.isAvailable && product.stockQuantity > 0
                                ? 'https://schema.org/InStock'
                                : 'https://schema.org/OutOfStock',
                            seller: {
                                '@type': 'Organization',
                                name: 'Tasman Star Seafoods',
                            },
                        },
                        category: product.category?.name,
                    }),
                }}
            />
        </>
    );
}
