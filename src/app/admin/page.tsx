'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    pendingWholesaleApplications: number;
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
                <StatCard icon={TrendingUp} title="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
                <StatCard icon={Package} title="Products" value={stats.totalProducts} />
                <StatCard icon={Users} title="Pending Wholesale" value={stats.pendingWholesaleApplications}
                    highlight={stats.pendingWholesaleApplications > 0} />
            </div>

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
