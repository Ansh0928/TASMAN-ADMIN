'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface WholesaleCategory {
    id: string;
    name: string;
    items: WholesalePriceItem[];
}

interface WholesalePriceItem {
    id: string;
    name: string;
    description?: string;
    unit: string;
    price: string;
    isAvailable: boolean;
}

export default function WholesalePricesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<WholesaleCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Wait for session to load
        if (status === 'loading') return;

        // Not logged in — redirect to login
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/wholesale/prices');
            return;
        }

        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/wholesale/prices');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data || []);
                } else {
                    const data = await res.json();
                    setError(data.message || 'Unable to load wholesale prices');
                }
            } catch (err) {
                console.error('Failed to fetch prices:', err);
                setError('Failed to load prices. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
    }, [status, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-theme-primary flex items-center justify-center">
                <p className="text-theme-text-muted">Loading wholesale prices...</p>
            </div>
        );
    }

    // Show access denied messages based on wholesale status
    if (error) {
        const user = session?.user as any;
        const isPending = user?.wholesaleStatus === 'PENDING';
        const isRejected = user?.wholesaleStatus === 'REJECTED';
        const isCustomer = user?.role === 'CUSTOMER';

        return (
            <div className="min-h-screen bg-theme-primary">
                <div className="container mx-auto px-4 py-12 max-w-2xl">
                    <div className="bg-theme-secondary border border-theme-border rounded-lg p-8 text-center space-y-6">
                        <div className="flex justify-center">
                            {isPending ? (
                                <Clock size={64} className="text-yellow-500" />
                            ) : isRejected ? (
                                <XCircle size={64} className="text-red-500" />
                            ) : (
                                <Lock size={64} className="text-theme-text-muted" />
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-theme-text mb-3">
                                {isPending
                                    ? 'Application Under Review'
                                    : isRejected
                                    ? 'Application Not Approved'
                                    : 'Access Restricted'}
                            </h1>
                            <p className="text-theme-text-muted">{error}</p>
                        </div>

                        <div className="space-x-4 pt-4">
                            <Link
                                href="/"
                                className="inline-block px-6 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                            >
                                Back to Home
                            </Link>
                            {isCustomer && (
                                <Link
                                    href="/wholesale/apply"
                                    className="inline-block px-6 py-2 border border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent/5"
                                >
                                    Apply for Wholesale
                                </Link>
                            )}
                            {(isPending || isRejected) && (
                                <a
                                    href="mailto:info@tasmanstar.com.au"
                                    className="inline-block px-6 py-2 border border-theme-border text-theme-text rounded-lg hover:border-theme-accent"
                                >
                                    Contact Us
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-8">
                <Link href="/account" className="flex items-center gap-1 text-theme-accent hover:underline mb-8">
                    <ChevronLeft size={16} />
                    Back to Account
                </Link>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-theme-text mb-2">Wholesale Pricing</h1>
                        <p className="text-theme-text-muted">
                            Current wholesale prices for approved partners. For orders, please contact us by phone or email.
                        </p>
                    </div>

                    {categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-theme-text-muted">No wholesale categories available yet. Check back soon!</p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category.id} className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                                <div className="bg-theme-primary px-6 py-4 border-b border-theme-border">
                                    <h2 className="text-xl font-bold text-theme-text">{category.name}</h2>
                                </div>

                                {category.items.length === 0 ? (
                                    <p className="px-6 py-4 text-theme-text-muted text-sm">No items in this category</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-theme-primary border-b border-theme-border">
                                                <tr>
                                                    <th className="text-left px-6 py-3 text-sm font-bold text-theme-text">Product</th>
                                                    <th className="text-left px-6 py-3 text-sm font-bold text-theme-text">Unit</th>
                                                    <th className="text-right px-6 py-3 text-sm font-bold text-theme-text">Price</th>
                                                    <th className="text-center px-6 py-3 text-sm font-bold text-theme-text">Available</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {category.items.map((item, idx) => (
                                                    <tr
                                                        key={item.id}
                                                        className={idx % 2 === 0 ? 'bg-theme-secondary' : 'bg-theme-primary'}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="font-medium text-theme-text">{item.name}</p>
                                                                {item.description && (
                                                                    <p className="text-sm text-theme-text-muted">{item.description}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-theme-text-muted text-sm">{item.unit}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-theme-accent">
                                                            ${parseFloat(item.price).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                    item.isAvailable
                                                                        ? 'bg-green-500/10 text-green-500'
                                                                        : 'bg-red-500/10 text-red-500'
                                                                }`}
                                                            >
                                                                {item.isAvailable ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Contact info for ordering */}
                    <div className="bg-theme-secondary border border-theme-border rounded-lg p-6 text-center">
                        <h3 className="text-lg font-bold text-theme-text mb-2">Ready to Order?</h3>
                        <p className="text-theme-text-muted mb-4">Contact our wholesale team to place your order</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="tel:+61755290844" className="text-theme-accent hover:underline font-medium">
                                +61 7 5529 0844
                            </a>
                            <span className="hidden sm:inline text-theme-text-muted">|</span>
                            <a href="mailto:info@tasmanstar.com.au" className="text-theme-accent hover:underline font-medium">
                                info@tasmanstar.com.au
                            </a>
                        </div>
                    </div>

                    <p className="text-sm text-theme-text-muted text-center">
                        Prices are subject to change. Last viewed: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
