'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Star, Clock } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: string;
    imageUrls: string[];
    category: { id: string; name: string };
    stockQuantity: number;
    unit: string;
    isAvailable: boolean;
    isFeatured: boolean;
    isTodaysSpecial: boolean;
    createdAt: string;
}

export default function AdminProducts() {
    return (
        <Suspense fallback={<p className="text-theme-text-muted text-center py-8">Loading products...</p>}>
            <AdminProductsInner />
        </Suspense>
    );
}

function AdminProductsInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [totalPages, setTotalPages] = useState(1);

    const page = Number(searchParams.get('page')) || 1;

    const setPage = useCallback((updater: number | ((prev: number) => number)) => {
        const newPage = typeof updater === 'function' ? updater(page) : updater;
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.replace(`/admin/products?${params.toString()}`);
    }, [page, searchParams, router]);

    const fetchProducts = async (currentPage: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: currentPage.toString(), limit: '15' });
            if (search) params.set('search', search);
            const res = await fetch(`/api/admin/products?${params}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(page); }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProducts(1);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const toggleField = async (id: string, field: 'isAvailable' | 'isFeatured' | 'isTodaysSpecial', current: boolean) => {
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: !current }),
            });
            if (res.ok) {
                setProducts(products.map(p => p.id === id ? { ...p, [field]: !current } : p));
            }
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-theme-text">Products</h2>
                <Link
                    href="/admin/products/new"
                    className="bg-theme-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-theme-accent/90 transition-colors"
                >
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                        />
                    </div>
                    <button type="submit" className="bg-theme-accent text-white px-4 py-2 rounded-lg hover:bg-theme-accent/90">
                        Search
                    </button>
                </div>
            </form>

            {loading ? (
                <p className="text-theme-text-muted text-center py-8">Loading products...</p>
            ) : products.length === 0 ? (
                <p className="text-theme-text-muted text-center py-8">No products found.</p>
            ) : (
                <>
                    {/* Products Table */}
                    <div className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden relative">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-theme-border">
                                        <th className="text-left p-4 text-theme-text-muted text-sm font-medium">Product</th>
                                        <th className="text-left p-4 text-theme-text-muted text-sm font-medium hidden sm:table-cell">Category</th>
                                        <th className="text-left p-4 text-theme-text-muted text-sm font-medium">Price</th>
                                        <th className="text-left p-4 text-theme-text-muted text-sm font-medium hidden sm:table-cell">Stock</th>
                                        <th className="text-center p-4 text-theme-text-muted text-sm font-medium">Status</th>
                                        <th className="text-right p-4 text-theme-text-muted text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-theme-border/50 hover:bg-theme-primary/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {product.imageUrls[0] && (
                                                        <img src={product.imageUrls[0]} alt="" className="w-10 h-10 rounded object-cover" />
                                                    )}
                                                    <span className="text-theme-text font-medium">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-theme-text-muted hidden sm:table-cell">{product.category.name}</td>
                                            <td className="p-4 text-theme-text">${parseFloat(product.price).toFixed(2)}</td>
                                            <td className="p-4 hidden sm:table-cell">
                                                <span className={product.stockQuantity < 5 ? 'text-red-400' : 'text-theme-text'}>
                                                    {product.stockQuantity}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => toggleField(product.id, 'isAvailable', product.isAvailable)}
                                                        className={`text-xs px-2 py-1 rounded ${product.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                                        title={product.isAvailable ? 'Available' : 'Unavailable'}
                                                    >
                                                        {product.isAvailable ? 'Active' : 'Hidden'}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleField(product.id, 'isFeatured', product.isFeatured)}
                                                        className={`p-1 rounded ${product.isFeatured ? 'text-yellow-400' : 'text-theme-text-muted/30'}`}
                                                        title="Featured (Best Buy)"
                                                    >
                                                        <Star size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleField(product.id, 'isTodaysSpecial', product.isTodaysSpecial)}
                                                        className={`p-1 rounded ${product.isTodaysSpecial ? 'text-theme-accent' : 'text-theme-text-muted/30'}`}
                                                        title="Today's Special"
                                                    >
                                                        <Clock size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="p-2.5 text-theme-text-muted hover:text-theme-accent active:text-theme-accent transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="p-2.5 text-theme-text-muted hover:text-red-400 active:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded bg-theme-secondary border border-theme-border text-theme-text disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 text-theme-text-muted">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 rounded bg-theme-secondary border border-theme-border text-theme-text disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
