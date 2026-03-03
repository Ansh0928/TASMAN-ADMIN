'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp, RotateCcw, AlertTriangle } from 'lucide-react';

interface DailyRevenue {
    date: string;
    revenue: number;
}

interface Stats {
    totalOrders: number;
    confirmedOrders: number;
    totalRevenue: number;
    totalRefunded: number;
    netRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    pendingWholesaleApplications: number;
    dailyRevenue: DailyRevenue[];
    lowStockProducts: number;
    lowStockList: Array<{ id: string; name: string; stockQuantity: number; slug: string }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-theme-text-muted">Loading dashboard...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-theme-text-muted">Failed to load dashboard. Make sure you are logged in as admin.</p>
                <Link href="/auth/login" className="text-theme-accent hover:underline mt-2 inline-block">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-theme-text mb-2">Dashboard</h2>
                <p className="text-theme-text-muted">Overview of your store</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={ShoppingCart} title="Total Orders" value={stats.totalOrders} />
                <StatCard icon={TrendingUp} title="Net Revenue" value={`$${stats.netRevenue.toFixed(2)}`} />
                <StatCard icon={Package} title="Products" value={stats.totalProducts} />
                {stats.totalRefunded > 0 ? (
                    <StatCard icon={RotateCcw} title="Refunded" value={`$${stats.totalRefunded.toFixed(2)}`} highlight />
                ) : (
                    <StatCard icon={Users} title="Pending Wholesale" value={stats.pendingWholesaleApplications}
                        highlight={stats.pendingWholesaleApplications > 0} />
                )}
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockProducts > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Low Stock Alert ({stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''})
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {stats.lowStockList.map(p => (
                            <Link key={p.id} href={`/admin/products/${p.id}/edit`}
                                className="flex justify-between items-center bg-theme-primary rounded-lg px-3 py-2 hover:border-yellow-500 border border-theme-border transition-colors">
                                <span className="text-theme-text text-sm truncate">{p.name}</span>
                                <span className="text-yellow-400 font-bold text-sm shrink-0 ml-2">{p.stockQuantity} left</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Daily Revenue Chart */}
            {stats.dailyRevenue && stats.dailyRevenue.length > 0 && (
                <div className="bg-theme-secondary border border-theme-border rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold text-theme-text mb-4">Revenue (Last 30 Days)</h3>
                    <RevenueChart data={stats.dailyRevenue} />
                </div>
            )}

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickLink href="/admin/products" title="Manage Products" desc="Add, edit, and manage your catalog" />
                <QuickLink href="/admin/orders" title="Manage Orders" desc="View and update order statuses" />
                <QuickLink href="/admin/customers" title="Customers" desc="View customers & wholesale approvals" />
                <QuickLink href="/admin/wholesale" title="Wholesale Prices" desc="Manage wholesale price list" />
            </div>
        </>
    );
}

function StatCard({ icon: Icon, title, value, highlight = false }: any) {
    return (
        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-theme-text-muted text-sm">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${highlight ? 'text-theme-accent' : 'text-theme-text'}`}>
                        {value}
                    </p>
                </div>
                <Icon size={40} className="text-theme-accent/30" />
            </div>
        </div>
    );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
    return (
        <Link
            href={href}
            className="bg-theme-secondary border border-theme-border rounded-lg p-5 hover:border-theme-accent transition-colors"
        >
            <h3 className="text-lg font-bold text-theme-text mb-1">{title}</h3>
            <p className="text-theme-text-muted text-sm">{desc}</p>
        </Link>
    );
}

function RevenueChart({ data }: { data: DailyRevenue[] }) {
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

    return (
        <div className="flex items-end gap-[2px] h-32">
            {data.map((day) => {
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                const date = new Date(day.date + 'T00:00:00');
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                return (
                    <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div
                            className="w-full bg-theme-accent/60 hover:bg-theme-accent rounded-t transition-colors min-h-[2px]"
                            style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-theme-primary border border-theme-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                            <p className="text-theme-text font-bold">${day.revenue.toFixed(2)}</p>
                            <p className="text-theme-text-muted">{label}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
