'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const LEFT_CARDS = [
    {
        href: '/our-business/retail-stores',
        title: 'Retail Stores',
        description: 'Visit our stores in Labrador & Varsity Lakes for the freshest daily catch.',
        image: '/assets/retail-store.jpeg',
        video: '/assets/retail-showreel.mp4',
    },
    {
        href: '/our-business/wholesale',
        title: 'Wholesale',
        description: 'Bulk supply for restaurants, cafes, and independent grocers across the coast.',
        image: '/assets/products/store remake.png',
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
        description: "Our own trawlers fish the pristine waters off Australia's east coast daily.",
        image: '/vessels.jpeg',
    },
];

const ONLINE_STORE = {
    href: '/our-business/online-delivery',
    title: 'Online Store',
    description: 'Order premium seafood online and get it delivered fresh to your door on the Gold Coast.',
    image: '/assets/storefront.jpg',
};

function LazyVideo({ src, poster, className }: { src: string; poster: string; className: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {isVisible ? (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={poster}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                >
                    <source src={src} type="video/mp4" />
                </video>
            ) : (
                <Image
                    src={poster}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                />
            )}
        </div>
    );
}

export default function HomeBusinessCards() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

            {/* Left 2x2 Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                {LEFT_CARDS.map((card, index) => (
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
                            prefetch={false}
                            className="group relative flex flex-col h-[14rem] sm:h-[16rem] overflow-hidden rounded-xl"
                        >
                            {/* Background Media */}
                            {card.video ? (
                                <LazyVideo
                                    src={card.video}
                                    poster={card.image}
                                    className="absolute inset-0"
                                />
                            ) : (
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    priority={index === 0}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 group-hover:to-black/30 transition-all duration-500" />

                            {/* Text */}
                            <div className="relative z-10 mt-auto p-5">
                                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight mb-1.5 font-serif">
                                    {card.title}
                                </h2>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {card.description}
                                </p>
                                <span className="text-theme-accent text-sm font-medium mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 lg:opacity-0 transition-opacity">
                                    Learn more →
                                </span>
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
                    prefetch={false}
                    className="group relative flex flex-col h-[28rem] sm:h-[32rem] lg:h-full overflow-hidden rounded-xl"
                >
                    {/* Image */}
                    <Image
                        src={ONLINE_STORE.image}
                        alt={ONLINE_STORE.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 group-hover:to-black/30 transition-all duration-500" />

                    {/* Text */}
                    <div className="relative z-10 mt-auto p-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-2 font-serif">
                            {ONLINE_STORE.title}
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                            {ONLINE_STORE.description}
                        </p>

                        {/* Explore CTA — visible on hover */}
                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="bg-[#FF8543] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
                                Explore
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

        </div>
    );
}
