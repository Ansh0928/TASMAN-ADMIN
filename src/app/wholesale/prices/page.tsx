'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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
    const [categories, setCategories] = useState<WholesaleCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/wholesale/prices');
                const data = await res.json();
                setCategories(data || []);
            } catch (error) {
                console.error('Failed to fetch prices:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-theme-primary flex items-center justify-center">
                <p className="text-theme-text-muted">Loading wholesale prices...</p>
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
                            Current wholesale prices for approved partners
                        </p>
                    </div>

                    {categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-theme-text-muted">No wholesale categories available</p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category.id} className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                                <div className="bg-theme-primary px-6 py-4 border-b border-theme-border">
                                    <h2 className="text-xl font-bold text-theme-text">{category.name}</h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-theme-primary border-b border-theme-border">
                                            <tr>
                                                <th className="text-left px-6 py-3 text-sm font-bold text-theme-text">
                                                    Product
                                                </th>
                                                <th className="text-left px-6 py-3 text-sm font-bold text-theme-text">
                                                    Unit
                                                </th>
                                                <th className="text-right px-6 py-3 text-sm font-bold text-theme-text">
                                                    Price
                                                </th>
                                                <th className="text-center px-6 py-3 text-sm font-bold text-theme-text">
                                                    Available
                                                </th>
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
                            </div>
                        ))
                    )}

                    <p className="text-sm text-theme-text-muted text-center">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
