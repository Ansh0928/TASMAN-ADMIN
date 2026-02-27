'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';
import CategoryCircles, { type CategoryData } from '@/components/CategoryCircles';

export default function OnlineDeliveryProducts() {
    const searchParams = useSearchParams();
    const [bestBuys, setBestBuys] = useState<ProductCardData[]>([]);
    const [freshPickups, setFreshPickups] = useState<ProductCardData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductCardData[]>>({});
    const [loading, setLoading] = useState(true);
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const targetCategory = searchParams.get('category');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [bestRes, freshRes, catRes, allRes] = await Promise.all([
                    fetch('/api/products?featured=true&limit=10'),
                    fetch('/api/products?todaysSpecial=true&limit=10'),
                    fetch('/api/categories'),
                    fetch('/api/products?limit=100'),
                ]);

                const bestData = await bestRes.json();
                const freshData = await freshRes.json();
                const catData = await catRes.json();
                const allData = await allRes.json();

                setBestBuys(bestData.products || []);
                setFreshPickups(freshData.products || []);
                setCategories(catData || []);

                // Group products by category slug
                const grouped: Record<string, ProductCardData[]> = {};
                for (const product of (allData.products || []) as ProductCardData[]) {
                    const slug = product.category?.slug;
                    if (slug) {
                        if (!grouped[slug]) grouped[slug] = [];
                        grouped[slug].push(product);
                    }
                }
                setCategoryProducts(grouped);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // Auto-scroll to the target category when data loads (from map link)
    useEffect(() => {
        if (!loading && targetCategory && categoryRefs.current[targetCategory]) {
            setTimeout(() => {
                categoryRefs.current[targetCategory]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [loading, targetCategory]);

    const categoryCarousels = categories
        .filter((cat) => categoryProducts[cat.slug] && categoryProducts[cat.slug].length > 0)
        .map((cat) => ({
            category: cat,
            products: categoryProducts[cat.slug],
        }));

    if (loading) {
        return (
            <div className="container mx-auto max-w-7xl py-12">
                <div className="animate-pulse space-y-10">
                    <div className="h-8 bg-theme-secondary rounded w-48"></div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-shrink-0 w-[220px]">
                                <div className="aspect-square bg-theme-secondary rounded-xl"></div>
                                <div className="mt-3 h-4 bg-theme-secondary rounded w-3/4"></div>
                                <div className="mt-2 h-3 bg-theme-secondary rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-24 h-24 rounded-full bg-theme-secondary"></div>
                                <div className="h-3 bg-theme-secondary rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl pb-16">
            {/* Best Buys */}
            {bestBuys.length > 0 && (
                <ProductCarousel
                    title="Best Buys"
                    subtitle="Our top picks for you"
                    viewAllHref="/our-products"
                >
                    {bestBuys.map((product) => (
                        <ProductCard key={product.id} product={product} badge="Best Buy" />
                    ))}
                </ProductCarousel>
            )}

            {/* Category Circles */}
            {categories.length > 0 && (
                <CategoryCircles categories={categories} />
            )}

            {/* Per-Category Carousels */}
            {categoryCarousels.map(({ category, products }) => (
                <div
                    key={category.id}
                    ref={(el) => { categoryRefs.current[category.slug] = el; }}
                    className={targetCategory === category.slug ? 'scroll-mt-24' : ''}
                >
                    <ProductCarousel
                        title={category.name}
                        subtitle={`Fresh ${category.name.toLowerCase()} selection`}
                        viewAllHref={`/our-products?category=${category.slug}`}
                    >
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </ProductCarousel>
                </div>
            ))}

            {/* Fresh Pickups */}
            {freshPickups.length > 0 && (
                <ProductCarousel
                    title="Fresh Pickups"
                    subtitle="Today's freshest catches"
                    viewAllHref="/deals"
                >
                    {freshPickups.map((product) => (
                        <ProductCard key={product.id} product={product} badge="Fresh Pick" />
                    ))}
                </ProductCarousel>
            )}
        </div>
    );
}
