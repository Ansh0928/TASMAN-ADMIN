'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldError, setFieldError] = useState('');

    if (!token) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
                <div className="w-full max-w-sm space-y-6 text-center">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        Invalid reset link. Please request a new one.
                    </div>
                    <Link href="/auth/forgot-password" className="text-sm text-theme-accent hover:underline">
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldError('');
        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password.length < 8) {
            setFieldError('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setFieldError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setFieldError(data.message);
                toast.error(data.message);
                return;
            }

            toast.success('Password reset successfully! Please sign in.');
            router.push('/auth/login');
        } catch {
            setFieldError('Something went wrong. Please try again.');
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-theme-text">Set New Password</h1>
                    <p className="text-theme-text-muted mt-1 text-sm">
                        Choose a new password for your account
                    </p>
                </div>

                {fieldError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {fieldError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-1.5">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            minLength={8}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-text mb-1.5">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            minLength={8}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-theme-accent text-white py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-center text-sm text-theme-text-muted">
                    <Link href="/auth/login" className="text-theme-accent hover:underline">
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
