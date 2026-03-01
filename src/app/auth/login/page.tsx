'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Building2 } from 'lucide-react';

export default function CustomerLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');
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
            if (!result?.ok) { setFieldError(result?.error || 'Invalid email or password'); return; }
            router.push(callbackUrl);
            router.refresh();
        } catch {
            setFieldError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = () => { setIsGoogleLoading(true); signIn('google', { callbackUrl }); };
    const busy = isLoading || isGoogleLoading;

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-theme-text">Welcome back</h1>
                    <p className="text-theme-text-muted mt-1 text-sm">Sign in to your customer account</p>
                </div>

                {(error || fieldError) && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error === 'OAuthAccountNotLinked'
                            ? 'This email uses a different sign-in method.'
                            : fieldError || 'Invalid email or password.'}
                    </div>
                )}

                <button onClick={handleGoogle} disabled={busy}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text font-medium hover:border-theme-accent transition-colors disabled:opacity-50">
                    <GoogleIcon />
                    {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-theme-border" /></div>
                    <div className="relative flex justify-center text-xs"><span className="px-3 bg-theme-primary text-theme-text-muted">or</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-1.5">Email</label>
                        <input type="email" id="email" name="email" required disabled={busy}
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                            placeholder="you@example.com" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-1.5">Password</label>
                        <input type="password" id="password" name="password" required disabled={busy}
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                            placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={busy}
                        className="w-full bg-theme-accent text-white py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-theme-text-muted">
                    New here?{' '}
                    <Link href="/auth/register" className="text-theme-accent hover:underline font-semibold">Create an account</Link>
                </p>

                <Link
                    href="/wholesale/login"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-theme-border bg-theme-secondary text-theme-text hover:border-theme-accent transition-colors text-sm font-medium"
                >
                    <Building2 size={16} className="text-theme-accent" />
                    Are you a wholesale partner? Sign in here
                </Link>

                <div className="pt-4 border-t border-theme-border">
                    <Link href="/admin/login" className="block text-center text-xs text-theme-text-muted hover:text-theme-accent transition-colors">
                        Team member? Sign in here &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
