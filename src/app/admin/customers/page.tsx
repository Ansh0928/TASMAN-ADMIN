'use client';

import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';

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

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    const pendingWholesale = customers.filter(c => c.role === 'WHOLESALE' && c.wholesaleStatus === 'PENDING');

    return (
        <>
            <h2 className="text-3xl font-bold text-theme-text mb-6">Customers</h2>

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
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Role</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Wholesale</th>
                                    <th className="text-center p-4 text-theme-text-muted text-sm">Orders</th>
                                    <th className="text-left p-4 text-theme-text-muted text-sm">Joined</th>
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
                                    </tr>
                                ))}
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
        </>
    );
}
