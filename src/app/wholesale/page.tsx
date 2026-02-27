'use client';

import Link from 'next/link';
import { ShieldCheck, FileText, Eye, Phone } from 'lucide-react';

export default function WholesalePage() {
    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-4 font-serif">
                        Wholesale
                    </h1>
                    <p className="text-theme-text-muted text-lg max-w-2xl mx-auto">
                        Access exclusive wholesale pricing for your business. We supply fresh seafood to restaurants,
                        hotels, catering companies, and retail stores across Australia.
                    </p>
                </div>

                {/* How It Works */}
                <div className="max-w-4xl mx-auto mb-12">
                    <h2 className="text-2xl font-bold text-theme-text mb-8 text-center">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-theme-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText size={28} className="text-theme-accent" />
                            </div>
                            <h3 className="text-lg font-bold text-theme-text mb-2">1. Apply</h3>
                            <p className="text-theme-text-muted text-sm">
                                Fill out our wholesale application with your business details, ABN, and contact information.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-theme-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck size={28} className="text-theme-accent" />
                            </div>
                            <h3 className="text-lg font-bold text-theme-text mb-2">2. Get Approved</h3>
                            <p className="text-theme-text-muted text-sm">
                                Our team reviews your application and approves eligible businesses within 1-2 business days.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-theme-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Eye size={28} className="text-theme-accent" />
                            </div>
                            <h3 className="text-lg font-bold text-theme-text mb-2">3. View Prices</h3>
                            <p className="text-theme-text-muted text-sm">
                                Once approved, log in to access our full wholesale price list. Place orders by phone or email.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link
                        href="/wholesale/apply"
                        className="bg-theme-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-theme-accent/90 transition-colors text-lg"
                    >
                        Apply for Wholesale
                    </Link>
                    <Link
                        href="/wholesale/login"
                        className="border border-theme-border text-theme-text px-8 py-3 rounded-lg font-semibold hover:border-theme-accent transition-colors text-lg"
                    >
                        Already Approved? Sign In
                    </Link>
                </div>

                {/* Contact */}
                <div className="max-w-xl mx-auto bg-theme-secondary border border-theme-border rounded-lg p-8 text-center">
                    <Phone size={24} className="text-theme-accent mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-theme-text mb-2">Have Questions?</h3>
                    <p className="text-theme-text-muted mb-4">
                        Contact our wholesale team for enquiries about pricing, minimum orders, or delivery schedules.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-theme-text">
                        <a href="tel:+61755290844" className="text-theme-accent hover:underline font-medium">
                            +61 7 5529 0844
                        </a>
                        <span className="hidden sm:inline text-theme-text-muted">|</span>
                        <a href="mailto:info@tasmanstar.com.au" className="text-theme-accent hover:underline font-medium">
                            info@tasmanstar.com.au
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
