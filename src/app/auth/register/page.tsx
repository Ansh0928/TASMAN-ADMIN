'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { GoogleIcon } from '@/components/GoogleIcon';
import { toast } from 'sonner';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const phone = formData.get('phone') as string;

        if (password !== confirmPassword) { setError('Passwords do not match'); toast.error('Passwords do not match'); setIsLoading(false); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); toast.error('Password must be at least 8 characters'); setIsLoading(false); return; }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone: phone || undefined }),
            });
            if (!response.ok) {
                const data = await response.json();
                const msg = data.message || 'Failed to create account';
                setError(msg);
                toast.error(msg);
                return;
            }
            setSuccess(true);
            toast.success('Account created successfully!');
            const result = await signIn('credentials', { email, password, redirect: false });
            if (result?.ok) { router.push('/'); router.refresh(); }
            else { router.push('/auth/login?message=Account created. Please sign in.'); }
        } catch {
            setError('An error occurred. Please try again.');
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = () => { setIsGoogleLoading(true); signIn('google', { callbackUrl: '/' }); };
    const busy = isLoading || isGoogleLoading;

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-theme-text">Create Account</h1>
                    <p className="text-theme-text-muted mt-1 text-sm">Sign up to shop and checkout faster</p>
                </div>

                {success ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                        Account created! Signing you in...
                    </div>
                ) : (
                    <>
                        <button onClick={handleGoogle} disabled={busy}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text font-medium hover:border-theme-accent transition-colors disabled:opacity-50">
                            <GoogleIcon />
                            {isGoogleLoading ? 'Redirecting...' : 'Sign up with Google'}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-theme-border" /></div>
                            <div className="relative flex justify-center text-xs"><span className="px-3 bg-theme-primary text-theme-text-muted">or</span></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
                            )}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-theme-text mb-1.5">Full Name</label>
                                <input type="text" id="name" name="name" required disabled={busy}
                                    className="w-full px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent transition-colors disabled:opacity-50"
                                    placeholder="John Doe" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-1.5">Email</label>
                                <input type="email" id="email" name="email" required disabled={busy}
                                    className="w-full px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent transition-colors disabled:opacity-50"
                                    placeholder="you@example.com" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-theme-text mb-1.5">Phone <span className="text-theme-text-muted">(optional)</span></label>
                                <input type="tel" id="phone" name="phone" disabled={busy}
                                    className="w-full px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent transition-colors disabled:opacity-50"
                                    placeholder="+61 7 5555 0000" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-1.5">Password</label>
                                <input type="password" id="password" name="password" required disabled={busy}
                                    className="w-full px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent transition-colors disabled:opacity-50"
                                    placeholder="Min. 8 characters" />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-text mb-1.5">Confirm Password</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required disabled={busy}
                                    className="w-full px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent transition-colors disabled:opacity-50"
                                    placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={busy}
                                className="w-full bg-theme-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-colors transition-opacity">
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>
                    </>
                )}

                <p className="text-center text-sm text-theme-text-muted">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-theme-accent hover:underline font-semibold">Sign in</Link>
                </p>

                <div className="pt-4 border-t border-theme-border">
                    <Link href="/wholesale/apply" className="block text-center text-xs text-theme-text-muted hover:text-theme-accent transition-colors">
                        Are you a business? Apply for wholesale access &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
