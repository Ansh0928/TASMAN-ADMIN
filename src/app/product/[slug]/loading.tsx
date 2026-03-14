export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-theme-primary transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumb skeleton */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-4 w-12 rounded bg-theme-secondary animate-pulse" />
                    <span className="text-theme-text-muted">/</span>
                    <div className="h-4 w-20 rounded bg-theme-secondary animate-pulse" />
                    <span className="text-theme-text-muted">/</span>
                    <div className="h-4 w-32 rounded bg-theme-secondary animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Image placeholder */}
                    <div>
                        <div className="aspect-square rounded-2xl bg-theme-secondary animate-pulse -mx-4 md:mx-0" />
                        {/* Thumbnail row */}
                        <div className="flex gap-2 mt-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-14 aspect-square rounded-xl bg-theme-secondary animate-pulse"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product details placeholder */}
                    <div className="flex flex-col">
                        {/* Category */}
                        <div className="h-4 w-24 rounded bg-theme-secondary animate-pulse mb-3" />
                        {/* Title */}
                        <div className="h-9 w-3/4 rounded bg-theme-secondary animate-pulse mb-4" />
                        {/* Description lines */}
                        <div className="space-y-2 mb-6">
                            <div className="h-4 w-full rounded bg-theme-secondary animate-pulse" />
                            <div className="h-4 w-5/6 rounded bg-theme-secondary animate-pulse" />
                            <div className="h-4 w-2/3 rounded bg-theme-secondary animate-pulse" />
                        </div>
                        {/* Price */}
                        <div className="h-8 w-28 rounded bg-theme-secondary animate-pulse mb-6" />
                        {/* Quantity + Add to Cart */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-32 rounded-lg bg-theme-secondary animate-pulse" />
                            <div className="h-12 flex-1 rounded-lg bg-theme-secondary animate-pulse" />
                        </div>
                        {/* Trust badges */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 rounded-lg bg-theme-secondary animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
