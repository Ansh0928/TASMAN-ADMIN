'use client';

import { useEffect, useState } from 'react';
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    couponId: string;
    percentOff: number | null;
    amountOff: number | null;
    currency: string | null;
    active: boolean;
    timesRedeemed: number;
    maxRedemptions: number | null;
    expiresAt: number | null;
    created: number;
}

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    const [form, setForm] = useState({
        code: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        percentOff: '',
        amountOff: '',
        maxRedemptions: '',
        expiresAt: '',
    });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/coupons');
            if (res.ok) {
                const data = await res.json();
                setCoupons(data.coupons);
            }
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setCreating(true);

        try {
            const body: Record<string, unknown> = { code: form.code };
            if (form.discountType === 'percentage') {
                body.percentOff = Number(form.percentOff);
            } else {
                body.amountOff = Number(form.amountOff);
            }
            if (form.maxRedemptions) body.maxRedemptions = Number(form.maxRedemptions);
            if (form.expiresAt) body.expiresAt = form.expiresAt;

            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowForm(false);
                setForm({ code: '', discountType: 'percentage', percentOff: '', amountOff: '', maxRedemptions: '', expiresAt: '' });
                fetchCoupons();
            } else {
                const data = await res.json();
                setFormError(data.message || 'Failed to create coupon');
            }
        } catch {
            setFormError('Network error — please try again');
        } finally {
            setCreating(false);
        }
    };

    const toggleActive = async (coupon: Coupon) => {
        setToggling(coupon.id);
        try {
            const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !coupon.active }),
            });
            if (res.ok) {
                setCoupons(coupons.map(c =>
                    c.id === coupon.id ? { ...c, active: !c.active } : c
                ));
            }
        } catch (err) {
            console.error('Failed to toggle coupon:', err);
        } finally {
            setToggling(null);
        }
    };

    const formatDiscount = (c: Coupon) => {
        if (c.percentOff) return `${c.percentOff}% off`;
        if (c.amountOff) return `$${(c.amountOff / 100).toFixed(2)} off`;
        return '—';
    };

    const formatDate = (ts: number | null) => {
        if (!ts) return '—';
        return new Date(ts * 1000).toLocaleDateString();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-theme-text">Coupons</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'Create Coupon'}
                </button>
            </div>

            {/* Create Coupon Form */}
            {showForm && (
                <div className="bg-theme-secondary border border-theme-border rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-theme-text mb-4">New Coupon</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {formError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="block text-theme-text-muted text-sm mb-1">Code *</label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. SUMMER20"
                                required
                                className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-theme-text-muted text-sm mb-2">Discount Type *</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="discountType"
                                        checked={form.discountType === 'percentage'}
                                        onChange={() => setForm({ ...form, discountType: 'percentage', amountOff: '' })}
                                        className="accent-theme-accent"
                                    />
                                    <span className="text-theme-text text-sm">Percentage</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="discountType"
                                        checked={form.discountType === 'fixed'}
                                        onChange={() => setForm({ ...form, discountType: 'fixed', percentOff: '' })}
                                        className="accent-theme-accent"
                                    />
                                    <span className="text-theme-text text-sm">Fixed Amount (AUD)</span>
                                </label>
                            </div>
                        </div>

                        {form.discountType === 'percentage' ? (
                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Percentage Off *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={form.percentOff}
                                    onChange={(e) => setForm({ ...form, percentOff: e.target.value })}
                                    placeholder="e.g. 20"
                                    required
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Amount Off (AUD) *</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.amountOff}
                                    onChange={(e) => setForm({ ...form, amountOff: e.target.value })}
                                    placeholder="e.g. 10.00"
                                    required
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Max Redemptions</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.maxRedemptions}
                                    onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
                                    placeholder="Unlimited"
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="px-6 py-2 bg-theme-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create Coupon'}
                        </button>
                    </form>
                </div>
            )}

            {/* Coupons Table */}
            {loading ? (
                <p className="text-theme-text-muted text-center py-8">Loading coupons...</p>
            ) : (
                <div className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-theme-border">
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Code</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Discount</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm">Times Used</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm">Max Uses</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Expires</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm">Status</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((c) => (
                                    <tr key={c.id} className="border-b border-theme-border/50 hover:bg-theme-primary/50">
                                        <td className="p-4">
                                            <span className="text-theme-text font-mono font-medium">{c.code}</span>
                                        </td>
                                        <td className="p-4 text-theme-text text-sm">{formatDiscount(c)}</td>
                                        <td className="p-4 text-center text-theme-text text-sm">{c.timesRedeemed}</td>
                                        <td className="p-4 text-center text-theme-text-muted text-sm">
                                            {c.maxRedemptions ?? '∞'}
                                        </td>
                                        <td className="p-4 text-theme-text-muted text-sm">{formatDate(c.expiresAt)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                c.active
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {c.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleActive(c)}
                                                disabled={toggling === c.id}
                                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                                    c.active
                                                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                        : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                                                }`}
                                                title={c.active ? 'Deactivate' : 'Activate'}
                                            >
                                                {c.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-theme-text-muted">
                                            No coupons found. Create one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
