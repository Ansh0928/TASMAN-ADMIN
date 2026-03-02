export default function ProductsLoading() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">
            {/* Hero skeleton */}
            <div className="w-full bg-[#0A192F] py-12 md:py-16">
                <div className="container mx-auto px-6 text-center space-y-4">
                    <div className="inline-block h-7 w-32 rounded-full bg-white/10 animate-pulse" />
                    <div className="h-10 md:h-12 w-64 mx-auto rounded-lg bg-white/10 animate-pulse" />
                    <div className="h-5 w-96 max-w-full mx-auto rounded-lg bg-white/10 animate-pulse" />
                </div>
            </div>

            {/* Filter bar skeleton */}
            <div className="container mx-auto px-6 py-6">
                <div className="flex flex-wrap gap-3 mb-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-9 rounded-full bg-theme-secondary animate-pulse"
                            style={{ width: `${70 + i * 12}px` }}
                        />
                    ))}
                </div>

                {/* Product grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-theme-border bg-theme-secondary overflow-hidden animate-pulse"
                        >
                            {/* Image placeholder */}
                            <div className="aspect-square bg-theme-primary/50" />
                            {/* Content placeholder */}
                            <div className="p-4 space-y-3">
                                <div className="h-4 w-20 rounded bg-theme-primary/50" />
                                <div className="h-5 w-3/4 rounded bg-theme-primary/50" />
                                <div className="flex items-center justify-between pt-1">
                                    <div className="h-6 w-24 rounded bg-theme-primary/50" />
                                    <div className="h-9 w-28 rounded-lg bg-theme-primary/50" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
