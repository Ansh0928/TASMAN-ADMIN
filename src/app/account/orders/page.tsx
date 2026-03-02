'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderProduct {
    name: string;
    slug: string;
    imageUrls: string[];
}

interface OrderItem {
    id: string;
    quantity: number;
    unitPrice: string;
    total: string;
    product: OrderProduct;
}

interface Order {
    id: string;
    status: string;
    fulfillment: string;
    subtotal: string;
    deliveryFee: string;
    tax: string;
    total: string;
    itemCount: number;
    items: OrderItem[];
    stripeInvoiceUrl: string | null;
    createdAt: string;
}

interface OrdersResponse {
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
}

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
    PENDING: {
        label: 'Pending',
        classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    },
    CONFIRMED: {
        label: 'Confirmed',
        classes: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    },
    PREPARING: {
        label: 'Preparing',
        classes: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    },
    READY: {
        label: 'Ready',
        classes: 'bg-green-500/15 text-green-400 border-green-500/20',
    },
    DELIVERED: {
        label: 'Delivered',
        classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    },
    CANCELLED: {
        label: 'Cancelled',
        classes: 'bg-red-500/15 text-red-400 border-red-500/20',
    },
};

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function shortOrderId(id: string): string {
    return id.slice(-8).toUpperCase();
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const limit = 10;

    const fetchOrders = useCallback(async (pageNum: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/orders?page=${pageNum}&limit=${limit}`);
            if (res.status === 401) {
                window.location.href = '/auth/login?callbackUrl=/account/orders';
                return;
            }
            if (!res.ok) {
                throw new Error('Failed to load orders');
            }
            const data: OrdersResponse = await res.json();
            setOrders(data.orders);
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(page);
    }, [page, fetchOrders]);

    const toggleExpand = (orderId: string) => {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    };

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <Link
                            href="/account"
                            className="text-theme-text-muted hover:text-theme-accent transition-colors text-sm mb-4 inline-flex items-center gap-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to Account
                        </Link>
                        <h1 className="text-4xl font-bold font-serif text-theme-text mt-2">
                            Order History
                        </h1>
                        {!loading && total > 0 && (
                            <p className="text-theme-text-muted mt-1">
                                {total} order{total !== 1 ? 's' : ''} total
                            </p>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-theme-secondary border border-theme-border rounded-xl p-6 animate-pulse"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3 flex-1">
                                            <div className="h-5 bg-theme-border rounded w-32" />
                                            <div className="h-4 bg-theme-border rounded w-48" />
                                        </div>
                                        <div className="h-6 bg-theme-border rounded w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                            <p className="text-red-400 font-medium mb-3">{error}</p>
                            <button
                                onClick={() => fetchOrders(page)}
                                className="px-4 py-2 bg-theme-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && orders.length === 0 && (
                        <div className="bg-theme-secondary border border-theme-border rounded-xl p-12 text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 mx-auto text-theme-text-muted mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                            <h2 className="text-xl font-semibold font-serif text-theme-text mb-2">
                                No orders yet
                            </h2>
                            <p className="text-theme-text-muted mb-6">
                                You haven&apos;t placed any orders. Browse our fresh seafood
                                selection to get started.
                            </p>
                            <Link
                                href="/our-products"
                                className="inline-block px-6 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                                Browse Products
                            </Link>
                        </div>
                    )}

                    {/* Orders List */}
                    {!loading && !error && orders.length > 0 && (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const badge = STATUS_BADGES[order.status] || {
                                    label: order.status,
                                    classes:
                                        'bg-gray-500/15 text-gray-400 border-gray-500/20',
                                };
                                const isExpanded = expandedOrderId === order.id;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-theme-secondary border border-theme-border rounded-xl overflow-hidden transition-colors hover:border-theme-accent/30"
                                    >
                                        {/* Order Summary Row */}
                                        <button
                                            onClick={() => toggleExpand(order.id)}
                                            className="w-full p-6 text-left"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="text-theme-text font-semibold font-serif text-lg">
                                                            #{shortOrderId(order.id)}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-medium px-3 py-1 rounded-full border ${badge.classes}`}
                                                        >
                                                            {badge.label}
                                                        </span>
                                                        <span className="text-xs text-theme-text-muted px-2 py-0.5 rounded bg-theme-primary border border-theme-border">
                                                            {order.fulfillment === 'DELIVERY'
                                                                ? 'Delivery'
                                                                : 'Pickup'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-theme-text-muted">
                                                        <span>
                                                            {formatDate(order.createdAt)} at{' '}
                                                            {formatTime(order.createdAt)}
                                                        </span>
                                                        <span>
                                                            {order.itemCount} item
                                                            {order.itemCount !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-theme-text font-bold text-lg">
                                                        ${parseFloat(order.total).toFixed(2)}
                                                    </span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-5 w-5 text-theme-text-muted transition-transform duration-200 ${
                                                            isExpanded ? 'rotate-180' : ''
                                                        }`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div className="border-t border-theme-border px-6 pb-6">
                                                {/* Order Items */}
                                                <div className="divide-y divide-theme-border">
                                                    {order.items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-4 py-4"
                                                        >
                                                            {/* Product Image */}
                                                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-theme-primary border border-theme-border">
                                                                {item.product.imageUrls.length >
                                                                0 ? (
                                                                    <Image
                                                                        src={
                                                                            item.product
                                                                                .imageUrls[0]
                                                                        }
                                                                        alt={item.product.name}
                                                                        width={64}
                                                                        height={64}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-theme-text-muted">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            className="h-8 w-8"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                            strokeWidth={1}
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Product Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <Link
                                                                    href={`/product/${item.product.slug}`}
                                                                    className="text-theme-text font-medium hover:text-theme-accent transition-colors text-sm line-clamp-1"
                                                                >
                                                                    {item.product.name}
                                                                </Link>
                                                                <p className="text-theme-text-muted text-xs mt-0.5">
                                                                    Qty: {item.quantity} @
                                                                    $
                                                                    {parseFloat(
                                                                        item.unitPrice
                                                                    ).toFixed(2)}{' '}
                                                                    each
                                                                </p>
                                                            </div>

                                                            {/* Item Total */}
                                                            <span className="text-theme-text font-medium text-sm flex-shrink-0">
                                                                $
                                                                {parseFloat(
                                                                    item.total
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Order Totals */}
                                                <div className="mt-4 pt-4 border-t border-theme-border space-y-2 text-sm">
                                                    <div className="flex justify-between text-theme-text-muted">
                                                        <span>Subtotal</span>
                                                        <span>
                                                            $
                                                            {parseFloat(
                                                                order.subtotal
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {parseFloat(order.deliveryFee) > 0 && (
                                                        <div className="flex justify-between text-theme-text-muted">
                                                            <span>Delivery Fee</span>
                                                            <span>
                                                                $
                                                                {parseFloat(
                                                                    order.deliveryFee
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {parseFloat(order.tax) > 0 && (
                                                        <div className="flex justify-between text-theme-text-muted">
                                                            <span>Tax</span>
                                                            <span>
                                                                $
                                                                {parseFloat(
                                                                    order.tax
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-theme-text font-bold pt-2 border-t border-theme-border">
                                                        <span>Total</span>
                                                        <span>
                                                            $
                                                            {parseFloat(order.total).toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Invoice Link */}
                                                {order.stripeInvoiceUrl && (
                                                    <div className="mt-4 pt-4 border-t border-theme-border">
                                                        <a
                                                            href={order.stripeInvoiceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-sm text-theme-accent hover:opacity-80 transition-opacity font-medium"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                            View Invoice
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-theme-border bg-theme-secondary text-theme-text hover:border-theme-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => {
                                        // Show first, last, current, and neighbors
                                        return (
                                            p === 1 ||
                                            p === totalPages ||
                                            Math.abs(p - page) <= 1
                                        );
                                    })
                                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                                        if (i > 0 && p - (arr[i - 1] as number) > 1) {
                                            acc.push('...');
                                        }
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((item, i) =>
                                        item === '...' ? (
                                            <span
                                                key={`ellipsis-${i}`}
                                                className="px-2 text-theme-text-muted"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={item}
                                                onClick={() => setPage(item as number)}
                                                className={`w-10 h-10 text-sm font-medium rounded-lg border transition-colors ${
                                                    page === item
                                                        ? 'bg-theme-accent text-white border-theme-accent'
                                                        : 'border-theme-border bg-theme-secondary text-theme-text hover:border-theme-accent'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}
                            </div>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-theme-border bg-theme-secondary text-theme-text hover:border-theme-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
