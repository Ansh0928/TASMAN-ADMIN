'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface ProductCardData {
    id: string;
    name: string;
    slug: string;
    price: string;
    imageUrls: string[];
    unit: string;
    stockQuantity: number;
    category: { id: string; name: string; slug: string };
    isFeatured?: boolean;
    isTodaysSpecial?: boolean;
    tags?: string[];
}

interface ProductCardProps {
    product: ProductCardData;
    badge?: 'Best Buy' | 'Fresh Pick' | string;
    gridMode?: boolean;
}

export default function ProductCard({ product, badge, gridMode }: ProductCardProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stockQuantity <= 0) return;

        addItem({
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: 1,
            image: product.imageUrls[0] || '',
            unit: product.unit,
            slug: product.slug,
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const isOutOfStock = product.stockQuantity <= 0;

    return (
        <article className={gridMode ? "w-full" : "snap-start flex-shrink-0 w-[44vw] sm:w-[200px] md:w-[220px] lg:w-[240px]"}>
            <Link
                href={`/product/${product.slug}`}
                className="block bg-theme-secondary rounded-xl overflow-hidden border border-theme-border hover:border-theme-accent/30 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:border-theme-accent transition-all group h-full flex flex-col"
            >
                {/* Image container */}
                <div className="relative aspect-square bg-theme-tertiary overflow-hidden">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                        <Image
                            src={product.imageUrls[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 44vw, (max-width: 768px) 200px, (max-width: 1024px) 220px, 240px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🐟</div>
                    )}

                    {/* Badge */}
                    {badge && (
                        <span className={`absolute top-2 left-2 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm ${
                            badge === 'Best Buy' ? 'bg-emerald-500' :
                            badge === 'Fresh Pick' ? 'bg-[#FF7F50]' :
                            'bg-theme-accent'
                        }`}>
                            {badge}
                        </span>
                    )}

                    {/* Add to cart button */}
                    {!isOutOfStock && (
                        <button
                            onClick={handleAddToCart}
                            className={`absolute bottom-2 right-2 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all z-10 ${
                                added
                                    ? 'bg-emerald-500 scale-110'
                                    : 'bg-theme-accent hover:scale-110'
                            } focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2`}
                            aria-label="Add to cart"
                        >
                            {added ? <Check size={16} /> : '+'}
                        </button>
                    )}

                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-theme-text font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-theme-accent transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-theme-accent font-bold text-base">
                            ${parseFloat(product.price).toFixed(2)}
                            <span className="text-theme-text-muted font-normal text-xs ml-0.5">/{product.unit.toLowerCase()}</span>
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}
