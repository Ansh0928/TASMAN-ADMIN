'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { MapPin, ChevronLeft, Check, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
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
    const { addItem } = useCart();

    const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;
    const maxQuantity = product.stockQuantity;

    const handleAddToCart = () => {
        if (isOutOfStock) return;

        const safeQuantity = Math.min(quantity, maxQuantity);

        addItem({
            id: product.id,
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
                        <div className="bg-theme-secondary rounded-2xl overflow-hidden mb-4 aspect-square flex items-center justify-center border border-theme-border">
                            {mainImage ? (
                                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-6xl">🐟</div>
                            )}
                        </div>

                        {product.imageUrls.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.imageUrls.map((image, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(image)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                                            mainImage === image ? 'border-theme-accent' : 'border-theme-border'
                                        }`}
                                    >
                                        <img src={image} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
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
                                <MapPin size={14} className="text-theme-accent" />
                                Gold Coast, QLD
                            </p>
                        </div>

                        {/* Price and Availability */}
                        <div className="mb-6 pb-6 border-b border-theme-border">
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-bold text-theme-accent">${parseFloat(product.price).toFixed(2)}</span>
                                <span className="text-sm text-theme-text-muted">per {product.unit.toLowerCase()}</span>
                            </div>

                            {product.stockQuantity > 0 ? (
                                <div className="flex items-center gap-2 text-green-500">
                                    <Check size={16} />
                                    <span>{product.stockQuantity} in stock</span>
                                </div>
                            ) : (
                                <div className="text-red-500 font-medium">Out of stock</div>
                            )}
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-theme-accent/10 text-theme-accent text-xs font-semibold rounded-full uppercase"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        {isOutOfStock ? (
                            <div className="mb-6">
                                <button
                                    disabled
                                    className="w-full bg-gray-500 text-white py-3.5 rounded-xl font-semibold opacity-50 cursor-not-allowed"
                                >
                                    Out of Stock
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center border border-theme-border rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-3 text-theme-text hover:bg-theme-secondary transition-colors text-lg"
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
                                        className="px-4 py-3 text-theme-text hover:bg-theme-secondary transition-colors disabled:opacity-30 text-lg"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-theme-accent text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-base"
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
                            </div>
                        )}

                        {!isOutOfStock && product.stockQuantity <= 5 && (
                            <p className="text-yellow-500 text-sm mb-4">
                                Only {product.stockQuantity} left in stock — order soon!
                            </p>
                        )}

                        {/* More Info */}
                        <div className="mt-auto pt-6 border-t border-theme-border">
                            <h3 className="font-semibold text-theme-text mb-3">About this product</h3>
                            <ul className="space-y-2 text-sm text-theme-text-muted">
                                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0" /> Fresh from our boats daily</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0" /> Temperature controlled delivery</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0" /> Premium quality guaranteed</li>
                                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0" /> Same day delivery available</li>
                            </ul>
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
        </div>
    );
}
