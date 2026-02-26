'use client';

import Link from 'next/link';
import { Box, Store, Globe, Truck, Anchor, MapPin, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        href: '/our-products',
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

interface Product {
    slug: string;
    name: string;
    price: string;
    imageUrls: string[];
}

function getDayOfWeek() {
    return new Date().toLocaleDateString('en-AU', { weekday: 'long' });
}

export default function Home() {
    const day = getDayOfWeek();
    const [todaysSpecials, setTodaysSpecials] = useState<Product[]>([]);
    const [bestBuys, setBestBuys] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [specialsRes, buyRes] = await Promise.all([
                    fetch('/api/products?todaysSpecial=true&limit=4'),
                    fetch('/api/products?featured=true&limit=4'),
                ]);

                const specialsData = await specialsRes.json();
                const buyData = await buyRes.json();

                setTodaysSpecials(specialsData.products || []);
                setBestBuys(buyData.products || []);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero Header */}
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
                                    className="group bg-theme-card rounded-2xl shadow-sm border border-theme-subtle overflow-hidden hover:shadow-xl transition-all hover:border-[#FF8543]/50 flex flex-col"
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
                                        <div className="w-12 h-12 bg-[#FF8543]/10 rounded-full flex items-center justify-center -mt-12 z-20 mb-3 shadow-md border-4 border-theme-card">
                                            <Icon className="text-[#FF8543]" size={24} />
                                        </div>
                                        <h2 className="font-serif text-xl font-bold text-theme-primary mb-2 group-hover:text-[#FF8543] transition-colors">
                                            {card.title}
                                        </h2>
                                        <p className="text-theme-muted text-sm">{card.description}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Today's Specials */}
                <section className="container mx-auto px-4 md:px-6 py-8">
                    <div className="border-t border-theme-subtle pt-10">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-theme-primary mb-2">Today&apos;s Specials</h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 bg-[#FF7F50] text-white text-xs font-bold rounded uppercase tracking-wider">Fresh Today</span>
                                    <span className="text-theme-muted text-sm">{day} &mdash; Refreshed daily</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                <p className="text-theme-text-muted">Loading...</p>
                            ) : todaysSpecials.length > 0 ? (
                                todaysSpecials.map((product) => (
                                    <ProductCard key={product.slug} product={product} badge="Today" />
                                ))
                            ) : (
                                <p className="text-theme-text-muted">No specials available</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Best Buys */}
                <section className="container mx-auto px-4 md:px-6 py-8 pb-20">
                    <div className="border-t border-theme-subtle pt-10">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-theme-primary mb-2">Best Buys</h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded uppercase tracking-wider">Popular</span>
                                    <span className="text-theme-muted text-sm">Customer favorites</span>
                                </div>
                            </div>
                            <Link href="/our-products" className="hidden md:flex items-center text-[#FF8543] hover:text-theme-primary transition-colors text-sm font-medium gap-1">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                <p className="text-theme-text-muted">Loading...</p>
                            ) : bestBuys.length > 0 ? (
                                bestBuys.map((product) => (
                                    <ProductCard key={product.slug} product={product} badge="Best Buy" />
                                ))
                            ) : (
                                <p className="text-theme-text-muted">No products available</p>
                            )}
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}

function ProductCard({ product, badge }: { product: Product; badge?: string }) {
    return (
        <Link href={`/product/${product.slug}`} className="bg-theme-card rounded-2xl overflow-hidden shadow-lg border border-theme-subtle flex flex-col group relative hover:border-[#E2743A]/50 transition-colors duration-300">
            {badge && (
                <div className="absolute top-4 left-4 z-10 bg-[#FF7F50] text-white text-xs font-bold px-3 py-1 rounded shadow-lg uppercase">
                    {badge}
                </div>
            )}

            <div className="aspect-[4/3] w-full bg-theme-tertiary overflow-hidden relative">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-theme-tertiary flex items-center justify-center text-theme-muted text-4xl">🐟</div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                    <h3 className="text-theme-primary font-serif text-lg leading-snug mb-2 group-hover:text-[#E2743A] transition-colors line-clamp-2">{product.name}</h3>
                    <p className="text-theme-muted text-xs uppercase tracking-wider mb-4 flex items-center gap-1">
                        <MapPin size={12} className="text-[#FF8543]" /> Gold Coast, QLD
                    </p>
                </div>
                <div className="flex items-end justify-between mt-auto">
                    <span className="text-[#FF7F50] font-bold text-xl">${parseFloat(product.price).toFixed(2)}</span>
                    <div className="w-10 h-10 rounded-full bg-[#FF8543] hover:bg-[#1A908A] text-white flex items-center justify-center font-bold text-xl transition-all shadow-md group-hover:scale-110">
                        +
                    </div>
                </div>
            </div>
        </Link>
    );
}
