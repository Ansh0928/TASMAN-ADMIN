'use client';

import { Menu } from 'lucide-react';

export default function MobileMenuTrigger() {
    return (
        <button
            onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full bg-theme-toggle border border-theme-toggle-border text-theme-secondary"
            aria-label="Open menu"
        >
            <Menu size={20} />
        </button>
    );
}
