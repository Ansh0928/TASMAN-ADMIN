'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { MapPin, ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';

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

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { slug } = await params;
                const res = await fetch(`/api/products/${slug}`);
                const data = await res.json();
                if (res.ok) {
                    setProduct(data);
                    if (data.imageUrls && data.imageUrls.length > 0) {
                        setMainImage(data.imageUrls[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params]);

    const isOutOfStock = !product || product.stockQuantity <= 0 || !product.isAvailable;
    const maxQuantity = product ? product.stockQuantity : 0;

    const handleAddToCart = () => {
        if (!product || isOutOfStock) return;

        // Cap quantity at available stock
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

    if (loading) {
        return (
            <div className="min-h-screen bg-theme-primary flex items-center justify-center">
                <p className="text-theme-text-muted">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-theme-primary">
                <div className="container mx-auto px-4 py-12">
                    <p className="text-theme-text-muted mb-4">Product not found</p>
                    <Link href="/our-products" className="text-theme-accent hover:underline">
                        Back to products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8">
                    <Link href="/our-products" className="flex items-center gap-1 text-theme-accent hover:underline">
                        <ChevronLeft size={16} />
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="bg-theme-secondary rounded-lg overflow-hidden mb-4 aspect-square flex items-center justify-center">
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
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
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
                            <p className="text-theme-text-muted text-sm uppercase tracking-wider mb-2">
                                {product.category.name}
                            </p>
                            <h1 className="font-serif text-4xl font-bold text-theme-text mb-4">{product.name}</h1>

                            {product.description && (
                                <p className="text-theme-text-muted mb-4">{product.description}</p>
                            )}

                            <p className="text-theme-text-muted text-sm flex items-center gap-1 mb-6">
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
                                <div className="text-red-500">Out of stock</div>
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
                                    className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed"
                                >
                                    Out of Stock
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center border border-theme-border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 text-theme-text hover:bg-theme-secondary transition-colors"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                                        className="w-16 text-center bg-transparent border-x border-theme-border text-theme-text focus:outline-none"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                        disabled={quantity >= maxQuantity}
                                        className="px-4 py-2 text-theme-text hover:bg-theme-secondary transition-colors disabled:opacity-30"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-theme-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    {addedToCart ? (
                                        <>
                                            <Check size={20} />
                                            Added to Cart
                                        </>
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                            </div>
                        )}

                        {!isOutOfStock && product.stockQuantity <= 5 && (
                            <p className="text-yellow-500 text-sm mb-4">
                                Only {product.stockQuantity} left in stock - order soon!
                            </p>
                        )}

                        {/* More Info */}
                        <div className="mt-auto pt-6 border-t border-theme-border">
                            <h3 className="font-semibold text-theme-text mb-3">About this product</h3>
                            <ul className="space-y-2 text-sm text-theme-text-muted">
                                <li>✓ Fresh from our boats daily</li>
                                <li>✓ Temperature controlled delivery</li>
                                <li>✓ Premium quality guaranteed</li>
                                <li>✓ Same day delivery available</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
