import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-theme-primary px-4">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold text-theme-text">Access Denied</h1>
                <p className="text-lg text-theme-text-muted">
                    You don't have permission to access this page.
                </p>
                <div className="space-x-4">
                    <Link
                        href="/"
                        className="inline-block px-6 py-2 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/auth/login"
                        className="inline-block px-6 py-2 border border-theme-accent text-theme-accent rounded-lg font-semibold hover:bg-theme-accent/5"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
