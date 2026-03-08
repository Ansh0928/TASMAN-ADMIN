'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';

interface Deal {
    slug: string;
    name: string;
    price: string;
    salePrice: string;
    discount: number;
    imageUrl: string | null;
    categoryName: string;
}

const FILTERS = ['All Deals', 'Under $20', 'Prawns', 'Oysters', 'Fish Fillets', 'Platters'];

export function DealsGrid({ deals }: { deals: Deal[] }) {
    const [activeFilter, setActiveFilter] = useState('All Deals');

    const filtered = deals.filter((deal) => {
        if (activeFilter === 'All Deals') return true;
        if (activeFilter === 'Under $20') return parseFloat(deal.salePrice) < 20;
        return deal.categoryName.toLowerCase().includes(activeFilter.toLowerCase());
    });

    return (
        <>
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3 mb-10">
                {FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                            activeFilter === filter
                                ? 'bg-[#FF8543] text-white shadow-lg shadow-[#FF8543]/25'
                                : 'bg-theme-toggle text-theme-text-muted hover:text-theme-text border border-theme-border'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filtered.length > 0 ? (
                    filtered.map((deal) => (
                        <Link
                            key={deal.slug}
                            href={`/product/${deal.slug}`}
                            className="group bg-theme-card rounded-2xl overflow-hidden border border-theme-border hover:border-[#FF8543]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF8543]/5 flex flex-col"
                        >
                            <div className="aspect-square w-full bg-theme-tertiary overflow-hidden relative">
                                <div className="absolute top-3 left-3 z-10 bg-[#FF3B30] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    {deal.discount}% OFF
                                </div>
                                {deal.imageUrl ? (
                                    <img src={deal.imageUrl} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-theme-tertiary flex items-center justify-center text-theme-text-muted text-4xl">🐟</div>
                                )}
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="text-theme-text font-semibold text-sm leading-snug group-hover:text-[#FF8543] transition-colors line-clamp-2">
                                    {deal.name}
                                </h3>
                                <div className="mt-auto pt-3 flex items-baseline gap-2">
                                    <span className="text-[#FF7F50] font-bold text-lg">${deal.salePrice}</span>
                                    <span className="text-theme-text-muted line-through text-sm">${deal.price}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#FF8543]/70">
                                    <Tag size={12} />
                                    <span>Limited time offer</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-theme-text-muted">No deals match this filter. Try another category!</p>
                    </div>
                )}
            </div>
        </>
    );
}
