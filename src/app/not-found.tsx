import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-theme-primary px-4 transition-colors duration-300">
            <div className="text-center space-y-6 max-w-lg">
                <div className="space-y-2">
                    <p className="text-8xl font-bold text-theme-accent font-serif">404</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-theme-text font-serif">
                        Page Not Found
                    </h1>
                </div>
                <p className="text-lg text-theme-text-muted leading-relaxed">
                    Sorry, the page you are looking for does not exist or has been moved.
                    Let us help you find your way back.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Link
                        href="/"
                        className="inline-block px-6 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/our-products"
                        className="inline-block px-6 py-2.5 border border-theme-accent text-theme-accent rounded-lg font-semibold hover:bg-theme-accent/10 transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        </div>
    );
}
