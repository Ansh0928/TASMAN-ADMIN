'use client';

import { useEffect, useState } from 'react';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';

interface StoredProduct {
    slug: string;
    name: string;
    price: string;
    imageUrls: string[];
    unit: string;
    category: { id: string; name: string; slug: string };
    id: string;
    stockQuantity: number;
}

interface RecentlyViewedProps {
    excludeSlug?: string;
}

export default function RecentlyViewed({ excludeSlug }: RecentlyViewedProps) {
    const [products, setProducts] = useState<ProductCardData[]>([]);

    useEffect(() => {
        try {
            const stored: StoredProduct[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const filtered = excludeSlug
                ? stored.filter(p => p.slug !== excludeSlug)
                : stored;
            setProducts(filtered.slice(0, 8));
        } catch {
            // localStorage unavailable
        }
    }, [excludeSlug]);

    if (products.length < 2) return null;

    return (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl">
            <ProductCarousel title="Recently Viewed">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </ProductCarousel>
        </section>
    );
}
