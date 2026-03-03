'use client';

import { useCart } from '@/components/CartProvider';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Check, Tag, X, CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RecommendedProduct {
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

function CheckoutRecommendationCard({ product }: { product: RecommendedProduct }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
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
        <div className="flex-shrink-0 w-[160px] sm:w-[180px]">
            <Link
                href={`/product/${product.slug}`}
                className="block bg-theme-secondary rounded-xl overflow-hidden border border-theme-border hover:border-theme-accent transition-all group"
            >
                <div className="relative aspect-square bg-theme-tertiary overflow-hidden">
                    {product.imageUrls && product.imageUrls[0] ? (
                        <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🐟</div>
                    )}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs font-bold bg-red-500 px-2 py-0.5 rounded-full">Out of Stock</span>
                        </div>
                    )}
                </div>
                <div className="p-2">
                    <h4 className="text-theme-text font-semibold text-xs leading-tight line-clamp-2 mb-1 group-hover:text-theme-accent transition-colors">
                        {product.name}
                    </h4>
                    <div className="flex items-center justify-between gap-1">
                        <span className="text-theme-accent font-bold text-sm">
                            ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {!isOutOfStock && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAdd();
                                }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all ${
                                    added ? 'bg-emerald-500 scale-110' : 'bg-theme-accent hover:scale-110'
                                }`}
                                aria-label="Add to cart"
                            >
                                {added ? <Check size={14} /> : '+'}
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { items, subtotal, clearCart } = useCart();
    const [fulfillment, setFulfillment] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{
        couponId: string;
        name: string;
        percentOff: number | null;
        amountOff: number | null;
    } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postcode: '',
        pickupTime: '',
        notes: '',
    });

    const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; street: string; city: string; state: string; postcode: string; isDefault: boolean }>>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');

    const [pickupDate, setPickupDate] = useState<Date | undefined>();
    const [pickupTime, setPickupTime] = useState('10:00');

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || session.user.name || '',
                email: prev.email || session.user.email || '',
            }));

            fetch('/api/addresses')
                .then(res => res.json())
                .then((addresses) => {
                    if (Array.isArray(addresses) && addresses.length > 0) {
                        setSavedAddresses(addresses);
                        const defaultAddr = addresses.find((a: { isDefault: boolean }) => a.isDefault) || addresses[0];
                        if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.id);
                            setFormData(prev => ({
                                ...prev,
                                street: prev.street || defaultAddr.street,
                                city: prev.city || defaultAddr.city,
                                state: prev.state || defaultAddr.state,
                                postcode: prev.postcode || defaultAddr.postcode,
                            }));
                        }
                    }
                })
                .catch(() => {});
        }
    }, [session]);

    // Fetch cart-based recommendations
    useEffect(() => {
        if (items.length === 0) return;

        const productIds = items.map(item => item.productId);

        fetch('/api/products/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds }),
        })
            .then(res => res.json())
            .then(data => {
                setRecommendations(data.recommendations || []);
            })
            .catch(err => {
                console.error('Failed to fetch recommendations:', err);
            });
    }, [items.length]); // refetch when cart item count changes

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-theme-primary">
                <div className="container mx-auto px-4 py-12">
                    <Link href="/" className="flex items-center gap-1 text-theme-accent hover:underline mb-8">
                        <ChevronLeft size={16} />
                        Back to Shopping
                    </Link>
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-theme-text">Your cart is empty</h1>
                        <p className="text-theme-text-muted">Add some seafood to get started!</p>
                        <Link
                            href="/our-products"
                            className="inline-block px-6 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const deliveryFee = fulfillment === 'DELIVERY' ? 10 : 0;
    const discount = appliedCoupon
        ? appliedCoupon.percentOff
            ? subtotal * (appliedCoupon.percentOff / 100)
            : appliedCoupon.amountOff
                ? Math.min(appliedCoupon.amountOff, subtotal)
                : 0
        : 0;
    const tax = (subtotal + deliveryFee - discount) * 0.1;
    const total = subtotal + deliveryFee - discount + tax;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const res = await fetch('/api/checkout/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode.trim() }),
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedCoupon({
                    couponId: data.couponId,
                    name: data.name,
                    percentOff: data.percentOff,
                    amountOff: data.amountOff,
                });
                setCouponError('');
            } else {
                setCouponError(data.message || 'Invalid code');
                setAppliedCoupon(null);
            }
        } catch {
            setCouponError('Failed to validate code');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Validate form
            if (!formData.email || !formData.name || !formData.phone) {
                setError('Please fill in all required fields');
                setIsLoading(false);
                return;
            }

            if (fulfillment === 'DELIVERY' && (!formData.street || !formData.city || !formData.state || !formData.postcode)) {
                setError('Please provide a delivery address');
                setIsLoading(false);
                return;
            }

            if (fulfillment === 'PICKUP' && !pickupDate) {
                setError('Please select a pickup date');
                toast.error('Please select a pickup date');
                setIsLoading(false);
                return;
            }

            // Create checkout session
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    fulfillment,
                    subtotal,
                    deliveryFee,
                    tax,
                    total,
                    guestEmail: formData.email,
                    guestName: formData.name,
                    guestPhone: formData.phone,
                    deliveryStreet: fulfillment === 'DELIVERY' ? formData.street : null,
                    deliveryCity: fulfillment === 'DELIVERY' ? formData.city : null,
                    deliveryState: fulfillment === 'DELIVERY' ? formData.state : null,
                    deliveryPostcode: fulfillment === 'DELIVERY' ? formData.postcode : null,
                    pickupTime: fulfillment === 'PICKUP' && pickupDate
                        ? (() => { const [h, m] = pickupTime.split(':').map(Number); const d = new Date(pickupDate); d.setHours(h, m, 0, 0); return d.toISOString(); })()
                        : null,
                    discountCode: appliedCoupon ? couponCode.trim() : null,
                    notes: formData.notes.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data.message || 'Failed to create checkout session';
                setError(msg);
                toast.error(msg);
                return;
            }

            // Redirect to Stripe
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            toast.error('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <Link href="/our-products" className="flex items-center gap-1 text-theme-accent hover:underline mb-8">
                    <ChevronLeft size={16} />
                    Back to Shopping
                </Link>

                <h1 className="text-4xl font-bold text-theme-text mb-8">Checkout</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-500">
                        {error}
                    </div>
                )}

                <div className="flex flex-col-reverse lg:flex-row gap-8">
                    {/* Checkout Form */}
                    <div className="flex-1 lg:flex-[2]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Info */}
                            <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                                <h2 className="text-xl font-bold text-theme-text mb-4">Contact Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-theme-text mb-1">Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-theme-text mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-theme-text mb-1">Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            pattern="^(\+?61|0)[2-478]\d{8}$"
                                            title="Australian phone number (e.g. 0412345678 or +61412345678)"
                                            placeholder="0412 345 678"
                                            className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fulfillment */}
                            <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                                <h2 className="text-xl font-bold text-theme-text mb-4">Fulfillment</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="fulfillment"
                                            value="DELIVERY"
                                            checked={fulfillment === 'DELIVERY'}
                                            onChange={(e) => setFulfillment(e.target.value as 'DELIVERY' | 'PICKUP')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-theme-text font-medium">Delivery (+$10)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="fulfillment"
                                            value="PICKUP"
                                            checked={fulfillment === 'PICKUP'}
                                            onChange={(e) => setFulfillment(e.target.value as 'DELIVERY' | 'PICKUP')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-theme-text font-medium">Pickup (Free)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            {fulfillment === 'DELIVERY' && (
                                <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-theme-text mb-4">Delivery Address</h2>
                                    <div className="space-y-4">
                                        {savedAddresses.length > 0 && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-theme-text mb-1">Saved Addresses</label>
                                                <select
                                                    value={selectedAddressId}
                                                    onChange={(e) => {
                                                        const addr = savedAddresses.find(a => a.id === e.target.value);
                                                        if (addr) {
                                                            setSelectedAddressId(addr.id);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                street: addr.street,
                                                                city: addr.city,
                                                                state: addr.state,
                                                                postcode: addr.postcode,
                                                            }));
                                                        } else {
                                                            setSelectedAddressId('');
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                                >
                                                    {savedAddresses.map(addr => (
                                                        <option key={addr.id} value={addr.id}>
                                                            {addr.street}, {addr.city} {addr.state} {addr.postcode}
                                                            {addr.isDefault ? ' (Default)' : ''}
                                                        </option>
                                                    ))}
                                                    <option value="">Enter new address</option>
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-theme-text mb-1">Street *</label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-theme-text mb-1">City *</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-theme-text mb-1">State *</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-theme-text mb-1">Postcode *</label>
                                            <input
                                                type="text"
                                                name="postcode"
                                                value={formData.postcode}
                                                onChange={handleInputChange}
                                                required
                                                maxLength={4}
                                                pattern="[0-9]{4}"
                                                title="4-digit Australian postcode"
                                                placeholder="4215"
                                                className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                            />
                                        </div>
                                    </div>

                                    {/* Delivery Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-theme-text mb-1">Delivery Notes (optional)</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={2}
                                            placeholder="E.g., Leave at front door, ring bell, gate code..."
                                            className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pickup Date & Time */}
                            {fulfillment === 'PICKUP' && (
                                <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-theme-text mb-4">Pickup Date & Time</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-theme-text mb-2">Select date *</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={`w-full flex items-center gap-2 px-4 py-2.5 border border-theme-border rounded-lg bg-theme-primary text-left transition-colors hover:border-theme-accent focus:outline-none focus:border-theme-accent ${
                                                            pickupDate ? 'text-theme-text' : 'text-theme-text-muted'
                                                        }`}
                                                    >
                                                        <CalendarIcon size={16} className="text-theme-accent shrink-0" />
                                                        {pickupDate ? format(pickupDate, 'EEEE, d MMMM yyyy') : 'Pick a date'}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={pickupDate}
                                                        onSelect={setPickupDate}
                                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-theme-text mb-2">Select time *</label>
                                            <div className="relative">
                                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-accent" />
                                                <select
                                                    value={pickupTime}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent appearance-none cursor-pointer"
                                                >
                                                    {Array.from({ length: 19 }, (_, i) => {
                                                        const hour = Math.floor(i / 2) + 7;
                                                        const min = i % 2 === 0 ? '00' : '30';
                                                        const val = `${hour.toString().padStart(2, '0')}:${min}`;
                                                        const label = `${hour > 12 ? hour - 12 : hour}:${min} ${hour >= 12 ? 'PM' : 'AM'}`;
                                                        return <option key={val} value={val}>{label}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <p className="text-xs text-theme-text-muted mt-1">Store hours: 7:00 AM – 4:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-theme-accent text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:flex-1 lg:max-w-sm">
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6 lg:sticky lg:top-24">
                            <h2 className="text-xl font-bold text-theme-text mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4 pb-4 border-b border-theme-border">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-theme-text-muted">
                                            {item.name} x {item.quantity}
                                        </span>
                                        <span className="text-theme-text font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Code */}
                            <div className="mb-4 pb-4 border-b border-theme-border">
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Tag size={14} className="text-emerald-400" />
                                            <span className="text-emerald-400 text-sm font-medium">{appliedCoupon.name}</span>
                                        </div>
                                        <button onClick={removeCoupon} className="text-theme-text-muted hover:text-red-400 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Discount code"
                                                className="flex-1 px-3 py-1.5 text-sm border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="px-3 py-1.5 text-sm bg-theme-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                                            >
                                                {couponLoading ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-red-400 text-xs mt-1">{couponError}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-theme-text-muted">Subtotal</span>
                                    <span className="text-theme-text">${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-400">Discount</span>
                                        <span className="text-emerald-400">-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-theme-text-muted">Delivery</span>
                                    <span className="text-theme-text">${deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-theme-text-muted">GST (10%)</span>
                                    <span className="text-theme-text">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-theme-border">
                                    <span className="font-bold text-theme-text">Total</span>
                                    <span className="font-bold text-theme-accent text-lg">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* You May Also Like - Cart Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-10 border-t border-theme-border pt-8">
                        <h2 className="text-2xl font-serif font-bold text-theme-text mb-2">You May Also Like</h2>
                        <p className="text-theme-text-muted text-sm mb-4">Add something extra to your order</p>
                        <div
                            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {recommendations.map((product) => (
                                <CheckoutRecommendationCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
