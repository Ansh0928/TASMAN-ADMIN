'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'Our Business' },
    { href: '/about', label: 'About Us' },
    { href: '/our-partner', label: 'Our Partner' },
    { href: '/our-products', label: 'Our Products' },
    { href: '/deals', label: 'Deals' },
];

export default function MobileMenu() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

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
                className={`fixed top-0 right-0 h-full w-72 bg-[#0A192F] z-[9999] transition-transform duration-300 ease-in-out lg:hidden ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
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
                </nav>
            </div>
        </>
    );
}
