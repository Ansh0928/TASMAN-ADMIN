'use client';

import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShoppingBag, Building2, LayoutDashboard, ChevronDown } from 'lucide-react';

interface UserMenuProps {
    user?: {
        name?: string | null;
        email?: string | null;
        role?: string;
        image?: string | null;
    } | null;
}

function getRoleBadge(role?: string) {
    switch (role) {
        case 'ADMIN':
            return { label: 'Admin', color: 'bg-red-500/15 text-red-400 border-red-500/20' };
        case 'WHOLESALE':
            return { label: 'Wholesale', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' };
        default:
            return { label: 'Customer', color: 'bg-green-500/15 text-green-400 border-green-500/20' };
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-theme-text hover:text-theme-accent transition-colors"
                >
                    Sign In
                </Link>
                <Link
                    href="/auth/register"
                    className="px-4 py-2 text-sm font-medium bg-theme-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    Sign Up
                </Link>
            </div>
        );
    }

    const badge = getRoleBadge(user.role);
    const initials = (user.name || user.email || '?')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-theme-secondary transition-colors"
            >
                {/* Avatar */}
                {user.image ? (
                    <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent text-xs font-bold">
                        {initials}
                    </div>
                )}
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-theme-text leading-tight">{user.name || 'Account'}</div>
                    <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border inline-block leading-tight ${badge.color}`}>
                        {badge.label}
                    </div>
                </div>
                <ChevronDown size={14} className={`text-theme-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-theme-secondary border border-theme-border rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-theme-border">
                        <p className="text-sm font-semibold text-theme-text truncate">{user.name}</p>
                        <p className="text-xs text-theme-text-muted truncate">{user.email}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-block mt-1.5 ${badge.color}`}>
                            {badge.label}
                        </span>
                    </div>

                    {/* Navigation links */}
                    <div className="py-1">
                        <Link
                            href="/account"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-theme-text hover:bg-theme-primary transition-colors"
                        >
                            <User size={16} className="text-theme-text-muted" />
                            My Account
                        </Link>

                        {(user.role === 'CUSTOMER' || user.role === 'ADMIN') && (
                            <Link
                                href="/account/orders"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-theme-text hover:bg-theme-primary transition-colors"
                            >
                                <ShoppingBag size={16} className="text-theme-text-muted" />
                                My Orders
                            </Link>
                        )}

                        {user.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-theme-text hover:bg-theme-primary transition-colors"
                            >
                                <LayoutDashboard size={16} className="text-theme-text-muted" />
                                Admin Dashboard
                            </Link>
                        )}

                        {user.role === 'WHOLESALE' && (
                            <Link
                                href="/wholesale/prices"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-theme-text hover:bg-theme-primary transition-colors"
                            >
                                <Building2 size={16} className="text-theme-text-muted" />
                                Wholesale Prices
                            </Link>
                        )}
                    </div>

                    {/* Sign out — always visible, separated */}
                    <div className="border-t border-theme-border py-1">
                        <button
                            onClick={async () => {
                                setIsOpen(false);
                                await logout();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
