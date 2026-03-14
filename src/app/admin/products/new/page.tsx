'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function NewProduct() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        categoryIds: [] as string[],
        primaryCategoryId: '',
        imageUrls: [] as string[],
        stockQuantity: '0',
        unit: 'PIECE',
        isAvailable: true,
        isFeatured: false,
        isTodaysSpecial: false,
        discountPercent: '',
        countryOfOrigin: 'Australia',
        tags: '',
    });

    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.json())
            .then(data => setCategories(data.categories || data))
            .catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    imageUrls: form.imageUrls,
                    stockQuantity: parseInt(form.stockQuantity, 10),
                    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                    countryOfOrigin: form.countryOfOrigin,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create product');
            }

            router.push('/admin/products');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/products" className="text-theme-text-muted hover:text-theme-text">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className="text-3xl font-bold text-theme-text">Add New Product</h2>
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
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-theme-text-muted text-sm mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Price ($) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-theme-text-muted text-sm mb-1">Categories *</label>
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                            {categories.map((c) => (
                                <label key={c.id} className="flex items-center gap-3 py-1 cursor-pointer hover:bg-theme-primary/50 rounded px-2">
                                    <input
                                        type="checkbox"
                                        checked={form.categoryIds.includes(c.id)}
                                        onChange={(e) => {
                                            const newIds = e.target.checked
                                                ? [...form.categoryIds, c.id]
                                                : form.categoryIds.filter(id => id !== c.id);
                                            const newPrimary = !e.target.checked && form.primaryCategoryId === c.id
                                                ? newIds[0] || ''
                                                : form.primaryCategoryId || (e.target.checked && newIds.length === 1 ? c.id : form.primaryCategoryId);
                                            setForm({ ...form, categoryIds: newIds, primaryCategoryId: newPrimary });
                                        }}
                                        className="accent-theme-accent"
                                    />
                                    <span className="text-theme-text text-sm flex-1">{c.name}</span>
                                    {form.categoryIds.includes(c.id) && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setForm({ ...form, primaryCategoryId: c.id });
                                            }}
                                            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                                form.primaryCategoryId === c.id
                                                    ? 'bg-theme-accent text-white'
                                                    : 'bg-theme-primary text-theme-text-muted hover:bg-theme-accent/20'
                                            }`}
                                        >
                                            {form.primaryCategoryId === c.id ? 'Primary' : 'Set primary'}
                                        </button>
                                    )}
                                </label>
                            ))}
                        </div>
                        {form.categoryIds.length === 0 && (
                            <p className="text-red-400 text-xs mt-1">Select at least one category</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Stock Quantity</label>
                            <input
                                type="number"
                                value={form.stockQuantity}
                                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Unit</label>
                            <select
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                            >
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
                        <input
                            type="text"
                            placeholder="best-buy, new, sale"
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-theme-text">
                            <input
                                type="checkbox"
                                checked={form.isAvailable}
                                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                                className="accent-theme-accent"
                            />
                            Available
                        </label>
                        <label className="flex items-center gap-2 text-theme-text">
                            <input
                                type="checkbox"
                                checked={form.isFeatured}
                                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                className="accent-theme-accent"
                            />
                            Featured (Best Buy)
                        </label>
                        <label className="flex items-center gap-2 text-theme-text">
                            <input
                                type="checkbox"
                                checked={form.isTodaysSpecial}
                                onChange={(e) => setForm({ ...form, isTodaysSpecial: e.target.checked, ...(!e.target.checked && { discountPercent: '' }) })}
                                className="accent-theme-accent"
                            />
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
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-theme-accent text-white px-6 py-2 rounded-lg hover:bg-theme-accent/90 disabled:opacity-50"
                    >
                        {saving ? 'Creating...' : 'Create Product'}
                    </button>
                    <Link href="/admin/products" className="px-6 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </>
    );
}
