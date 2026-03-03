'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Package, ShoppingCart, Users, DollarSign, ArrowLeft, ShieldAlert, ClipboardList, Menu, X, FolderOpen, Bell, Tag } from 'lucide-react';

const adminNav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/wholesale', label: 'Wholesale', icon: DollarSign },
    { href: '/admin/wholesale-orders', label: 'WS Orders', icon: ClipboardList },
    { href: '/admin/coupons', label: 'Coupons', icon: Tag },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Admin login page renders without the admin layout shell
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-[100dvh] bg-theme-primary flex items-center justify-center">
                <p className="text-theme-text-muted">Loading...</p>
            </div>
        );
    }

    // Not logged in — redirect to login
    if (status === 'unauthenticated') {
        router.push('/admin/login');
        return null;
    }

    // Not an admin — show access denied
    const userRole = (session?.user as any)?.role;
    if (userRole !== 'ADMIN') {
        return (
            <div className="min-h-[100dvh] bg-theme-primary flex items-center justify-center px-4">
                <div className="bg-theme-secondary border border-theme-border rounded-lg p-8 text-center space-y-6 max-w-md">
                    <div className="flex justify-center">
                        <ShieldAlert size={64} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-theme-text mb-2">Access Denied</h1>
                        <p className="text-theme-text-muted">
                            You don&apos;t have permission to access the admin panel. This area is restricted to administrators only.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-block px-6 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

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

                        {/* Mobile hamburger toggle */}
                        <button
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                            className="md:hidden p-2 text-theme-text-muted hover:text-theme-text transition-colors"
                            aria-label="Toggle admin navigation"
                        >
                            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-1">
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
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Mobile nav dropdown */}
                    {mobileNavOpen && (
                        <nav className="md:hidden pb-3 border-t border-theme-border mt-1 pt-3">
                            <div className="grid grid-cols-2 gap-1">
                                {adminNav.map((item) => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/admin' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileNavOpen(false)}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-theme-accent/10 text-theme-accent'
                                                    : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-primary'
                                            }`}
                                        >
                                            <item.icon size={16} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    )}
                </div>
            </div>
            {/* Page Content */}
            <div className="container mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    );
}
