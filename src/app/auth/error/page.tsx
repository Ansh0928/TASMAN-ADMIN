'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked:
        'This email is already registered with a different sign-in method. Please use the method you originally registered with.',
    Configuration: 'There is a problem with the server configuration.',
};

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get('error') || '';
    const message =
        errorMessages[errorCode] ||
        'An authentication error occurred. Please try again.';

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-theme-primary px-4 py-12">
            <div className="w-full max-w-sm space-y-6 text-center">
                <div>
                    <h1 className="text-3xl font-bold text-theme-text">Sign-in Error</h1>
                    <p className="text-theme-text-muted mt-1 text-sm">Something went wrong</p>
                </div>

                <div className="p-4 bg-theme-secondary border border-theme-border rounded-lg">
                    <p className="text-theme-text-muted text-sm">{message}</p>
                </div>

                <Link
                    href="/auth/login"
                    className="inline-block w-full bg-theme-accent text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}
