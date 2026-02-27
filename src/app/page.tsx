'use client';

import Link from 'next/link';
import { Box, Store, Globe, Truck, Anchor, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';
import RegionalMapLazy from '@/components/map/RegionalMapLazy';

const BUSINESS_CARDS = [
    {
        href: '/our-business/wholesale',
        icon: Box,
        title: 'Wholesale Supply',
        description: 'Bulk fresh supply for restaurants, cafes, and independent grocers across the coast.',
        image: '/assets/wholesale.png',
    },
    {
        href: '/our-business/retail-stores',
        icon: Store,
        title: 'Retail Stores',
        description: 'Visit our physical stores in Labrador and Varsity Lakes to pick your own fresh catch.',
        image: '/assets/retail-store.jpeg',
    },
    {
        href: '/our-business/online-delivery',
        icon: Globe,
        title: 'Online & Delivery',
        description: 'Order premium seafood online and get it delivered fresh to your door on the Gold Coast.',
        image: '/assets/fresh.webp',
    },
    {
        href: '/our-business/transport',
        icon: Truck,
        title: 'Transport & Fish Freight',
        description: 'Temperature-controlled logistics moving seafood from our boats to markets across Australia.',
        image: '/tasman-star-fleet1.jpeg',
    },
    {
        href: '/our-business/fishing-fleet',
        icon: Anchor,
        title: 'Our Commercial Fishing Fleet',
        description: 'Our own trawlers and vessels fish the pristine waters off Australia\'s east coast daily.',
        image: '/vessels.jpeg',
    },
];

export default function Home() {
    const [bestBuys, setBestBuys] = useState<ProductCardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestBuys = async () => {
            try {
                const res = await fetch('/api/products?featured=true&limit=10');
                const data = await res.json();
                setBestBuys(data.products || []);
            } catch (error) {
                console.error('Failed to fetch best buys:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBestBuys();
    }, []);

    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero Banner */}
            <div className="w-full bg-[#0A192F] py-16 md:py-24">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4">Tasman Star Seafoods</h1>
                    <p className="text-[#FF8543] font-bold tracking-[0.3em] uppercase text-sm mb-4">Our Services</p>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                        From the boats to the cold trucks, and straight to your business or home. We operate a complete end-to-end seafood supply chain.
                    </p>
                </div>
            </div>

            <main className="flex flex-col w-full">

                {/* Business Cards */}
                <section className="container mx-auto px-4 md:px-8 py-16 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {BUSINESS_CARDS.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={card.href}
                                    href={card.href}
                                    className="group bg-theme-secondary rounded-2xl shadow-sm border border-theme-border overflow-hidden hover:shadow-xl transition-all hover:border-theme-accent/50 flex flex-col"
                                >
                                    <div className="h-52 bg-theme-tertiary overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                                        <img
                                            src={card.image}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={card.title}
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col items-center text-center flex-grow">
                                        <div className="w-12 h-12 bg-theme-accent/10 rounded-full flex items-center justify-center -mt-12 z-20 mb-3 shadow-md border-4 border-theme-secondary">
                                            <Icon className="text-theme-accent" size={24} />
                                        </div>
                                        <h2 className="font-serif text-xl font-bold text-theme-text mb-2 group-hover:text-theme-accent transition-colors">
                                            {card.title}
                                        </h2>
                                        <p className="text-theme-text-muted text-sm">{card.description}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Explore Our Waters — Isometric Australia Map */}
                <section className="container mx-auto px-4 md:px-8 max-w-6xl">
                    <RegionalMapLazy />
                </section>

                {/* Best Buys */}
                {!loading && bestBuys.length > 0 && (
                    <section className="container mx-auto max-w-7xl pb-16">
                        <ProductCarousel
                            title="Best Buys"
                            subtitle="Our top picks for you"
                            viewAllHref="/our-products"
                        >
                            {bestBuys.map((product) => (
                                <ProductCard key={product.id} product={product} badge="Best Buy" />
                            ))}
                        </ProductCarousel>
                    </section>
                )}

            </main>
        </div>
    );
}
