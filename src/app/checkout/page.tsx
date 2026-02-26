'use client';

import { useCart } from '@/components/CartProvider';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const [fulfillment, setFulfillment] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
    });

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
    const tax = (subtotal + deliveryFee) * 0.1; // 10% tax
    const total = subtotal + deliveryFee + tax;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

            if (fulfillment === 'PICKUP' && !formData.pickupTime) {
                setError('Please select a pickup time');
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
                    pickupTime: fulfillment === 'PICKUP' ? new Date(formData.pickupTime).toISOString() : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to create checkout session');
                return;
            }

            // Redirect to Stripe
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
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

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="md:col-span-2">
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
                                                className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pickup Time */}
                            {fulfillment === 'PICKUP' && (
                                <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-theme-text mb-4">Pickup Time</h2>
                                    <div>
                                        <label className="block text-sm font-medium text-theme-text mb-1">Select pickup time *</label>
                                        <input
                                            type="datetime-local"
                                            name="pickupTime"
                                            value={formData.pickupTime}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-theme-border rounded-lg bg-theme-primary text-theme-text focus:outline-none focus:border-theme-accent"
                                        />
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
                    <div>
                        <div className="bg-theme-secondary border border-theme-border rounded-lg p-6 sticky top-4">
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

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-theme-text-muted">Subtotal</span>
                                    <span className="text-theme-text">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-theme-text-muted">Delivery</span>
                                    <span className="text-theme-text">${deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-theme-text-muted">Tax</span>
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
            </div>
        </div>
    );
}
