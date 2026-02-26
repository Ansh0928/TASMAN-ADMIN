'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/account';
    const error = searchParams.get('error');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldError, setFieldError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldError('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (!result?.ok) {
                setFieldError(result?.error || 'Invalid email or password');
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setFieldError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-theme-primary px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-theme-text mb-2">Sign In</h1>
                    <p className="text-theme-text-muted">Access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error === 'CredentialsSignin' && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                            Invalid email or password. Please try again.
                        </div>
                    )}

                    {fieldError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                            {fieldError}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-theme-accent text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-center text-sm text-theme-text-muted">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-theme-accent hover:underline font-semibold">
                        Sign up
                    </Link>
                </div>

                <div className="text-center text-sm text-theme-text-muted">
                    <Link href="/wholesale/apply" className="text-theme-accent hover:underline font-semibold">
                        Apply for wholesale access
                    </Link>
                </div>
            </div>
        </div>
    );
}
