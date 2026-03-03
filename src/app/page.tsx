'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';
import RegionalMapLazy from '@/components/map/RegionalMapLazy';
import { GlowingEffect } from '@/components/ui/glowing-effect';

/*
  Layout:
  ┌──────────────┬──────────────┬──────────────────┐
  │ Retail       │ Wholesale    │                  │
  │ Stores       │ Supply       │  Online Store    │
  ├──────────────┼──────────────┤  (tall, right)   │
  │ Transport &  │ Our Fishing  │                  │
  │ Fish Freight │ Fleet        │                  │
  └──────────────┴──────────────┴──────────────────┘
*/

const LEFT_CARDS = [
    {
        href: '/our-business/retail-stores',
        title: 'Retail Stores',
        description: 'Visit our stores in Labrador & Varsity Lakes for the freshest daily catch.',
        image: '/assets/retail-store.jpeg',
    },
    {
        href: '/our-business/wholesale',
        title: 'Wholesale',
        description: 'Bulk supply for restaurants, cafes, and independent grocers across the coast.',
        image: '/assets/wholesale.png',
    },
    {
        href: '/our-business/transport',
        title: 'Transport & Fish Freight',
        description: 'Temperature-controlled logistics from our boats to markets Australia-wide.',
        image: '/tasman-star-fleet1.jpeg',
    },
    {
        href: '/our-business/fishing-fleet',
        title: 'Our Fishing Fleet',
        description: 'Our own trawlers fish the pristine waters off Australia\'s east coast daily.',
        image: '/vessels.jpeg',
    },
];

const ONLINE_STORE = {
    href: '/our-business/online-delivery',
    title: 'Online Store',
    description: 'Order premium seafood online and get it delivered fresh to your door on the Gold Coast.',
    image: '/assets/storefront.jpg',
};

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
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Tasman Star Seafoods
                    </h1>
                    <p className="text-[#FF8543] font-semibold tracking-[0.3em] uppercase text-sm mb-4">Our Business</p>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg font-light">
                        From the boats to the cold trucks, and straight to your business or home. A complete end-to-end seafood supply chain.
                    </p>
                </div>
            </div>

            <main className="flex flex-col w-full">

                {/* Business Cards */}
                <section className="container mx-auto px-4 md:px-8 py-16 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

                        {/* Left 2x2 Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                            {LEFT_CARDS.map((card) => (
                                <div key={card.href} className="relative rounded-2xl border-[0.75px] border-white/[0.08] p-1.5">
                                    <GlowingEffect
                                        spread={40}
                                        glow={true}
                                        disabled={false}
                                        proximity={64}
                                        inactiveZone={0.01}
                                        borderWidth={3}
                                    />
                                    <Link
                                        href={card.href}
                                        className="group relative flex flex-col h-[16rem] overflow-hidden rounded-xl"
                                    >
                                        {/* Image */}
                                        <img
                                            src={card.image}
                                            alt={card.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 group-hover:to-black/30 transition-all duration-500" />

                                        {/* Text */}
                                        <div className="relative z-10 mt-auto p-5">
                                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {card.title}
                                            </h2>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                {card.description}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Right — Online Store (tall) */}
                        <div className="relative rounded-2xl border-[0.75px] border-white/[0.08] p-1.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <Link
                                href={ONLINE_STORE.href}
                                className="group relative flex flex-col h-[16rem] lg:h-full overflow-hidden rounded-xl"
                            >
                                {/* Image */}
                                <img
                                    src={ONLINE_STORE.image}
                                    alt={ONLINE_STORE.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 group-hover:to-black/30 transition-all duration-500" />

                                {/* Text */}
                                <div className="relative z-10 mt-auto p-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {ONLINE_STORE.title}
                                    </h2>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        {ONLINE_STORE.description}
                                    </p>

                                    {/* Explore CTA — visible on hover */}
                                    <div className="flex items-center gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        <span className="bg-[#FF8543] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
                                            Explore
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>

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
