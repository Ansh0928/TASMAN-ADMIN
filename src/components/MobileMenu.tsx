'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, LogIn, UserPlus, User, LogOut, Building2, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { logout } from '@/app/actions/auth';
import { NAV_LINKS } from '@/lib/nav-links';

interface MobileMenuProps {
    user?: {
        name?: string | null;
        email?: string | null;
        role?: string;
        image?: string | null;
        wholesaleStatus?: string | null;
    } | null;
}

export function MobileMenuTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full bg-theme-toggle border border-theme-toggle-border text-theme-secondary"
            aria-label="Open menu"
        >
            <Menu size={20} />
        </button>
    );
}

export default function MobileMenu({ user }: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Listen for custom event from trigger button
    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener('open-mobile-menu', handler);
        return () => window.removeEventListener('open-mobile-menu', handler);
    }, []);

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-[70] bg-black/50 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-72 bg-theme-header z-[71] transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <span className="text-white font-serif font-bold text-lg">Menu</span>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const trimmed = searchQuery.trim();
                        if (!trimmed) return;
                        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
                        setSearchQuery('');
                        setOpen(false);
                    }}
                    className="px-6 pt-4"
                >
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search seafood..."
                            className="w-full bg-white/10 text-white placeholder-slate-400 text-sm rounded-xl py-3 pl-10 pr-4 border border-white/10 focus:outline-none focus:border-theme-accent"
                        />
                    </div>
                </form>

                {/* Navigation Links */}
                <nav className="flex flex-col p-6 gap-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`py-3 px-4 rounded-xl text-base font-medium transition-colors ${
                                    isActive
                                        ? 'bg-theme-accent/10 text-theme-accent'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {link.label}
                                {link.label === 'Deals' && (
                                    <span className="ml-2 w-2 h-2 rounded-full bg-theme-accent animate-pulse inline-block" />
                                )}
                            </Link>
                        );
                    })}
                    {user?.role === 'WHOLESALE' && user?.wholesaleStatus === 'APPROVED' && (
                        <Link
                            href="/wholesale/prices"
                            className={`py-3 px-4 rounded-xl text-base font-medium transition-colors flex items-center gap-3 ${
                                pathname === '/wholesale/prices'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'text-blue-400 hover:bg-blue-500/10'
                            }`}
                        >
                            <Building2 size={18} />
                            Wholesale Prices
                        </Link>
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
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-theme-accent text-white font-semibold hover:bg-theme-accent/90 active:bg-theme-accent/80 transition-colors"
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
