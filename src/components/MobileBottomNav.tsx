'use client';

import { Home, Tag, Fish, User, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const BOTTOM_NAV = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/our-products', label: 'Shop', icon: Fish },
    { href: '/deals', label: 'Deals', icon: Tag },
    { href: '/account', label: 'Account', icon: User },
    { href: '/search', label: 'Search', icon: Search },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-theme-header/95 backdrop-blur-md border-t border-theme-accent/20 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-1">
                {BOTTOM_NAV.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[52px] rounded-lg transition-colors ${
                                isActive
                                    ? 'text-theme-accent'
                                    : 'text-theme-text-muted hover:text-theme-text'
                            }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
