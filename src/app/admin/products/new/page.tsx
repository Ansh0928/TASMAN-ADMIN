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
        categoryId: '',
        imageUrls: [] as string[],
        stockQuantity: '0',
        unit: 'PIECE',
        isAvailable: true,
        isFeatured: false,
        isTodaysSpecial: false,
        tags: '',
    });

    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.json())
            .then(data => setCategories(data.categories || data))
            .catch(console.error);
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
                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Category *</label>
                            <select
                                required
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="w-full px-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                            >
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
                                onChange={(e) => setForm({ ...form, isTodaysSpecial: e.target.checked })}
                                className="accent-theme-accent"
                            />
                            Today&apos;s Special
                        </label>
                    </div>
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
