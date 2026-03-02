'use client';

import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-theme-primary px-4 transition-colors duration-300">
            <div className="text-center space-y-6 max-w-lg">
                <div className="space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-theme-text font-serif">
                        Something Went Wrong
                    </h1>
                </div>
                <p className="text-lg text-theme-text-muted leading-relaxed">
                    We encountered an unexpected error. Please try again, or head back to the
                    home page if the problem persists.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <button
                        onClick={() => reset()}
                        className="inline-block px-6 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-block px-6 py-2.5 border border-theme-accent text-theme-accent rounded-lg font-semibold hover:bg-theme-accent/10 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
