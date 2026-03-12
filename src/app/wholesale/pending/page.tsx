'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Clock, Mail, Phone, Building2, ArrowRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WholesalePendingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [checking, setChecking] = useState(false);

    const companyName = session?.user?.name || 'Your Company';

    const handleCheckStatus = () => {
        setChecking(true);
        router.push('/wholesale/prices');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="space-y-8">
                    {/* Status Header */}
                    <div className="bg-theme-secondary border border-theme-border rounded-lg p-8 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Clock size={40} className="text-amber-500" />
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-3">
                                <Building2 size={14} />
                                Application Pending
                            </div>
                            <h1 className="text-3xl font-bold text-theme-text">
                                Your Application Is Under Review
                            </h1>
                            <p className="text-theme-text-muted mt-2">
                                Hi{session?.user?.name ? `, ${session.user.name}` : ''}! We have received your wholesale access application
                                {companyName !== 'Your Company' && (
                                    <> for <strong className="text-theme-text">{companyName}</strong></>
                                )}
                                .
                            </p>
                        </div>
                    </div>

                    {/* Timeline / Details */}
                    <div className="bg-theme-secondary border border-theme-border rounded-lg p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-theme-text">What happens next?</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-500 font-bold text-sm">1</span>
                                </div>
                                <div>
                                    <p className="text-theme-text font-medium">Application received</p>
                                    <p className="text-sm text-theme-text-muted">
                                        Your application has been submitted and is in our review queue.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-amber-500 font-bold text-sm">2</span>
                                </div>
                                <div>
                                    <p className="text-theme-text font-medium">Team review</p>
                                    <p className="text-sm text-theme-text-muted">
                                        Our team will verify your business details. This typically takes <strong className="text-theme-text">1-2 business days</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-theme-primary border border-theme-border flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-theme-text-muted font-bold text-sm">3</span>
                                </div>
                                <div>
                                    <p className="text-theme-text font-medium">Approval notification</p>
                                    <p className="text-sm text-theme-text-muted">
                                        You&apos;ll receive an email and SMS once your application is approved, and you can start ordering at wholesale prices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Check Status Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleCheckStatus}
                            disabled={checking}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            {checking ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    Check Status
                                </>
                            )}
                        </button>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-theme-text mb-3">Have questions?</h2>
                        <p className="text-sm text-theme-text-muted mb-4">
                            If you have any questions about your application or need to make changes, get in touch with our team.
                        </p>

                        <div className="space-y-3">
                            <a
                                href="mailto:wholesale@tasmanstarseafood.com"
                                className="flex items-center gap-3 text-theme-text hover:text-theme-accent transition-colors"
                            >
                                <Mail size={18} className="text-theme-accent" />
                                <span className="text-sm">wholesale@tasmanstarseafood.com</span>
                            </a>
                            <a
                                href="tel:+61755076712"
                                className="flex items-center gap-3 text-theme-text hover:text-theme-accent transition-colors"
                            >
                                <Phone size={18} className="text-theme-accent" />
                                <span className="text-sm">07 5507 6712</span>
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-theme-border">
                        <Link
                            href="/"
                            className="text-sm text-theme-text-muted hover:text-theme-accent transition-colors"
                        >
                            &larr; Back to Home
                        </Link>
                        <Link
                            href="/wholesale/prices"
                            className="inline-flex items-center gap-1 text-sm text-theme-accent hover:underline font-medium"
                        >
                            View Prices Page
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
