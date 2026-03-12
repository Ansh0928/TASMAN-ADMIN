'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, X, Search } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface ProductOption {
    id: string;
    name: string;
    slug: string;
    imageUrls: string[];
    category: { id: string; name: string };
}

export default function EditProduct() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [categories, setCategories] = useState<Category[]>([]);
    const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [relatedSearch, setRelatedSearch] = useState('');
    const [relatedDropdownOpen, setRelatedDropdownOpen] = useState(false);
    const relatedDropdownRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrls: [] as string[],
        stockQuantity: '0',
        unit: 'PIECE',
        isAvailable: true,
        isFeatured: false,
        isTodaysSpecial: false,
        discountPercent: '',
        countryOfOrigin: 'Australia',
        tags: '',
        relatedProductIds: [] as string[],
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/products/${productId}`).then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/admin/products?limit=200').then(r => r.json()),
        ]).then(([product, catData, productsData]) => {
            setCategories(catData.categories || catData);
            setAllProducts((productsData.products || []).filter((p: ProductOption) => p.id !== productId));
            setForm({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                categoryId: product.categoryId || '',
                imageUrls: product.imageUrls || [],
                stockQuantity: String(product.stockQuantity || 0),
                unit: product.unit || 'PIECE',
                isAvailable: product.isAvailable ?? true,
                isFeatured: product.isFeatured ?? false,
                isTodaysSpecial: product.isTodaysSpecial ?? false,
                discountPercent: product.discountPercent ? String(product.discountPercent) : '',
                countryOfOrigin: product.countryOfOrigin || 'Australia',
                tags: (product.tags || []).join(', '),
                relatedProductIds: product.relatedProductIds || [],
            });
            setLoading(false);
        }).catch(() => {
            setError('Failed to load product');
            setLoading(false);
        });
    }, [productId]);

    // Close related products dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (relatedDropdownRef.current && !relatedDropdownRef.current.contains(event.target as Node)) {
                setRelatedDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p =>
            !form.relatedProductIds.includes(p.id) &&
            (relatedSearch === '' || p.name.toLowerCase().includes(relatedSearch.toLowerCase()))
        );
    }, [allProducts, form.relatedProductIds, relatedSearch]);

    const selectedRelatedProducts = useMemo(() => {
        return form.relatedProductIds
            .map(id => allProducts.find(p => p.id === id))
            .filter(Boolean) as ProductOption[];
    }, [allProducts, form.relatedProductIds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    imageUrls: form.imageUrls,
                    stockQuantity: parseInt(form.stockQuantity, 10),
                    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                    countryOfOrigin: form.countryOfOrigin,
                    relatedProductIds: form.relatedProductIds,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update product');
            }

            router.back();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-theme-text-muted text-center py-8">Loading product...</p>;
    }

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="text-theme-text-muted hover:text-theme-text">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-3xl font-bold text-theme-text">Edit Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-theme-text-muted text-sm mb-1">Product Name *</label>
                        <input type="text" required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none" />
                    </div>

                    <div>
                        <label className="block text-theme-text-muted text-sm mb-1">Description</label>
                        <textarea rows={3} value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Price ($) *</label>
                            <input type="number" step="0.01" required value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Category *</label>
                            <select required value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none">
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Stock Quantity</label>
                            <input type="number" value={form.stockQuantity}
                                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Unit</label>
                            <select value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none">
                                <option value="PIECE">Piece</option>
                                <option value="KG">Kg</option>
                                <option value="DOZEN">Dozen</option>
                                <option value="BOX">Box</option>
                                <option value="PACK">Pack</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-theme-text-muted text-sm mb-1">Country of Origin</label>
                        <select
                            value={form.countryOfOrigin}
                            onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
                            className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                        >
                            <option value="Australia">Australia</option>
                            <option value="New Zealand">New Zealand</option>
                        </select>
                    </div>

                    <ImageUploader
                        value={form.imageUrls}
                        onChange={(urls) => setForm({ ...form, imageUrls: urls })}
                        folder="products"
                    />

                    <div>
                        <label className="block text-theme-text-muted text-sm mb-1">Tags (comma separated)</label>
                        <input type="text" value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none" />
                    </div>

                    {/* Related Products */}
                    <div>
                        <label className="block text-theme-text-muted text-sm mb-1">Related Products</label>
                        <p className="text-theme-text-muted text-xs mb-2">Select products to show as recommendations on this product&apos;s page.</p>

                        {/* Selected related products */}
                        {selectedRelatedProducts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedRelatedProducts.map((p) => (
                                    <span
                                        key={p.id}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-theme-accent/10 text-theme-accent text-sm rounded-full"
                                    >
                                        {p.name}
                                        <button
                                            type="button"
                                            onClick={() => setForm({
                                                ...form,
                                                relatedProductIds: form.relatedProductIds.filter(id => id !== p.id),
                                            })}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Searchable dropdown */}
                        <div className="relative" ref={relatedDropdownRef}>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search products to add..."
                                    value={relatedSearch}
                                    onChange={(e) => {
                                        setRelatedSearch(e.target.value);
                                        setRelatedDropdownOpen(true);
                                    }}
                                    onFocus={() => setRelatedDropdownOpen(true)}
                                    className="w-full pl-9 pr-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                                />
                            </div>
                            {relatedDropdownOpen && filteredProducts.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-theme-secondary border border-theme-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredProducts.slice(0, 20).map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setForm({
                                                    ...form,
                                                    relatedProductIds: [...form.relatedProductIds, p.id],
                                                });
                                                setRelatedSearch('');
                                                setRelatedDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-theme-accent/10 text-theme-text text-sm flex items-center gap-2 transition-colors"
                                        >
                                            {p.imageUrls && p.imageUrls[0] && (
                                                <img src={p.imageUrls[0]} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
                                            )}
                                            <span className="truncate">{p.name}</span>
                                            <span className="text-theme-text-muted text-xs ml-auto flex-shrink-0">{p.category?.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-theme-text">
                            <input type="checkbox" checked={form.isAvailable}
                                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                                className="accent-theme-accent" />
                            Available
                        </label>
                        <label className="flex items-center gap-2 text-theme-text">
                            <input type="checkbox" checked={form.isFeatured}
                                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                className="accent-theme-accent" />
                            Featured (Best Buy)
                        </label>
                        <label className="flex items-center gap-2 text-theme-text">
                            <input type="checkbox" checked={form.isTodaysSpecial}
                                onChange={(e) => setForm({ ...form, isTodaysSpecial: e.target.checked, ...(!e.target.checked && { discountPercent: '' }) })}
                                className="accent-theme-accent" />
                            Today&apos;s Special
                        </label>
                    </div>

                    {form.isTodaysSpecial && (
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Discount % (optional — shown on deals page)</label>
                            <input
                                type="number"
                                min="1"
                                max="99"
                                placeholder="e.g. 20"
                                value={form.discountPercent}
                                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                                className="w-full max-w-[200px] px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-8">
                    <button type="submit" disabled={saving}
                        className="bg-theme-accent text-white px-6 py-2 rounded-lg hover:bg-theme-accent/90 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </>
    );
}
