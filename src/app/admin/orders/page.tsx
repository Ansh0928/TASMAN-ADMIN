'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Truck, Store } from 'lucide-react';

interface OrderItem {
    productName: string;
    quantity: number;
    unitPrice: string;
    total: string;
}

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    status: string;
    fulfillment: string;
    total: string;
    itemCount: number;
    items: OrderItem[];
    createdAt: string;
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    CONFIRMED: 'bg-blue-500/20 text-blue-400',
    PREPARING: 'bg-purple-500/20 text-purple-400',
    READY: 'bg-green-500/20 text-green-400',
    DELIVERED: 'bg-green-600/20 text-green-500',
    CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (statusFilter !== 'ALL') params.set('status', statusFilter);
            const res = await fetch(`/api/admin/orders?${params}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [page, statusFilter]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error('Failed to update order:', err);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-theme-text">Orders</h2>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {STATUS_OPTIONS.map((status) => (
                    <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setPage(1); }}
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

            {loading ? (
                <p className="text-theme-text-muted text-center py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
                <p className="text-theme-text-muted text-center py-8">No orders found.</p>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                            {/* Order Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-theme-primary/30"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-theme-text font-mono text-sm">#{order.id.slice(-8)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                                                {order.status}
                                            </span>
                                            {order.fulfillment === 'DELIVERY' ? (
                                                <Truck size={14} className="text-theme-text-muted" />
                                            ) : (
                                                <Store size={14} className="text-theme-text-muted" />
                                            )}
                                        </div>
                                        <p className="text-theme-text-muted text-sm mt-1">
                                            {order.customerName} &middot; {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-theme-text font-bold">${parseFloat(order.total).toFixed(2)}</p>
                                        <p className="text-theme-text-muted text-xs">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-theme-text-muted" /> : <ChevronDown size={16} className="text-theme-text-muted" />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-theme-border p-4">
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-theme-text-muted text-sm">Customer</p>
                                            <p className="text-theme-text">{order.customerName}</p>
                                            <p className="text-theme-text-muted text-sm">{order.customerEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-theme-text-muted text-sm">Update Status</p>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className="mt-1 px-3 py-1.5 bg-theme-primary border border-theme-border rounded text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                            >
                                                {STATUS_OPTIONS.filter(s => s !== 'ALL').map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-theme-text-muted">
                                                <th className="text-left py-2">Product</th>
                                                <th className="text-center py-2">Qty</th>
                                                <th className="text-right py-2">Price</th>
                                                <th className="text-right py-2">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, i) => (
                                                <tr key={i} className="text-theme-text border-t border-theme-border/30">
                                                    <td className="py-2">{item.productName}</td>
                                                    <td className="py-2 text-center">{item.quantity}</td>
                                                    <td className="py-2 text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
                                                    <td className="py-2 text-right">${parseFloat(item.total).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1 rounded bg-theme-secondary border border-theme-border text-theme-text disabled:opacity-50">
                                Prev
                            </button>
                            <span className="px-3 py-1 text-theme-text-muted">Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1 rounded bg-theme-secondary border border-theme-border text-theme-text disabled:opacity-50">
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
