'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    sortOrder: number;
    _count: { products: number };
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // New category form state
    const [showForm, setShowForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formSortOrder, setFormSortOrder] = useState('0');
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editSortOrder, setEditSortOrder] = useState('0');
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormName(name);
        setFormSlug(generateSlug(name));
    };

    // Create category
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return;

        setFormSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName.trim(),
                    slug: formSlug.trim() || undefined,
                    description: formDescription.trim() || undefined,
                    sortOrder: parseInt(formSortOrder, 10) || 0,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCategories([...categories, data.category].sort((a, b) => a.sortOrder - b.sortOrder));
                setFormName('');
                setFormSlug('');
                setFormDescription('');
                setFormSortOrder('0');
                setShowForm(false);
                showSuccess('Category created successfully');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to create category');
            }
        } catch (err) {
            console.error('Create category error:', err);
            setError('Failed to create category');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Start editing
    const startEditing = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditSlug(cat.slug);
        setEditDescription(cat.description || '');
        setEditSortOrder(cat.sortOrder.toString());
        setError('');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditSlug('');
        setEditDescription('');
        setEditSortOrder('0');
    };

    // Update category
    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;

        setEditSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName.trim(),
                    slug: editSlug.trim(),
                    description: editDescription.trim() || null,
                    sortOrder: parseInt(editSortOrder, 10) || 0,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCategories(
                    categories
                        .map((c) => (c.id === id ? data.category : c))
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                );
                cancelEditing();
                showSuccess('Category updated successfully');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to update category');
            }
        } catch (err) {
            console.error('Update category error:', err);
            setError('Failed to update category');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Delete category
    const handleDelete = async (id: string, name: string, productCount: number) => {
        if (productCount > 0) {
            setError(`Cannot delete "${name}" because it has ${productCount} product(s). Reassign or remove them first.`);
            return;
        }

        if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;

        setError('');

        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(categories.filter((c) => c.id !== id));
                showSuccess('Category deleted successfully');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete category');
            }
        } catch (err) {
            console.error('Delete category error:', err);
            setError('Failed to delete category');
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="text-theme-text-muted hover:text-theme-text transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-3xl font-bold font-serif text-theme-text">Category Management</h2>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setError('');
                    }}
                    className="bg-theme-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-theme-accent/90 transition-colors"
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    {successMessage}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Add Category Form */}
            {showForm && (
                <div className="mb-6 bg-theme-secondary border border-theme-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-theme-text mb-4">New Category</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-theme-text-muted mb-1">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Fresh Fish"
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-text-muted mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={formSlug}
                                    onChange={(e) => setFormSlug(e.target.value)}
                                    placeholder="auto-generated-from-name"
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                                <p className="text-xs text-theme-text-muted mt-1">Auto-generated from name if left empty</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-theme-text-muted mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Optional description"
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-text-muted mb-1">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={formSortOrder}
                                    onChange={(e) => setFormSortOrder(e.target.value)}
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                                <p className="text-xs text-theme-text-muted mt-1">Lower numbers appear first</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={formSubmitting || !formName.trim()}
                                className="bg-theme-accent text-white px-6 py-2 rounded-lg hover:bg-theme-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus size={16} />
                                {formSubmitting ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Table */}
            {loading ? (
                <p className="text-theme-text-muted text-center py-8">Loading categories...</p>
            ) : categories.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-theme-text-muted mb-4">No categories found.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-theme-accent hover:underline"
                    >
                        Create your first category
                    </button>
                </div>
            ) : (
                <div className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-theme-border">
                                    <th className="text-left p-4 text-theme-text-muted text-sm font-medium w-10">
                                        <GripVertical size={14} className="opacity-50" />
                                    </th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm font-medium">Name</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm font-medium hidden sm:table-cell">Slug</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm font-medium hidden md:table-cell">Description</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm font-medium">Products</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm font-medium">Order</th>
                                    <th className="text-right p-4 text-theme-text-muted text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="border-b border-theme-border/50 hover:bg-theme-primary/50">
                                        {editingId === cat.id ? (
                                            /* Inline Edit Row */
                                            <>
                                                <td className="p-4">
                                                    <GripVertical size={14} className="text-theme-text-muted opacity-30" />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-theme-primary border border-theme-border rounded text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2 hidden sm:table-cell">
                                                    <input
                                                        type="text"
                                                        value={editSlug}
                                                        onChange={(e) => setEditSlug(e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-theme-primary border border-theme-border rounded text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2 hidden md:table-cell">
                                                    <input
                                                        type="text"
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        placeholder="No description"
                                                        className="w-full px-2 py-1.5 bg-theme-primary border border-theme-border rounded text-theme-text text-sm placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <span className="text-theme-text-muted text-sm">{cat._count.products}</span>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={editSortOrder}
                                                        onChange={(e) => setEditSortOrder(e.target.value)}
                                                        className="w-16 mx-auto block px-2 py-1.5 bg-theme-primary border border-theme-border rounded text-theme-text text-sm text-center focus:border-theme-accent focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleUpdate(cat.id)}
                                                            disabled={editSubmitting || !editName.trim()}
                                                            className="p-2 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                                                            title="Save"
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="p-2 text-theme-text-muted hover:text-theme-text transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            /* Display Row */
                                            <>
                                                <td className="p-4">
                                                    <span className="text-theme-text-muted text-sm">{cat.sortOrder}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-theme-text font-medium">{cat.name}</span>
                                                </td>
                                                <td className="p-4 hidden sm:table-cell">
                                                    <code className="text-theme-text-muted text-sm bg-theme-primary px-2 py-0.5 rounded">{cat.slug}</code>
                                                </td>
                                                <td className="p-4 hidden md:table-cell">
                                                    <span className="text-theme-text-muted text-sm">
                                                        {cat.description || <span className="italic opacity-50">No description</span>}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-sm font-medium ${
                                                        cat._count.products > 0
                                                            ? 'bg-theme-accent/10 text-theme-accent'
                                                            : 'bg-theme-primary text-theme-text-muted'
                                                    }`}>
                                                        {cat._count.products}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-theme-text-muted text-sm">{cat.sortOrder}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => startEditing(cat)}
                                                            className="p-2.5 text-theme-text-muted hover:text-theme-accent active:text-theme-accent transition-colors"
                                                            title="Edit category"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                                                            className={`p-2.5 transition-colors ${
                                                                cat._count.products > 0
                                                                    ? 'text-theme-text-muted/30 cursor-not-allowed'
                                                                    : 'text-theme-text-muted hover:text-red-400 active:text-red-400'
                                                            }`}
                                                            title={cat._count.products > 0
                                                                ? `Cannot delete: ${cat._count.products} product(s) assigned`
                                                                : 'Delete category'
                                                            }
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Summary footer */}
            {!loading && categories.length > 0 && (
                <div className="mt-4 text-sm text-theme-text-muted text-center">
                    {categories.length} {categories.length === 1 ? 'category' : 'categories'} &middot;{' '}
                    {categories.reduce((sum, c) => sum + c._count.products, 0)} total products
                </div>
            )}
        </>
    );
}
