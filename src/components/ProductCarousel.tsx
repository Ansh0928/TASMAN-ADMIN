'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ProductCarouselProps {
    title: string;
    subtitle?: string;
    viewAllHref?: string;
    children: ReactNode;
}

export default function ProductCarousel({ title, subtitle, viewAllHref, children }: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [children]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const scrollAmount = el.clientWidth * 0.75;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <section className="py-8">
            {/* Header */}
            <div className="flex items-end justify-between mb-6 px-4 md:px-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-theme-text">{title}</h2>
                    {subtitle && <p className="text-theme-text-muted text-sm mt-1">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {viewAllHref && (
                        <Link
                            href={viewAllHref}
                            className="hidden md:flex items-center text-theme-accent hover:underline text-sm font-medium gap-1"
                        >
                            View All <ChevronRight size={16} />
                        </Link>
                    )}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className="w-9 h-9 rounded-full border border-theme-border flex items-center justify-center text-theme-text hover:bg-theme-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className="w-9 h-9 rounded-full border border-theme-border flex items-center justify-center text-theme-text hover:bg-theme-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 md:px-0 pb-4 no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>
        </section>
    );
}
