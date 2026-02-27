'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, LogIn, UserPlus, User, LogOut, Building2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { logout } from '@/app/actions/auth';

const NAV_LINKS = [
    { href: '/', label: 'Our Business' },
    { href: '/about', label: 'About Us' },
    { href: '/our-partner', label: 'Our Partner' },
    { href: '/our-products', label: 'Our Products' },
    { href: '/deals', label: 'Deals' },
];

interface MobileMenuProps {
    user?: {
        name?: string | null;
        email?: string | null;
        role?: string;
        image?: string | null;
        wholesaleStatus?: string | null;
    } | null;
}

export default function MobileMenu({ user }: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden fixed top-5 right-4 z-[60] flex items-center justify-center w-10 h-10 rounded-full bg-theme-toggle border border-theme-toggle-border text-theme-secondary"
                aria-label="Open menu"
                style={{ display: open ? 'none' : undefined }}
            >
                <Menu size={20} />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[9998] bg-black/50 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-72 bg-[#0A192F] z-[9999] transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <span className="text-white font-serif font-bold text-lg">Menu</span>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col p-6 gap-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`py-3 px-4 rounded-xl text-base font-medium transition-colors ${
                                    isActive
                                        ? 'bg-[#FF8543]/10 text-[#FF8543]'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {link.label}
                                {link.label === 'Deals' && (
                                    <span className="ml-2 w-2 h-2 rounded-full bg-[#FF7F50] animate-pulse inline-block" />
                                )}
                            </a>
                        );
                    })}
                    {user?.role === 'WHOLESALE' && user?.wholesaleStatus === 'APPROVED' && (
                        <a
                            href="/wholesale/prices"
                            className={`py-3 px-4 rounded-xl text-base font-medium transition-colors flex items-center gap-3 ${
                                pathname === '/wholesale/prices'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'text-blue-400 hover:bg-blue-500/10'
                            }`}
                        >
                            <Building2 size={18} />
                            Wholesale Prices
                        </a>
                    )}
                </nav>

                {/* Bottom section — pushed to bottom */}
                <div className="mt-auto border-t border-white/10 p-6 space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-400" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    {/* Auth Section */}
                    <div className="border-t border-white/10 pt-4 mt-2">
                        {!user ? (
                            <div className="flex flex-col gap-2">
                                <a
                                    href="/auth/login"
                                    className="flex items-center gap-3 py-3 px-4 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <LogIn size={18} />
                                    Sign In
                                </a>
                                <a
                                    href="/auth/register"
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF8543] text-white font-semibold hover:bg-[#E2743A] transition-colors"
                                >
                                    <UserPlus size={18} />
                                    Sign Up
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="px-4 pb-2">
                                    <p className="text-white font-semibold text-sm">{user.name || 'Account'}</p>
                                    <p className="text-slate-400 text-xs truncate">{user.email}</p>
                                </div>
                                <a
                                    href="/account"
                                    className="flex items-center gap-3 py-3 px-4 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <User size={18} />
                                    My Account
                                </a>
                                <button
                                    onClick={async () => { setOpen(false); await logout(); }}
                                    className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
