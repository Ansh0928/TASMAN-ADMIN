'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';
import CategoryCircles, { type CategoryData } from '@/components/CategoryCircles';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name-az' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A–Z' },
    { value: 'newest', label: 'Newest' },
];

export default function OnlineDeliveryProducts() {
    const searchParams = useSearchParams();
    const [bestBuys, setBestBuys] = useState<ProductCardData[]>([]);
    const [freshPickups, setFreshPickups] = useState<ProductCardData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [categoryProducts, setCategoryProducts] = useState<Record<string, ProductCardData[]>>({});
    const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const filterBarRef = useRef<HTMLDivElement>(null);

    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('featured');

    const targetCategory = searchParams.get('category');

    useEffect(() => {
        if (targetCategory) {
            setActiveCategory(targetCategory);
        }
    }, [targetCategory]);

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

                const products = (allData.products || []) as ProductCardData[];

                setBestBuys(bestData.products || []);
                setFreshPickups(freshData.products || []);
                setCategories(catData || []);
                setAllProducts(products);

                const grouped: Record<string, ProductCardData[]> = {};
                for (const product of products) {
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

    const filteredAndSorted = useMemo(() => {
        let filtered = activeCategory === 'all'
            ? allProducts
            : allProducts.filter(p => p.category?.slug === activeCategory);

        switch (sortBy) {
            case 'price-low':
                return [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            case 'price-high':
                return [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            case 'name-az':
                return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
            case 'newest':
                return filtered;
            default:
                return filtered;
        }
    }, [allProducts, activeCategory, sortBy]);

    const isFiltered = activeCategory !== 'all' || sortBy !== 'featured';

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
            {/* Filter & Sort Bar */}
            <div
                ref={filterBarRef}
                className="sticky top-0 z-20 bg-theme-primary/95 backdrop-blur-sm border-b border-theme-border py-4 px-4 md:px-0 -mx-4 md:mx-0 transition-all"
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Category Pills */}
                    <div className="flex-1 overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 pb-1">
                            <button
                                onClick={() => { setActiveCategory('all'); setSortBy('featured'); }}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    activeCategory === 'all'
                                        ? 'bg-theme-accent text-white shadow-sm'
                                        : 'bg-theme-secondary text-theme-text border border-theme-border hover:border-theme-accent/50'
                                }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.slug)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeCategory === cat.slug
                                            ? 'bg-theme-accent text-white shadow-sm'
                                            : 'bg-theme-secondary text-theme-text border border-theme-border hover:border-theme-accent/50'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex-shrink-0">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none bg-theme-secondary text-theme-text border border-theme-border rounded-lg pl-3 pr-9 py-2 text-sm font-medium cursor-pointer hover:border-theme-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted pointer-events-none" />
                    </div>
                </div>

                {/* Result count */}
                {isFiltered && (
                    <p className="text-theme-text-muted text-xs mt-2">
                        {filteredAndSorted.length} product{filteredAndSorted.length !== 1 ? 's' : ''}
                        {activeCategory !== 'all' && categories.find(c => c.slug === activeCategory)
                            ? ` in ${categories.find(c => c.slug === activeCategory)!.name}`
                            : ''}
                    </p>
                )}
            </div>

            {/* Filtered Grid View */}
            {isFiltered ? (
                <div className="px-4 md:px-0 pt-6">
                    {filteredAndSorted.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {filteredAndSorted.map((product) => (
                                <ProductCard key={product.id} product={product} gridMode />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-theme-text-muted text-lg">No products found</p>
                            <button
                                onClick={() => { setActiveCategory('all'); setSortBy('featured'); }}
                                className="mt-3 text-theme-accent hover:underline text-sm font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* Default Carousel View */
                <>
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
                </>
            )}
        </div>
    );
}
