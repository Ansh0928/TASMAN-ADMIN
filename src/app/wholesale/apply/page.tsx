'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ChevronLeft, Mail, MessageSquare } from 'lucide-react';

export default function WholesaleApplyPage() {
    const [formData, setFormData] = useState({
        companyName: '',
        abn: '',
        contactName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/wholesale/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: formData.companyName,
                    abn: formData.abn,
                    contactName: formData.contactName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Failed to submit application');
                return;
            }

            setSubmitted(true);
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[100dvh] bg-theme-primary flex items-center justify-center px-4">
                <div className="bg-theme-secondary border border-theme-border rounded-lg p-8 text-center space-y-6 max-w-2xl">
                    <div className="flex justify-center">
                        <CheckCircle size={64} className="text-green-500" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold text-theme-text mb-2">Application Submitted!</h1>
                        <p className="text-theme-text-muted">
                            Thank you for applying for wholesale access. Our team will review your application
                            and you&apos;ll receive an email and SMS confirmation at <strong className="text-theme-text">{formData.email}</strong> and <strong className="text-theme-text">{formData.phone}</strong> once
                            your application is approved.
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-theme-text-muted">
                            <span className="inline-flex items-center gap-1.5">
                                <Mail size={16} className="text-green-500" />
                                Email confirmation sent
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <MessageSquare size={16} className="text-green-500" />
                                SMS confirmation sent
                            </span>
                        </div>
                        <p className="text-theme-text-muted mt-3">
                            This usually takes 1-2 business days. Once approved, you can sign in with your email and password to view wholesale prices.
                        </p>
                    </div>

                    <div className="space-x-4 pt-4">
                        <Link
                            href="/"
                            className="inline-block px-6 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                        >
                            Back to Home
                        </Link>
                        <Link
                            href="/auth/login"
                            className="inline-block px-6 py-2 border border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent/5"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link href="/wholesale" className="flex items-center gap-1 text-theme-accent hover:underline mb-8">
                    <ChevronLeft size={16} />
                    Back to Wholesale
                </Link>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-theme-text mb-2">Wholesale Access Application</h1>
                        <p className="text-theme-text-muted">
                            Apply to access our wholesale pricing. Once approved, you can sign in to view the full price list.
                        </p>
                    </div>

                    <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-6 text-red-500">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-theme-text mb-1">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-base focus:outline-none focus:border-theme-accent"
                                    placeholder="Your company name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-text mb-1">
                                    ABN (Australian Business Number) *
                                </label>
                                <input
                                    type="text"
                                    name="abn"
                                    value={formData.abn}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-base focus:outline-none focus:border-theme-accent"
                                    placeholder="11 digit ABN"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-text mb-1">
                                    Contact Name *
                                </label>
                                <input
                                    type="text"
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-base focus:outline-none focus:border-theme-accent"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-text mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-base focus:outline-none focus:border-theme-accent"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-text mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-base focus:outline-none focus:border-theme-accent"
                                    placeholder="+61 7 5555 0000"
                                />
                            </div>

                            <hr className="border-theme-border" />

                            <p className="text-sm text-theme-text-muted">
                                Create a password for your account. You&apos;ll use this to sign in and view wholesale prices once approved.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-theme-text mb-1">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-base focus:outline-none focus:border-theme-accent"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-theme-text mb-1">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text text-base focus:outline-none focus:border-theme-accent"
                                    placeholder="Confirm your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-theme-accent text-white py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>

                    <p className="text-sm text-theme-text-muted">
                        Already have an account?{' '}
                        <Link href="/wholesale/login" className="text-theme-accent hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
