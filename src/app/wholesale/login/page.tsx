'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Building2 } from 'lucide-react';

export default function WholesaleLoginPage() {
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
            if (!result?.ok) { const msg = result?.error === 'CredentialsSignin' ? 'Invalid email or password.' : (result?.error || 'Invalid email or password.'); setFieldError(msg); return; }
            router.push('/wholesale/prices');
            router.refresh();
        } catch {
            setFieldError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = () => { setIsGoogleLoading(true); signIn('google', { callbackUrl: '/wholesale/prices' }); };
    const busy = isLoading || isGoogleLoading;

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
            <div className="w-full max-w-sm space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                        <Building2 size={16} />
                        Wholesale Portal
                    </div>
                    <h1 className="text-3xl font-bold text-theme-text">Wholesale Sign In</h1>
                    <p className="text-theme-text-muted mt-1 text-sm">Access your wholesale price list</p>
                </div>

                {fieldError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {fieldError}
                    </div>
                )}

                {/* Google */}
                <button onClick={handleGoogle} disabled={busy}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-theme-border rounded-lg bg-theme-secondary text-theme-text font-medium hover:border-blue-400 transition-colors disabled:opacity-50">
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
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-blue-400 disabled:opacity-50"
                            placeholder="you@company.com" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-1.5">Password</label>
                        <input type="password" id="password" name="password" required disabled={busy}
                            className="w-full px-4 py-2.5 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:border-blue-400 disabled:opacity-50"
                            placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={busy}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {isLoading ? 'Signing in...' : 'Sign In to Wholesale'}
                    </button>
                </form>

                {/* Info box */}
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-4 text-sm text-theme-text-muted">
                    <p className="font-medium text-blue-400 mb-1">Need wholesale access?</p>
                    <p>Apply for a wholesale account and we&apos;ll review your application within 1-2 business days.</p>
                    <Link href="/wholesale/apply" className="text-blue-400 hover:underline font-semibold mt-2 inline-block">
                        Apply now &rarr;
                    </Link>
                </div>

                {/* Other login */}
                <div className="pt-4 border-t border-theme-border">
                    <Link href="/auth/login" className="block text-center text-xs text-theme-text-muted hover:text-theme-accent transition-colors">
                        &larr; Back to customer sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
