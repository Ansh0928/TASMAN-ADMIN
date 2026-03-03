'use client';

import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, Pencil, Trash2, X, Save, Download } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    wholesaleStatus: string | null;
    companyName: string | null;
    abn: string | null;
    orderCount: number;
    createdAt: string;
}

interface EditFormData {
    name: string;
    email: string;
    phone: string;
    role: string;
    companyName: string;
    abn: string;
    wholesaleStatus: string;
}

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Edit modal state
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [editForm, setEditForm] = useState<EditFormData>({
        name: '', email: '', phone: '', role: '', companyName: '', abn: '', wholesaleStatus: '',
    });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            const res = await fetch(`/api/admin/customers?${params}`);
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.customers);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, [page, roleFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers();
    };

    const updateWholesaleStatus = async (customerId: string, wholesaleStatus: string) => {
        try {
            const res = await fetch(`/api/admin/customers/${customerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wholesaleStatus }),
            });
            if (res.ok) {
                setCustomers(customers.map(c =>
                    c.id === customerId ? { ...c, wholesaleStatus } : c
                ));
            }
        } catch (err) {
            console.error('Failed to update:', err);
        }
    };

    // ── Edit handlers ──

    const openEdit = (customer: Customer) => {
        setEditCustomer(customer);
        setEditForm({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            role: customer.role,
            companyName: customer.companyName || '',
            abn: customer.abn || '',
            wholesaleStatus: customer.wholesaleStatus || '',
        });
        setEditError('');
    };

    const closeEdit = () => {
        setEditCustomer(null);
        setEditError('');
    };

    const handleEditSave = async () => {
        if (!editCustomer) return;
        setEditSaving(true);
        setEditError('');

        try {
            const res = await fetch(`/api/admin/customers/${editCustomer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editForm.name,
                    email: editForm.email,
                    phone: editForm.phone || null,
                    role: editForm.role,
                    companyName: editForm.companyName || null,
                    abn: editForm.abn || null,
                    wholesaleStatus: editForm.wholesaleStatus || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Update customer in local state
                setCustomers(customers.map(c =>
                    c.id === editCustomer.id
                        ? { ...c, ...data.user }
                        : c
                ));
                closeEdit();
            } else {
                const err = await res.json();
                setEditError(err.message || 'Failed to save changes');
            }
        } catch {
            setEditError('Network error — please try again');
        } finally {
            setEditSaving(false);
        }
    };

    // ── Delete handlers ──

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/admin/customers/${deleteTarget.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setCustomers(customers.filter(c => c.id !== deleteTarget.id));
                setDeleteTarget(null);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to delete customer');
            }
        } catch {
            alert('Network error — please try again');
        } finally {
            setDeleting(false);
        }
    };

    const pendingWholesale = customers.filter(c => c.role === 'WHOLESALE' && c.wholesaleStatus === 'PENDING');

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-theme-text">Customers</h2>
                <button
                    onClick={() => {
                        const params = new URLSearchParams();
                        if (search) params.set('search', search);
                        if (roleFilter) params.set('role', roleFilter);
                        window.open(`/api/admin/customers/export?${params}`, '_blank');
                    }}
                    className="px-3 py-1.5 text-sm bg-theme-secondary border border-theme-border rounded-lg text-theme-text hover:border-theme-accent transition-colors flex items-center gap-1.5"
                >
                    <Download size={14} />
                    Export CSV
                </button>
            </div>

            {/* Pending Wholesale Applications */}
            {pendingWholesale.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                        <Clock size={18} />
                        Pending Wholesale Applications ({pendingWholesale.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingWholesale.map((c) => (
                            <div key={c.id} className="flex items-center justify-between bg-theme-secondary rounded-lg p-3">
                                <div>
                                    <p className="text-theme-text font-medium">{c.name}</p>
                                    <p className="text-theme-text-muted text-sm">
                                        {c.companyName && <span>{c.companyName} &middot; </span>}
                                        {c.abn && <span>ABN: {c.abn} &middot; </span>}
                                        {c.email}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateWholesaleStatus(c.id, 'APPROVED')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                                    >
                                        <CheckCircle size={14} /> Approve
                                    </button>
                                    <button
                                        onClick={() => updateWholesaleStatus(c.id, 'REJECTED')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                                    >
                                        <XCircle size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search + Filter */}
            <div className="flex flex-wrap gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name, email, company..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                        />
                    </div>
                    <button type="submit" className="bg-theme-accent text-white px-4 py-2 rounded-lg">Search</button>
                </form>
                <div className="flex gap-2">
                    {['', 'CUSTOMER', 'WHOLESALE', 'ADMIN'].map((role) => (
                        <button
                            key={role}
                            onClick={() => { setRoleFilter(role); setPage(1); }}
                            className={`px-3 py-2 rounded-lg text-sm ${
                                roleFilter === role
                                    ? 'bg-theme-accent text-white'
                                    : 'bg-theme-secondary border border-theme-border text-theme-text-muted hover:text-theme-text'
                            }`}
                        >
                            {role || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="text-theme-text-muted text-center py-8">Loading customers...</p>
            ) : (
                <div className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-theme-border">
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Name</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Email</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Phone</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Role</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Wholesale</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm">Orders</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Joined</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c) => (
                                    <tr key={c.id} className="border-b border-theme-border/50 hover:bg-theme-primary/50">
                                        <td className="p-4">
                                            <p className="text-theme-text font-medium">{c.name}</p>
                                            {c.companyName && <p className="text-theme-text-muted text-xs">{c.companyName}</p>}
                                        </td>
                                        <td className="p-4 text-theme-text-muted text-sm">{c.email}</td>
                                        <td className="p-4 text-theme-text-muted text-sm">{c.phone || '—'}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                c.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                                                c.role === 'WHOLESALE' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {c.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {c.wholesaleStatus && (
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    c.wholesaleStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                    c.wholesaleStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {c.wholesaleStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center text-theme-text">{c.orderCount}</td>
                                        <td className="p-4 text-theme-text-muted text-sm">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEdit(c)}
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                    title="Edit customer"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                    title="Delete customer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-theme-text-muted">
                                            No customers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="px-3 py-1 rounded bg-theme-secondary border border-theme-border text-theme-text disabled:opacity-50">Prev</button>
                    <span className="px-3 py-1 text-theme-text-muted">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="px-3 py-1 rounded bg-theme-secondary border border-theme-border text-theme-text disabled:opacity-50">Next</button>
                </div>
            )}

            {/* ─── Edit Customer Modal ─── */}
            {editCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-theme-secondary border border-theme-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-theme-border">
                            <h3 className="text-xl font-bold text-theme-text">Edit Customer</h3>
                            <button onClick={closeEdit} className="p-1.5 rounded-lg hover:bg-theme-primary text-theme-text-muted">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-4">
                            {editError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                                    {editError}
                                </div>
                            )}

                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    placeholder="+61 400 000 000"
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-theme-text-muted text-sm mb-1">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                                    >
                                        <option value="CUSTOMER">Customer</option>
                                        <option value="WHOLESALE">Wholesale</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-theme-text-muted text-sm mb-1">Wholesale Status</label>
                                    <select
                                        value={editForm.wholesaleStatus}
                                        onChange={(e) => setEditForm({ ...editForm, wholesaleStatus: e.target.value })}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                                    >
                                        <option value="">None</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={editForm.companyName}
                                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text focus:border-theme-accent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-theme-text-muted text-sm mb-1">ABN</label>
                                <input
                                    type="text"
                                    value={editForm.abn}
                                    onChange={(e) => setEditForm({ ...editForm, abn: e.target.value })}
                                    placeholder="12 345 678 901"
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:border-theme-accent focus:outline-none"
                                />
                            </div>

                            {/* Meta info */}
                            <div className="pt-2 border-t border-theme-border text-xs text-theme-text-muted space-y-1">
                                <p>Customer ID: {editCustomer.id}</p>
                                <p>Orders: {editCustomer.orderCount}</p>
                                <p>Joined: {new Date(editCustomer.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-theme-border">
                            <button
                                onClick={closeEdit}
                                className="px-4 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={editSaving || !editForm.name || !editForm.email}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-theme-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Save size={16} />
                                {editSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation Modal ─── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-theme-secondary border border-theme-border rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-theme-text text-center mb-2">Delete Customer</h3>
                            <p className="text-theme-text-muted text-center text-sm mb-1">
                                Are you sure you want to delete <strong className="text-theme-text">{deleteTarget.name}</strong>?
                            </p>
                            <p className="text-theme-text-muted text-center text-xs">
                                {deleteTarget.email}
                                {deleteTarget.orderCount > 0 && (
                                    <span className="text-yellow-400"> &middot; {deleteTarget.orderCount} order{deleteTarget.orderCount !== 1 ? 's' : ''} on record</span>
                                )}
                            </p>
                            <p className="text-red-400 text-center text-xs mt-3">
                                This action cannot be undone. The customer and their addresses will be permanently removed.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 p-6 border-t border-theme-border">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-theme-border text-theme-text hover:bg-theme-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
