'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import bcrypt from 'bcryptjs';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
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

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    passwordHash: hashedPassword,
                    phone: phone || undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Failed to create account');
                return;
            }

            setSuccess(true);

            // Auto sign in
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.ok) {
                router.push('/account');
                router.refresh();
            } else {
                // Redirect to login if auto-signin fails
                router.push('/auth/login?message=Account created. Please sign in.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-theme-primary px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-theme-text mb-2">Create Account</h1>
                    <p className="text-theme-text-muted">Join Tasman Star for faster checkout</p>
                </div>

                {success ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded text-green-500">
                        Account created successfully! You're being signed in...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-theme-text mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                                placeholder="John Doe"
                            />
                        </div>

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
                            <label htmlFor="phone" className="block text-sm font-medium text-theme-text mb-2">
                                Phone (optional)
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                                placeholder="+61 7 5555 0000"
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-text mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
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
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                )}

                <div className="text-center text-sm text-theme-text-muted">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-theme-accent hover:underline font-semibold">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
