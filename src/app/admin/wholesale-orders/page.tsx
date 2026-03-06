'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Package, ChevronDown } from 'lucide-react';

interface WholesaleOrder {
    id: string;
    status: string;
    notes?: string;
    adminNotes?: string;
    createdAt: string;
    user: { name: string; email: string; phone?: string; companyName?: string };
    items: { quantity: number; unitPrice: string; total: string; wholesalePriceItem: { name: string; unit: string } }[];
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED'];

export default function AdminWholesaleOrders() {
    const [orders, setOrders] = useState<WholesaleOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/wholesale-orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error('Failed to fetch wholesale orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/wholesale-orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminNotes: adminNotes[orderId] || undefined }),
            });
            if (res.ok) fetchOrders();
        } catch (err) {
            console.error('Failed to update order:', err);
        }
    };

    const statusIcon = (s: string) => {
        switch (s) {
            case 'CONFIRMED': return <CheckCircle size={16} className="text-green-500" />;
            case 'REJECTED': return <XCircle size={16} className="text-red-500" />;
            case 'COMPLETED': return <Package size={16} className="text-blue-500" />;
            default: return <Clock size={16} className="text-yellow-500" />;
        }
    };

    const filteredOrders = statusFilter === 'ALL'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    if (loading) return <p className="text-theme-text-muted text-center py-8">Loading wholesale orders...</p>;

    return (
        <>
            <h2 className="text-3xl font-bold text-theme-text mb-6">Wholesale Orders</h2>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {STATUS_OPTIONS.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === status
                                ? 'bg-theme-accent text-white'
                                : 'bg-theme-secondary border border-theme-border text-theme-text-muted hover:text-theme-text'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <p className="text-theme-text-muted text-center py-8">No wholesale orders yet.</p>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => {
                        const total = order.items.reduce((s, i) => s + parseFloat(i.total), 0);
                        const isExpanded = expandedId === order.id;

                        return (
                            <div key={order.id} className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-theme-primary/30"
                                >
                                    <div className="flex items-center gap-3">
                                        {statusIcon(order.status)}
                                        <span className="font-bold text-theme-text">#{order.id.slice(-8).toUpperCase()}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            order.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                            order.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>{order.status}</span>
                                        <span className="text-theme-text-muted text-sm">{order.user.companyName || order.user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-theme-accent font-bold">${total.toFixed(2)}</span>
                                        <span className="text-theme-text-muted text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <ChevronDown size={16} className={`text-theme-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-theme-border p-4">
                                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-theme-text-muted">Customer</p>
                                                <p className="text-theme-text">{order.user.name} ({order.user.email})</p>
                                                {order.user.phone && <p className="text-theme-text-muted text-sm">{order.user.phone}</p>}
                                                {order.user.companyName && <p className="text-theme-text-muted text-sm">{order.user.companyName}</p>}
                                            </div>
                                            {order.notes && (
                                                <div>
                                                    <p className="text-sm text-theme-text-muted">Customer Notes</p>
                                                    <p className="text-theme-text text-sm">{order.notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="overflow-x-auto">
                                        <table className="w-full mb-4">
                                            <thead>
                                                <tr className="text-theme-text-muted text-sm border-b border-theme-border/50">
                                                    <th className="text-left p-2">Item</th>
                                                    <th className="text-center p-2">Qty</th>
                                                    <th className="text-right p-2">Unit Price</th>
                                                    <th className="text-right p-2">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, i) => (
                                                    <tr key={i} className="border-b border-theme-border/20 text-sm">
                                                        <td className="p-2 text-theme-text">{item.wholesalePriceItem.name}</td>
                                                        <td className="p-2 text-center text-theme-text">{item.quantity}</td>
                                                        <td className="p-2 text-right text-theme-text-muted">${parseFloat(item.unitPrice).toFixed(2)}</td>
                                                        <td className="p-2 text-right text-theme-text">${parseFloat(item.total).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>

                                        {/* Admin actions */}
                                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                            <div className="flex-1">
                                                <label className="text-sm text-theme-text-muted block mb-1">Admin Notes</label>
                                                <input
                                                    type="text"
                                                    placeholder="Add notes..."
                                                    value={adminNotes[order.id] || order.adminNotes || ''}
                                                    onChange={(e) => setAdminNotes({ ...adminNotes, [order.id]: e.target.value })}
                                                    className="w-full px-3 py-2 bg-theme-primary border border-theme-border rounded text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {order.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => updateStatus(order.id, 'CONFIRMED')}
                                                            className="px-3 py-2 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30">Confirm</button>
                                                        <button onClick={() => updateStatus(order.id, 'REJECTED')}
                                                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30">Reject</button>
                                                    </>
                                                )}
                                                {order.status === 'CONFIRMED' && (
                                                    <button onClick={() => updateStatus(order.id, 'COMPLETED')}
                                                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30">Mark Fulfilled</button>
                                                )}
                                                {!['COMPLETED', 'REJECTED'].includes(order.status) && (
                                                    <button onClick={() => {
                                                        if (confirm('Are you sure you want to cancel this wholesale order?')) {
                                                            updateStatus(order.id, 'REJECTED');
                                                        }
                                                    }}
                                                        className="px-3 py-2 bg-red-500/10 text-red-400 rounded text-sm hover:bg-red-500/20 border border-red-500/20">Cancel Order</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
