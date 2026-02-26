'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, FolderPlus } from 'lucide-react';

interface WholesaleItem {
    id: string;
    name: string;
    description: string | null;
    unit: string;
    price: string;
    isAvailable: boolean;
    sortOrder: number;
    categoryId: string;
}

interface WholesaleCategory {
    id: string;
    name: string;
    sortOrder: number;
    items: WholesaleItem[];
}

export default function AdminWholesale() {
    const [categories, setCategories] = useState<WholesaleCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // New category form
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // New item form
    const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({ name: '', description: '', unit: 'per kg', price: '' });

    // Edit item
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', unit: '', price: '', isAvailable: true });

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/wholesale');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            }
        } catch (err) {
            console.error('Failed to fetch wholesale data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const addCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch('/api/admin/wholesale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'category', name: newCategoryName, sortOrder: categories.length }),
            });
            if (res.ok) {
                setNewCategoryName('');
                setShowNewCategory(false);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to add category:', err);
        }
    };

    const deleteCategory = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}" and all its items?`)) return;
        try {
            const res = await fetch(`/api/admin/wholesale/${id}?type=category`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    const addItem = async (categoryId: string) => {
        if (!newItem.name || !newItem.price) return;
        try {
            const res = await fetch('/api/admin/wholesale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'item',
                    categoryId,
                    name: newItem.name,
                    description: newItem.description || null,
                    unit: newItem.unit,
                    price: newItem.price,
                }),
            });
            if (res.ok) {
                setNewItem({ name: '', description: '', unit: 'per kg', price: '' });
                setAddingItemTo(null);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to add item:', err);
        }
    };

    const startEditItem = (item: WholesaleItem) => {
        setEditingItem(item.id);
        setEditForm({
            name: item.name,
            description: item.description || '',
            unit: item.unit,
            price: item.price.toString(),
            isAvailable: item.isAvailable,
        });
    };

    const saveEditItem = async (itemId: string) => {
        try {
            const res = await fetch(`/api/admin/wholesale/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'item', ...editForm }),
            });
            if (res.ok) {
                setEditingItem(null);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to update item:', err);
        }
    };

    const deleteItem = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/wholesale/${id}?type=item`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Failed to delete item:', err);
        }
    };

    if (loading) {
        return <p className="text-theme-text-muted text-center py-8">Loading wholesale data...</p>;
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-theme-text">Wholesale Price List</h2>
                    <p className="text-theme-text-muted mt-1">Manage your wholesale price sheet. Approved wholesale users see this as a read-only list.</p>
                </div>
                <button
                    onClick={() => setShowNewCategory(true)}
                    className="bg-theme-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-theme-accent/90"
                >
                    <FolderPlus size={18} /> Add Category
                </button>
            </div>

            {/* New Category Form */}
            {showNewCategory && (
                <div className="bg-theme-secondary border border-theme-border rounded-lg p-4 mb-6 flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-theme-text-muted text-sm mb-1">Category Name</label>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="e.g. Prawns, Fish Fillets, Crabs..."
                            className="w-full px-4 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                            autoFocus
                        />
                    </div>
                    <button onClick={addCategory} className="bg-theme-accent text-white px-4 py-2 rounded-lg">Add</button>
                    <button onClick={() => setShowNewCategory(false)} className="px-4 py-2 text-theme-text-muted hover:text-theme-text">Cancel</button>
                </div>
            )}

            {/* Categories + Items */}
            {categories.length === 0 ? (
                <p className="text-theme-text-muted text-center py-8">No wholesale categories yet. Add one to get started.</p>
            ) : (
                <div className="space-y-6">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                            {/* Category Header */}
                            <div className="flex items-center justify-between p-4 border-b border-theme-border">
                                <h3 className="text-xl font-bold text-theme-text">{cat.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAddingItemTo(addingItemTo === cat.id ? null : cat.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-theme-accent/10 text-theme-accent rounded text-sm hover:bg-theme-accent/20"
                                    >
                                        <Plus size={14} /> Add Item
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(cat.id, cat.name)}
                                        className="p-1.5 text-theme-text-muted hover:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* New Item Form */}
                            {addingItemTo === cat.id && (
                                <div className="p-4 bg-theme-primary/50 border-b border-theme-border">
                                    <div className="grid grid-cols-4 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Item name"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            className="px-3 py-2 bg-theme-secondary border border-theme-border rounded text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unit (per kg, per box...)"
                                            value={newItem.unit}
                                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                            className="px-3 py-2 bg-theme-secondary border border-theme-border rounded text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Price"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            className="px-3 py-2 bg-theme-secondary border border-theme-border rounded text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => addItem(cat.id)}
                                                className="bg-theme-accent text-white px-3 py-2 rounded text-sm flex-1">Add</button>
                                            <button onClick={() => setAddingItemTo(null)}
                                                className="px-3 py-2 text-theme-text-muted text-sm"><X size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items Table */}
                            {cat.items.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-theme-text-muted text-sm border-b border-theme-border/50">
                                            <th className="text-left p-3 font-medium">Item</th>
                                            <th className="text-left p-3 font-medium">Unit</th>
                                            <th className="text-right p-3 font-medium">Price</th>
                                            <th className="text-center p-3 font-medium">Status</th>
                                            <th className="text-right p-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cat.items.map((item) => (
                                            <tr key={item.id} className="border-b border-theme-border/30 hover:bg-theme-primary/30">
                                                {editingItem === item.id ? (
                                                    <>
                                                        <td className="p-3">
                                                            <input type="text" value={editForm.name}
                                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                className="w-full px-2 py-1 bg-theme-primary border border-theme-border rounded text-theme-text text-sm" />
                                                        </td>
                                                        <td className="p-3">
                                                            <input type="text" value={editForm.unit}
                                                                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                                                className="w-full px-2 py-1 bg-theme-primary border border-theme-border rounded text-theme-text text-sm" />
                                                        </td>
                                                        <td className="p-3">
                                                            <input type="number" step="0.01" value={editForm.price}
                                                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                                className="w-full px-2 py-1 bg-theme-primary border border-theme-border rounded text-theme-text text-sm text-right" />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button onClick={() => setEditForm({ ...editForm, isAvailable: !editForm.isAvailable })}
                                                                className={`text-xs px-2 py-1 rounded ${editForm.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {editForm.isAvailable ? 'Available' : 'Hidden'}
                                                            </button>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex justify-end gap-1">
                                                                <button onClick={() => saveEditItem(item.id)} className="p-1.5 text-green-400 hover:text-green-300"><Save size={14} /></button>
                                                                <button onClick={() => setEditingItem(null)} className="p-1.5 text-theme-text-muted hover:text-theme-text"><X size={14} /></button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-3">
                                                            <p className="text-theme-text">{item.name}</p>
                                                            {item.description && <p className="text-theme-text-muted text-xs">{item.description}</p>}
                                                        </td>
                                                        <td className="p-3 text-theme-text-muted text-sm">{item.unit}</td>
                                                        <td className="p-3 text-theme-text text-right font-medium">${parseFloat(item.price).toFixed(2)}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={`text-xs px-2 py-0.5 rounded ${item.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {item.isAvailable ? 'Available' : 'Hidden'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex justify-end gap-1">
                                                                <button onClick={() => startEditItem(item)} className="p-1.5 text-theme-text-muted hover:text-theme-accent"><Edit size={14} /></button>
                                                                <button onClick={() => deleteItem(item.id, item.name)} className="p-1.5 text-theme-text-muted hover:text-red-400"><Trash2 size={14} /></button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-theme-text-muted text-sm p-4">No items in this category yet.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
