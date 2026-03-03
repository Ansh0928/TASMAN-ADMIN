'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.get('email') }),
            });
            const data = await res.json();
            toast.success(data.message);
            setSubmitted(true);
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-theme-text">Reset Password</h1>
                    <p className="text-theme-text-muted mt-1 text-sm">
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>

                {submitted ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                            Check your email for a reset link. It may take a minute to arrive.
                        </div>
                        <Link
                            href="/auth/login"
                            className="block text-center text-sm text-theme-accent hover:underline"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-theme-accent text-white py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-theme-text-muted">
                            <Link href="/auth/login" className="text-theme-accent hover:underline">
                                Back to Sign In
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
