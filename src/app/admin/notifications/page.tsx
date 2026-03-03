'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    recipient: string;
    category: string | null;
    status: string;
    sentAt: string;
    order: { id: string } | null;
    user: { name: string | null; email: string | null } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const TYPE_OPTIONS = ['ALL', 'EMAIL', 'SMS', 'PUSH'] as const;
const STATUS_OPTIONS = ['ALL', 'SENT', 'FAILED'] as const;

const TYPE_ICON: Record<string, React.ReactNode> = {
    EMAIL: <Mail size={14} />,
    SMS: <MessageSquare size={14} />,
    PUSH: <Bell size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
    EMAIL: 'bg-blue-500/20 text-blue-400',
    SMS: 'bg-green-500/20 text-green-400',
    PUSH: 'bg-purple-500/20 text-purple-400',
};

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const fetchNotifications = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (typeFilter !== 'ALL') params.set('type', typeFilter);
            if (statusFilter !== 'ALL') params.set('status', statusFilter);

            const res = await fetch(`/api/admin/notifications?${params}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, statusFilter]);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    return (
        <>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-theme-text mb-2">Notification History</h2>
                <p className="text-theme-text-muted">All emails, SMS, and push notifications sent by the system</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div>
                    <p className="text-theme-text-muted text-xs mb-1.5 uppercase tracking-wide">Type</p>
                    <div className="flex gap-1">
                        {TYPE_OPTIONS.map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    typeFilter === t
                                        ? 'bg-theme-accent text-white'
                                        : 'bg-theme-secondary text-theme-text-muted hover:text-theme-text border border-theme-border'
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-theme-text-muted text-xs mb-1.5 uppercase tracking-wide">Status</p>
                    <div className="flex gap-1">
                        {STATUS_OPTIONS.map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === s
                                        ? 'bg-theme-accent text-white'
                                        : 'bg-theme-secondary text-theme-text-muted hover:text-theme-text border border-theme-border'
                                }`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-theme-text-muted">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center text-theme-text-muted">No notifications found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-theme-border text-theme-text-muted text-left">
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Recipient</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Order</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map(n => (
                                    <tr key={n.id} className="border-b border-theme-border/50 hover:bg-theme-primary/50 transition-colors">
                                        <td className="px-4 py-3 text-theme-text-muted whitespace-nowrap">
                                            {new Date(n.sentAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            {' '}
                                            <span className="text-theme-text-muted/60">
                                                {new Date(n.sentAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[n.type] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {TYPE_ICON[n.type]}
                                                {n.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-theme-text max-w-[200px] truncate">{n.recipient}</td>
                                        <td className="px-4 py-3 text-theme-text-muted">
                                            {n.category ? n.category.replace(/_/g, ' ') : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                n.status === 'SENT'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {n.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {n.order ? (
                                                <Link href={`/admin/orders`} className="text-theme-accent hover:underline text-xs font-mono">
                                                    {n.order.id.slice(-8).toUpperCase()}
                                                </Link>
                                            ) : (
                                                <span className="text-theme-text-muted">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-theme-text-muted text-sm">
                        Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex gap-1">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => fetchNotifications(pagination.page - 1)}
                            className="p-2 rounded-lg bg-theme-secondary border border-theme-border text-theme-text-muted hover:text-theme-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => fetchNotifications(pagination.page + 1)}
                            className="p-2 rounded-lg bg-theme-secondary border border-theme-border text-theme-text-muted hover:text-theme-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
