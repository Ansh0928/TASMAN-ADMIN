'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Shield, Lock } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [fieldError, setFieldError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldError('');
        const formData = new FormData(e.currentTarget);
        try {
            const result = await signIn('credentials', {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                redirect: false,
            });
            if (result?.error || !result?.ok) { setFieldError('Invalid email or password.'); return; }
            router.push('/admin');
            router.refresh();
        } catch {
            setFieldError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = () => { setIsGoogleLoading(true); signIn('google', { callbackUrl: '/admin' }); };
    const busy = isLoading || isGoogleLoading;

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
            <div className="w-full max-w-sm space-y-6">
                {/* Branded Header Bar */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-5 text-center shadow-lg">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                            <Shield size={28} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Team Sign In</h1>
                    <p className="text-red-100 mt-1 text-sm">Tasman Star staff &amp; admin access</p>
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium">
                        <Lock size={12} />
                        Team Access Only
                    </div>
                </div>

                {fieldError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {fieldError}
                    </div>
                )}

                {/* Google */}
                <button onClick={handleGoogle} disabled={busy}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text font-medium hover:border-red-400 transition-colors disabled:opacity-50">
                    <GoogleIcon />
                    {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-theme-border" /></div>
                    <div className="relative flex justify-center text-xs"><span className="px-3 bg-theme-primary text-theme-text-muted">or</span></div>
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-1.5">Email</label>
                        <input type="email" id="email" name="email" required disabled={busy}
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-red-400 disabled:opacity-50"
                            placeholder="you@tasmanstar.com.au" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-1.5">Password</label>
                        <input type="password" id="password" name="password" required disabled={busy}
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-red-400 disabled:opacity-50"
                            placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={busy}
                        className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="bg-theme-secondary/50 border border-theme-border rounded-lg p-4 text-xs text-theme-text-muted text-center">
                    This page is for Tasman Star team members only. If you&apos;re a customer, <Link href="/auth/login" className="text-theme-accent hover:underline font-semibold">sign in here</Link>.
                </div>

                {/* Back */}
                <div className="pt-4 border-t border-theme-border">
                    <Link href="/auth/login" className="block text-center text-xs text-theme-text-muted hover:text-theme-accent transition-colors">
                        &larr; Back to customer sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
