'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, DollarSign, ArrowLeft } from 'lucide-react';

const adminNav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/wholesale', label: 'Wholesale', icon: DollarSign },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-theme-primary">
            {/* Admin Top Bar */}
            <div className="bg-theme-secondary border-b border-theme-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-theme-text-muted hover:text-theme-text transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 className="text-lg font-bold text-theme-accent">Admin Panel</h1>
                        </div>
                        <nav className="flex items-center gap-1">
                            {adminNav.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/admin' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-theme-accent/10 text-theme-accent'
                                                : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-primary'
                                        }`}
                                    >
                                        <item.icon size={16} />
                                        <span className="hidden md:inline">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>
            {/* Page Content */}
            <div className="container mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    );
}
