'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Truck, Store, ExternalLink, AlertTriangle, StickyNote, Download } from 'lucide-react';

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
    subtotal: string;
    deliveryFee: string;
    tax: string;
    discountCode: string | null;
    discountAmount: string;
    notes: string | null;
    stripePaymentIntent: string | null;
    stripeInvoiceUrl: string | null;
    refundStatus: string;
    refundedAmount: string;
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

const REFUND_COLORS: Record<string, string> = {
    PARTIAL: 'bg-orange-500/20 text-orange-400',
    FULL: 'bg-red-500/20 text-red-400',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Refund UI state
    const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('requested_by_customer');
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundError, setRefundError] = useState('');
    const [refundSuccess, setRefundSuccess] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (statusFilter !== 'ALL') params.set('status', statusFilter);
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
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
    }, [page, statusFilter, debouncedSearch, dateFrom, dateTo]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

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

    const handleRefund = async (orderId: string, fullRefund: boolean) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const maxRefundable = parseFloat(order.total) - parseFloat(order.refundedAmount);
        const amount = fullRefund ? maxRefundable : parseFloat(refundAmount);

        if (!fullRefund && (isNaN(amount) || amount <= 0 || amount > maxRefundable)) {
            setRefundError(`Amount must be between $0.01 and $${maxRefundable.toFixed(2)}`);
            return;
        }

        if (!confirm(`Are you sure you want to refund $${amount.toFixed(2)}?`)) return;

        setRefundLoading(true);
        setRefundError('');
        setRefundSuccess('');

        try {
            const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: fullRefund ? undefined : amount,
                    reason: refundReason,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setRefundSuccess(`Refunded $${data.refundAmount.toFixed(2)} successfully`);
                setRefundOrderId(null);
                setRefundAmount('');
                fetchOrders(); // Refresh to show updated status
            } else {
                setRefundError(data.message || 'Failed to process refund');
            }
        } catch {
            setRefundError('Failed to process refund');
        } finally {
            setRefundLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-theme-text">Orders</h2>
                <button
                    onClick={() => {
                        const params = new URLSearchParams();
                        if (statusFilter !== 'ALL') params.set('status', statusFilter);
                        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
                        if (dateFrom) params.set('dateFrom', dateFrom);
                        if (dateTo) params.set('dateTo', dateTo);
                        window.open(`/api/admin/orders/export?${params}`, '_blank');
                    }}
                    className="px-3 py-1.5 text-sm bg-theme-secondary border border-theme-border rounded-lg text-theme-text hover:border-theme-accent transition-colors flex items-center gap-1.5"
                >
                    <Download size={14} />
                    Export CSV
                </button>
            </div>

            {/* Search & Date Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by order ID, name, or email..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-sm focus:outline-none focus:border-theme-accent" />
                    <span className="text-theme-text-muted self-center text-sm">to</span>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-sm focus:outline-none focus:border-theme-accent" />
                </div>
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

            {/* Refund Success Message */}
            {refundSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 text-emerald-400 text-sm flex justify-between items-center">
                    <span>{refundSuccess}</span>
                    <button onClick={() => setRefundSuccess('')} className="text-emerald-400 hover:text-emerald-300">&times;</button>
                </div>
            )}

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
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-theme-text font-mono text-sm">#{order.id.slice(-8)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                                                {order.status}
                                            </span>
                                            {order.refundStatus !== 'NONE' && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${REFUND_COLORS[order.refundStatus] || ''}`}>
                                                    {order.refundStatus === 'PARTIAL' ? 'Partial Refund' : 'Refunded'}
                                                </span>
                                            )}
                                            {order.fulfillment === 'DELIVERY' ? (
                                                <Truck size={14} className="text-theme-text-muted" />
                                            ) : (
                                                <Store size={14} className="text-theme-text-muted" />
                                            )}
                                            {order.notes && <StickyNote size={14} className="text-yellow-400" />}
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

                                    {/* Delivery Notes */}
                                    {order.notes && (
                                        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                            <p className="text-yellow-400 text-sm font-medium flex items-center gap-1.5">
                                                <StickyNote size={14} />
                                                Delivery Notes
                                            </p>
                                            <p className="text-theme-text text-sm mt-1">{order.notes}</p>
                                        </div>
                                    )}

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

                                    {/* Payment Breakdown */}
                                    <div className="mt-4 pt-4 border-t border-theme-border">
                                        <h4 className="text-theme-text font-semibold text-sm mb-2">Payment Details</h4>
                                        <div className="grid grid-cols-2 gap-1 text-sm max-w-xs">
                                            <span className="text-theme-text-muted">Subtotal</span>
                                            <span className="text-theme-text text-right">${parseFloat(order.subtotal).toFixed(2)}</span>
                                            {parseFloat(order.discountAmount) > 0 && (
                                                <>
                                                    <span className="text-emerald-400">Discount{order.discountCode ? ` (${order.discountCode})` : ''}</span>
                                                    <span className="text-emerald-400 text-right">-${parseFloat(order.discountAmount).toFixed(2)}</span>
                                                </>
                                            )}
                                            <span className="text-theme-text-muted">Delivery</span>
                                            <span className="text-theme-text text-right">${parseFloat(order.deliveryFee).toFixed(2)}</span>
                                            <span className="text-theme-text-muted">GST</span>
                                            <span className="text-theme-text text-right">${parseFloat(order.tax).toFixed(2)}</span>
                                            <span className="text-theme-text font-bold">Total</span>
                                            <span className="text-theme-accent font-bold text-right">${parseFloat(order.total).toFixed(2)}</span>
                                            {parseFloat(order.refundedAmount) > 0 && (
                                                <>
                                                    <span className="text-red-400">Refunded</span>
                                                    <span className="text-red-400 text-right">-${parseFloat(order.refundedAmount).toFixed(2)}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Payment Intent & Invoice */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {order.stripePaymentIntent && (
                                                <span className="text-xs text-theme-text-muted bg-theme-primary px-2 py-1 rounded font-mono">
                                                    {order.stripePaymentIntent}
                                                </span>
                                            )}
                                            {order.stripeInvoiceUrl && (
                                                <a
                                                    href={order.stripeInvoiceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-theme-accent hover:underline flex items-center gap-1"
                                                >
                                                    View Invoice <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Refund Controls */}
                                    {order.stripePaymentIntent && order.refundStatus !== 'FULL' && (
                                        <div className="mt-4 pt-4 border-t border-theme-border">
                                            <h4 className="text-theme-text font-semibold text-sm mb-2 flex items-center gap-1.5">
                                                <AlertTriangle size={14} className="text-theme-accent" />
                                                Refund
                                            </h4>
                                            {refundOrderId === order.id ? (
                                                <div className="space-y-3">
                                                    <div className="flex gap-2 items-end flex-wrap">
                                                        <div>
                                                            <label className="block text-xs text-theme-text-muted mb-1">Amount (AUD)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                max={(parseFloat(order.total) - parseFloat(order.refundedAmount)).toFixed(2)}
                                                                value={refundAmount}
                                                                onChange={(e) => setRefundAmount(e.target.value)}
                                                                placeholder={(parseFloat(order.total) - parseFloat(order.refundedAmount)).toFixed(2)}
                                                                className="px-2 py-1 w-28 text-sm bg-theme-primary border border-theme-border rounded text-theme-text focus:border-theme-accent focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-theme-text-muted mb-1">Reason</label>
                                                            <select
                                                                value={refundReason}
                                                                onChange={(e) => setRefundReason(e.target.value)}
                                                                className="px-2 py-1 text-sm bg-theme-primary border border-theme-border rounded text-theme-text focus:border-theme-accent focus:outline-none"
                                                            >
                                                                <option value="requested_by_customer">Customer Request</option>
                                                                <option value="duplicate">Duplicate</option>
                                                                <option value="fraudulent">Fraudulent</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {refundError && (
                                                        <p className="text-red-400 text-xs">{refundError}</p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRefund(order.id, false)}
                                                            disabled={refundLoading}
                                                            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                                        >
                                                            {refundLoading ? 'Processing...' : 'Partial Refund'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRefund(order.id, true)}
                                                            disabled={refundLoading}
                                                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                                                        >
                                                            {refundLoading ? 'Processing...' : 'Full Refund'}
                                                        </button>
                                                        <button
                                                            onClick={() => { setRefundOrderId(null); setRefundError(''); }}
                                                            className="px-3 py-1 text-sm text-theme-text-muted hover:text-theme-text transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setRefundOrderId(order.id); setRefundAmount(''); setRefundError(''); }}
                                                    className="px-3 py-1 text-sm bg-theme-primary border border-theme-border rounded text-theme-text hover:border-red-500 hover:text-red-400 transition-colors"
                                                >
                                                    Process Refund
                                                </button>
                                            )}
                                        </div>
                                    )}
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
