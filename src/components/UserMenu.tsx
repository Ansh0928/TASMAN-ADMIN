'use client';

import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import { useState } from 'react';

interface UserMenuProps {
    user?: {
        name?: string | null;
        email?: string | null;
        role?: string;
    } | null;
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href="/auth/login"
                    className="px-4 py-2 text-theme-text hover:text-theme-accent transition-colors"
                >
                    Sign In
                </Link>
                <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    Sign Up
                </Link>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-theme-secondary transition-colors"
            >
                <div className="text-sm font-medium text-theme-text">{user.name || user.email}</div>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-theme-secondary border border-theme-border rounded-lg shadow-lg z-50">
                    <Link
                        href="/account"
                        className="block px-4 py-2 text-theme-text hover:bg-theme-primary hover:text-theme-accent transition-colors first:rounded-t-lg"
                    >
                        My Account
                    </Link>
                    <Link
                        href="/account/orders"
                        className="block px-4 py-2 text-theme-text hover:bg-theme-primary hover:text-theme-accent transition-colors"
                    >
                        My Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                        <Link
                            href="/admin"
                            className="block px-4 py-2 text-theme-text hover:bg-theme-primary hover:text-theme-accent transition-colors"
                        >
                            Admin Dashboard
                        </Link>
                    )}
                    {user.role === 'WHOLESALE' && (
                        <Link
                            href="/wholesale/prices"
                            className="block px-4 py-2 text-theme-text hover:bg-theme-primary hover:text-theme-accent transition-colors"
                        >
                            Wholesale Prices
                        </Link>
                    )}
                    <button
                        onClick={async () => {
                            setIsOpen(false);
                            await logout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-theme-primary transition-colors last:rounded-b-lg"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
