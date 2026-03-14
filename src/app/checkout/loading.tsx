export default function CheckoutLoading() {
    return (
        <div className="min-h-screen bg-theme-primary transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back link */}
                <div className="h-5 w-36 rounded bg-theme-secondary animate-pulse mb-8" />

                {/* Title */}
                <div className="h-10 w-48 rounded bg-theme-secondary animate-pulse mb-8" />

                <div className="flex flex-col-reverse lg:flex-row gap-8">
                    {/* Form area */}
                    <div className="flex-1 lg:flex-[2] space-y-6">
                        {/* Contact Information */}
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                            <div className="h-6 w-48 rounded bg-theme-primary/50 animate-pulse mb-4" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i}>
                                        <div className="h-4 w-16 rounded bg-theme-primary/50 animate-pulse mb-1" />
                                        <div className="h-10 w-full rounded-lg bg-theme-primary/50 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fulfillment */}
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                            <div className="h-6 w-32 rounded bg-theme-primary/50 animate-pulse mb-4" />
                            <div className="space-y-3">
                                <div className="h-14 w-full rounded-lg bg-theme-primary/50 animate-pulse" />
                                <div className="h-14 w-full rounded-lg bg-theme-primary/50 animate-pulse" />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                            <div className="h-6 w-40 rounded bg-theme-primary/50 animate-pulse mb-4" />
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i}>
                                        <div className="h-4 w-20 rounded bg-theme-primary/50 animate-pulse mb-1" />
                                        <div className="h-10 w-full rounded-lg bg-theme-primary/50 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:flex-1 lg:max-w-sm">
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                            <div className="h-6 w-36 rounded bg-theme-primary/50 animate-pulse mb-4" />
                            {/* Line items */}
                            <div className="space-y-3 mb-4 pb-4 border-b border-theme-border">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-theme-primary/50 animate-pulse" />
                                            <div>
                                                <div className="h-4 w-24 rounded bg-theme-primary/50 animate-pulse mb-1" />
                                                <div className="h-3 w-16 rounded bg-theme-primary/50 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="h-4 w-14 rounded bg-theme-primary/50 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 w-16 rounded bg-theme-primary/50 animate-pulse" />
                                    <div className="h-4 w-14 rounded bg-theme-primary/50 animate-pulse" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-20 rounded bg-theme-primary/50 animate-pulse" />
                                    <div className="h-4 w-14 rounded bg-theme-primary/50 animate-pulse" />
                                </div>
                                <div className="flex justify-between pt-2 border-t border-theme-border">
                                    <div className="h-5 w-12 rounded bg-theme-primary/50 animate-pulse" />
                                    <div className="h-5 w-16 rounded bg-theme-primary/50 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
