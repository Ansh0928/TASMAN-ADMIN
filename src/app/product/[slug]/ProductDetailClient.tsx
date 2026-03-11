'use client';

import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { MapPin, ChevronLeft, Check, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';

interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: string;
    imageUrls: string[];
    category: { id: string; name: string; slug: string };
    unit: string;
    stockQuantity: number;
    isAvailable: boolean;
    countryOfOrigin: string;
    tags: string[];
}

interface ProductDetailClientProps {
    product: Product;
    relatedProducts?: ProductCardData[];
    suggestedProducts?: ProductCardData[];
}

export default function ProductDetailClient({
    product,
    relatedProducts = [],
    suggestedProducts = [],
}: ProductDetailClientProps) {
    const [mainImage, setMainImage] = useState<string>(product.imageUrls[0] || '');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [showStickyCta, setShowStickyCta] = useState(false);
    const { addItem } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const ctaRef = useRef<HTMLButtonElement>(null);

    const inWishlist = isInWishlist(product.id);
    const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;
    const maxQuantity = product.stockQuantity;

    // Sticky CTA: observe main Add to Cart button visibility
    useEffect(() => {
        if (isOutOfStock || !ctaRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => setShowStickyCta(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(ctaRef.current);
        return () => observer.disconnect();
    }, [isOutOfStock]);

    const handleAddToCart = () => {
        if (isOutOfStock) return;

        const safeQuantity = Math.min(quantity, maxQuantity);

        addItem({
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: safeQuantity,
            image: product.imageUrls[0] || '',
            unit: product.unit,
            slug: product.slug,
        });

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const trustBadges = [
        { icon: '🚢', label: 'Own Fleet Caught' },
        { icon: '❄️', label: 'Cold Chain Delivery' },
        { icon: '📦', label: 'Same Day Available' },
        { icon: '⭐', label: 'Premium Grade' },
    ];

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 mb-8 text-sm">
                    <Link href="/our-business/online-delivery" className="text-theme-text-muted hover:text-theme-accent transition-colors">
                        Shop
                    </Link>
                    <span className="text-theme-text-muted">/</span>
                    <Link
                        href={`/our-products?category=${product.category.slug}`}
                        className="text-theme-text-muted hover:text-theme-accent transition-colors"
                    >
                        {product.category.name}
                    </Link>
                    <span className="text-theme-text-muted">/</span>
                    <span className="text-theme-text font-medium truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative bg-gradient-to-br from-[#112240] to-[#0A192F] rounded-2xl overflow-hidden mb-4 aspect-square border border-theme-accent/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.4)] -mx-4 md:mx-0">
                            {mainImage ? (
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">🐟</div>
                            )}
                        </div>

                        {product.imageUrls.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-4 sm:overflow-x-visible sm:pb-0">
                                {product.imageUrls.map((image, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(image)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all shrink-0 w-14 sm:w-auto ${
                                            mainImage === image
                                                ? 'border-theme-accent shadow-[0_2px_12px_rgba(255,133,67,0.25)]'
                                                : 'border-theme-border hover:-translate-y-0.5 hover:border-theme-accent/40'
                                        }`}
                                    >
                                        <Image src={image} alt={`${product.name} ${idx + 1}`} fill sizes="64px" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <Link
                                href={`/our-products?category=${product.category.slug}`}
                                className="inline-block text-theme-accent text-sm uppercase tracking-wider mb-2 hover:underline"
                            >
                                {product.category.name}
                            </Link>
                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-theme-text mb-4">{product.name}</h1>

                            {product.description && (
                                <p className="text-theme-text-muted leading-relaxed mb-4">{product.description}</p>
                            )}

                            <p className="text-theme-text-muted text-sm flex items-center gap-1">
                                <MapPin size={14} className="text-green-500" />
                                {product.countryOfOrigin === 'New Zealand' ? 'New Zealand' : 'Gold Coast, QLD'} · {product.countryOfOrigin}
                            </p>
                        </div>

                        {/* Price and Availability — Glassmorphic Card */}
                        <div className="mb-6">
                            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-4xl font-bold text-theme-accent">${parseFloat(product.price).toFixed(2)}</span>
                                    <span className="text-sm text-theme-text-muted">per {product.unit.toLowerCase()}</span>
                                </div>

                                {product.stockQuantity > 0 ? (
                                    <div className="flex items-center gap-2 text-green-500">
                                        <Check size={16} />
                                        <span>In Stock</span>
                                    </div>
                                ) : (
                                    <div className="text-red-500 font-medium">Out of Stock</div>
                                )}
                            </div>
                        </div>

                        {/* Tags — Solid dot style */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1.5 bg-theme-accent/[0.12] text-theme-accent text-[11px] font-semibold px-3 py-1.5 pl-2.5 rounded-lg uppercase tracking-wide"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        {isOutOfStock ? (
                            <div className="flex items-center gap-3 mb-6">
                                <button
                                    disabled
                                    className="flex-1 bg-gray-500 text-white py-3.5 rounded-xl font-semibold opacity-50 cursor-not-allowed"
                                >
                                    Out of Stock
                                </button>
                                <button
                                    onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                                    className="border border-theme-border rounded-xl p-3 min-h-11 min-w-11 flex items-center justify-center hover:border-red-500 transition-colors"
                                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    <Heart size={22} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-theme-text-muted'} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                                <div className="flex items-center bg-white/[0.03] border border-theme-border rounded-xl overflow-hidden self-stretch sm:self-start">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-3 min-w-11 min-h-11 text-theme-text hover:bg-theme-secondary transition-colors text-lg"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                                        className="w-14 text-center bg-transparent border-x border-theme-border text-theme-text focus:outline-none py-3"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                        disabled={quantity >= maxQuantity}
                                        className="px-4 py-3 min-w-11 min-h-11 text-theme-text hover:bg-theme-secondary transition-colors disabled:opacity-30 text-lg"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    ref={ctaRef}
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-gradient-to-br from-theme-accent to-[#e06520] text-white py-3.5 rounded-xl font-semibold shadow-[0_4px_16px_rgba(255,133,67,0.3)] hover:shadow-[0_6px_24px_rgba(255,133,67,0.4)] hover:-translate-y-px transition-all flex items-center justify-center gap-2 text-base"
                                >
                                    {addedToCart ? (
                                        <>
                                            <Check size={20} />
                                            Added to Cart
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag size={20} />
                                            Add to Cart
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                                    className="border border-theme-border rounded-xl p-3 min-h-11 min-w-11 flex items-center justify-center hover:border-red-500 transition-colors"
                                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    <Heart size={22} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-theme-text-muted'} />
                                </button>
                            </div>
                        )}

                        {!isOutOfStock && product.stockQuantity <= 5 && (
                            <p className="text-yellow-500 text-sm mb-4">
                                Low stock — order soon!
                            </p>
                        )}

                        {/* Trust Badges */}
                        <div className="mt-auto pt-5 border-t border-theme-border">
                            <div className="grid grid-cols-2 gap-2">
                                {trustBadges.map(({ icon, label }) => (
                                    <div key={label} className="flex items-center gap-2 bg-green-500/[0.06] border border-green-500/[0.15] rounded-[10px] px-3.5 py-2 text-xs text-theme-text-muted">
                                        <span className="text-base">{icon}</span>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ────────────────────────────────────────── */}
                {/* Frequently Ordered Together                */}
                {/* ────────────────────────────────────────── */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12 border-t border-theme-border pt-4">
                        <ProductCarousel
                            title="Frequently Ordered Together"
                            subtitle={`More from ${product.category.name}`}
                            viewAllHref={`/our-products?category=${product.category.slug}`}
                        >
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </ProductCarousel>
                    </div>
                )}

                {/* ────────────────────────────────────────── */}
                {/* You May Also Like                          */}
                {/* ────────────────────────────────────────── */}
                {suggestedProducts.length > 0 && (
                    <div className="border-t border-theme-border pt-4">
                        <ProductCarousel
                            title="You May Also Like"
                            subtitle="Explore other popular picks"
                            viewAllHref="/our-business/online-delivery"
                        >
                            {suggestedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} badge={p.isFeatured ? 'Best Buy' : undefined} />
                            ))}
                        </ProductCarousel>
                    </div>
                )}
            </div>

            {/* Mobile Sticky CTA */}
            {!isOutOfStock && showStickyCta && (
                <div className="fixed bottom-0 inset-x-0 backdrop-blur-xl border-t border-white/[0.08] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-header) 95%, transparent)' }}>
                    <div className="flex items-center gap-3 max-w-7xl mx-auto">
                        <div className="flex-shrink-0">
                            <span className="text-xl font-bold text-theme-accent">${parseFloat(product.price).toFixed(2)}</span>
                            <span className="text-xs text-theme-text-muted ml-1">/{product.unit.toLowerCase()}</span>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-gradient-to-br from-theme-accent to-[#e06520] text-white py-3 rounded-xl font-semibold shadow-[0_4px_16px_rgba(255,133,67,0.3)] flex items-center justify-center gap-2 text-sm"
                        >
                            {addedToCart ? (
                                <>
                                    <Check size={18} />
                                    Added
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={18} />
                                    Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
