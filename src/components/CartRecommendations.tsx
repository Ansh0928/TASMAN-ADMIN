'use client';

import { useEffect, useState, useRef } from 'react';
import { useCart } from '@/components/CartProvider';
import Link from 'next/link';
import Image from 'next/image';

interface RecommendedProduct {
    id: string;
    name: string;
    slug: string;
    price: string;
    imageUrls: string[];
    unit: string;
    stockQuantity: number;
}

interface CartRecommendationsProps {
    productIds: string[];
}

function SkeletonCard() {
    return (
        <div className="snap-start flex-shrink-0 w-[140px] animate-pulse">
            <div className="bg-theme-tertiary rounded-xl overflow-hidden border border-theme-border">
                <div className="aspect-square bg-theme-primary" />
                <div className="p-2 space-y-1.5">
                    <div className="h-3 bg-theme-primary rounded w-4/5" />
                    <div className="h-3 bg-theme-primary rounded w-2/5" />
                </div>
            </div>
        </div>
    );
}

export default function CartRecommendations({ productIds }: CartRecommendationsProps) {
    const { addItem } = useCart();
    const [products, setProducts] = useState<RecommendedProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [added, setAdded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (productIds.length === 0) {
            setProducts([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/products/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productIds }),
                });
                if (!res.ok) { setProducts([]); return; }
                const data = await res.json();
                setProducts((data.recommendations ?? []).slice(0, 4));
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [productIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAdd = (p: RecommendedProduct, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            productId: p.id,
            name: p.name,
            price: parseFloat(p.price),
            quantity: 1,
            image: p.imageUrls[0] || '',
            unit: p.unit,
            slug: p.slug,
        });
        setAdded(prev => ({ ...prev, [p.id]: true }));
        setTimeout(() => setAdded(prev => ({ ...prev, [p.id]: false })), 1500);
    };

    if (!loading && products.length === 0) return null;

    return (
        <div className="border-t border-theme-border pt-4 mt-2">
            <p className="text-xs font-semibold text-theme-text-muted uppercase tracking-wider mb-3 px-1">
                You May Also Like
            </p>
            <div className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                    : products.map((p) => (
                        <div key={p.id} className="snap-start flex-shrink-0 w-[140px]">
                            <Link
                                href={`/product/${p.slug}`}
                                className="block bg-theme-tertiary rounded-xl overflow-hidden border border-theme-border hover:border-theme-accent/30 transition-all group"
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    {p.imageUrls[0] ? (
                                        <Image
                                            src={p.imageUrls[0]}
                                            alt={p.name}
                                            fill
                                            sizes="140px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🐟</div>
                                    )}
                                    {p.stockQuantity > 0 && (
                                        <button
                                            onClick={(e) => handleAdd(p, e)}
                                            className={`absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow transition-all z-10 ${
                                                added[p.id] ? 'bg-emerald-500 scale-110' : 'bg-theme-accent hover:scale-110'
                                            }`}
                                            aria-label="Add to cart"
                                        >
                                            {added[p.id] ? '✓' : '+'}
                                        </button>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-theme-text text-xs font-semibold leading-tight line-clamp-2 group-hover:text-theme-accent transition-colors">
                                        {p.name}
                                    </p>
                                    <p className="text-theme-accent font-bold text-sm mt-1">
                                        ${parseFloat(p.price).toFixed(2)}
                                        <span className="text-theme-text-muted font-normal text-[10px] ml-0.5">/{p.unit.toLowerCase()}</span>
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
