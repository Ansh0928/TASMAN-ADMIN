'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    postcode: string;
    isDefault: boolean;
}

const AU_STATES = ['QLD', 'NSW', 'VIC', 'SA', 'WA', 'TAS', 'NT', 'ACT'] as const;

const emptyForm = { street: '', city: '', state: 'QLD', postcode: '', isDefault: false };

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState(emptyForm);
    const [addSaving, setAddSaving] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState(emptyForm);
    const [editSaving, setEditSaving] = useState(false);

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchAddresses = useCallback(async () => {
        try {
            const res = await fetch('/api/addresses');
            if (!res.ok) {
                if (res.status === 401) {
                    window.location.href = '/auth/login?callbackUrl=/account/addresses';
                    return;
                }
                throw new Error('Failed to load addresses');
            }
            const data = await res.json();
            setAddresses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load addresses');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // ── Add Address ──
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddSaving(true);
        setError('');

        try {
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addForm),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add address');
            }
            setAddForm(emptyForm);
            setShowAddForm(false);
            await fetchAddresses();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add address');
        } finally {
            setAddSaving(false);
        }
    };

    // ── Edit Address ──
    const startEdit = (addr: Address) => {
        setEditingId(addr.id);
        setEditForm({
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postcode: addr.postcode,
            isDefault: addr.isDefault,
        });
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        setEditSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/addresses/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update address');
            }
            setEditingId(null);
            await fetchAddresses();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update address');
        } finally {
            setEditSaving(false);
        }
    };

    // ── Delete Address ──
    const handleDelete = async (id: string) => {
        setDeleteLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 204) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete address');
            }
            setDeletingId(null);
            await fetchAddresses();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete address');
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Set Default ──
    const handleSetDefault = async (id: string) => {
        setError('');
        try {
            const res = await fetch(`/api/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDefault: true }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to set default');
            }
            await fetchAddresses();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set default');
        }
    };

    // ── Reusable Form Fields ──
    const renderFormFields = (
        form: typeof emptyForm,
        setForm: (f: typeof emptyForm) => void,
        saving: boolean,
        onSubmit: (e: React.FormEvent) => void,
        submitLabel: string,
        onCancel: () => void
    ) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-theme-text-muted mb-1">
                    Street Address
                </label>
                <input
                    type="text"
                    required
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    placeholder="123 Ocean Drive"
                    className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text placeholder:text-theme-text-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-theme-text-muted mb-1">
                        City / Suburb
                    </label>
                    <input
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="Varsity Lakes"
                        className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text placeholder:text-theme-text-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-theme-text-muted mb-1">
                        State
                    </label>
                    <select
                        required
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                    >
                        {AU_STATES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-theme-text-muted mb-1">
                        Postcode
                    </label>
                    <input
                        type="text"
                        required
                        value={form.postcode}
                        onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                        placeholder="4227"
                        pattern="[0-9]{4}"
                        title="4-digit Australian postcode"
                        className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text placeholder:text-theme-text-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                    />
                </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-theme-border text-theme-accent focus:ring-theme-accent"
                />
                <span className="text-sm text-theme-text-muted">Set as default address</span>
            </label>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {saving ? 'Saving...' : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 border border-theme-border text-theme-text-muted rounded-lg hover:border-theme-text-muted transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );

    // ── Render ──
    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <Link
                                href="/account"
                                className="text-sm text-theme-text-muted hover:text-theme-accent transition-colors mb-2 inline-block"
                            >
                                &larr; Back to Account
                            </Link>
                            <h1 className="text-4xl font-bold font-serif text-theme-text">
                                My Addresses
                            </h1>
                            <p className="text-theme-text-muted mt-1">
                                Manage your delivery addresses
                            </p>
                        </div>
                        {!showAddForm && !editingId && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-5 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                                + Add Address
                            </button>
                        )}
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-5 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="bg-theme-secondary border border-theme-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold font-serif text-theme-text mb-4">
                                Add New Address
                            </h2>
                            {renderFormFields(
                                addForm,
                                setAddForm,
                                addSaving,
                                handleAdd,
                                'Add Address',
                                () => {
                                    setShowAddForm(false);
                                    setAddForm(emptyForm);
                                    setError('');
                                }
                            )}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-16">
                            <div className="inline-block w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                            <p className="text-theme-text-muted mt-3">Loading addresses...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && addresses.length === 0 && (
                        <div className="bg-theme-secondary border border-theme-border rounded-xl p-12 text-center">
                            <div className="text-4xl mb-3 opacity-30">📍</div>
                            <h3 className="text-lg font-semibold text-theme-text mb-2">
                                No addresses yet
                            </h3>
                            <p className="text-theme-text-muted text-sm mb-6">
                                Add a delivery address to make checkout faster.
                            </p>
                            {!showAddForm && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-5 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                >
                                    + Add Your First Address
                                </button>
                            )}
                        </div>
                    )}

                    {/* Address List */}
                    {!loading && addresses.length > 0 && (
                        <div className="space-y-4">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    className={`bg-theme-secondary border rounded-xl p-6 transition-colors ${
                                        addr.isDefault
                                            ? 'border-theme-accent'
                                            : 'border-theme-border'
                                    }`}
                                >
                                    {editingId === addr.id ? (
                                        /* Edit Form Inline */
                                        <div>
                                            <h3 className="text-lg font-semibold font-serif text-theme-text mb-4">
                                                Edit Address
                                            </h3>
                                            {renderFormFields(
                                                editForm,
                                                setEditForm,
                                                editSaving,
                                                handleEdit,
                                                'Save Changes',
                                                () => {
                                                    setEditingId(null);
                                                    setError('');
                                                }
                                            )}
                                        </div>
                                    ) : deletingId === addr.id ? (
                                        /* Delete Confirmation */
                                        <div className="flex items-center justify-between">
                                            <p className="text-theme-text text-sm">
                                                Are you sure you want to delete this address?
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleDelete(addr.id)}
                                                    disabled={deleteLoading}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(null)}
                                                    className="px-4 py-2 border border-theme-border text-theme-text-muted rounded-lg text-sm hover:border-theme-text-muted transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Address Display */
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-theme-text font-medium">
                                                        {addr.street}
                                                    </p>
                                                    {addr.isDefault && (
                                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-theme-accent/15 text-theme-accent border border-theme-accent/20">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-theme-text-muted text-sm">
                                                    {addr.city}, {addr.state} {addr.postcode}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!addr.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(addr.id)}
                                                        className="px-3 py-1.5 text-xs font-medium border border-theme-border text-theme-text-muted rounded-lg hover:border-theme-accent hover:text-theme-accent transition-colors"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => startEdit(addr)}
                                                    className="px-3 py-1.5 text-xs font-medium border border-theme-border text-theme-text-muted rounded-lg hover:border-theme-accent hover:text-theme-accent transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(addr.id)}
                                                    className="px-3 py-1.5 text-xs font-medium border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
