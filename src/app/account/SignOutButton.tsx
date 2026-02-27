'use client';

import { logout } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
    return (
        <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
        >
            <LogOut size={16} />
            Sign Out
        </button>
    );
}
