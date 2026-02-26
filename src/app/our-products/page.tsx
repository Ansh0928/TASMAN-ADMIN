'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Product {
    id: string;
    slug: string;
    name: string;
    price: string;
    imageUrls: string[];
    category: { id: string; name: string; slug: string };
    tags: string[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
}

export default function OurProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                setCategories(data || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedCategory) params.append('category', selectedCategory);
                if (searchQuery) params.append('search', searchQuery);
                params.append('page', page.toString());
                params.append('limit', '12');

                const res = await fetch(`/api/products?${params}`);
                const data = await res.json();
                setProducts(data.products || []);
                setTotalPages(data.pagination?.pages || 1);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory, searchQuery, page]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-theme-primary">
            {/* Header */}
            <div className="bg-[#0A192F] py-12">
                <div className="container mx-auto px-4">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">Our Products</h1>
                    <p className="text-slate-300">Browse our full selection of premium seafood</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-theme-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:outline-none focus:border-theme-accent"
                        />
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar - Categories */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                            <h2 className="text-lg font-bold text-theme-text mb-4">Categories</h2>
                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    setPage(1);
                                }}
                                className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
                                    selectedCategory === ''
                                        ? 'bg-theme-accent text-white'
                                        : 'text-theme-text hover:bg-theme-primary'
                                }`}
                            >
                                All Products
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.slug);
                                        setPage(1);
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
                                        selectedCategory === category.slug
                                            ? 'bg-theme-accent text-white'
                                            : 'text-theme-text hover:bg-theme-primary'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-theme-text-muted">Loading products...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`px-4 py-2 rounded-lg transition-colors ${
                                                    page === p
                                                        ? 'bg-theme-accent text-white'
                                                        : 'bg-theme-secondary text-theme-text hover:bg-theme-primary'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-theme-text-muted">No products found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: Product }) {
    return (
        <Link
            href={`/product/${product.slug}`}
            className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden group hover:border-theme-accent transition-all"
        >
            <div className="aspect-square bg-theme-tertiary overflow-hidden relative">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🐟</div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-serif text-lg font-bold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-2 mb-2">
                    {product.name}
                </h3>
                <p className="text-theme-text-muted text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
                    <MapPin size={12} className="text-theme-accent" /> Gold Coast, QLD
                </p>
                <div className="flex items-end justify-between">
                    <span className="text-theme-accent font-bold text-lg">${parseFloat(product.price).toFixed(2)}</span>
                    <div className="w-8 h-8 rounded-full bg-theme-accent hover:bg-theme-accent/80 text-white flex items-center justify-center font-bold transition-all">
                        +
                    </div>
                </div>
            </div>
        </Link>
    );
}
