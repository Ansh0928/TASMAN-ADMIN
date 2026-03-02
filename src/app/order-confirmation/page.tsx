'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, FileText } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import PushNotificationPrompt from '@/components/PushNotificationPrompt';

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { clearCart } = useCart();
    const cartCleared = useRef(false);

    useEffect(() => {
        // Clear the cart once when the order confirmation page loads
        if (!cartCleared.current && orderId) {
            clearCart();
            cartCleared.current = true;
        }
    }, [orderId, clearCart]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const res = await fetch(`/api/orders/${orderId}`);
                const data = await res.json();
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-[100dvh] bg-theme-primary flex items-center justify-center">
                <p className="text-theme-text-muted">Loading order details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-theme-secondary border border-theme-border rounded-lg p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <CheckCircle size={64} className="text-green-500" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold text-theme-text mb-2">Order Confirmed!</h1>
                        <p className="text-theme-text-muted">Thank you for your order</p>
                    </div>

                    {order && (
                        <div className="space-y-6">
                            <div className="bg-theme-primary rounded-lg p-4 text-left">
                                <h2 className="text-lg font-bold text-theme-text mb-4">Order Details</h2>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-theme-text-muted">Order ID:</span>
                                        <span className="text-theme-text font-mono">{order.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-theme-text-muted">Customer:</span>
                                        <span className="text-theme-text">{order.guestName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-theme-text-muted">Email:</span>
                                        <span className="text-theme-text">{order.guestEmail}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-theme-border">
                                        <span className="text-theme-text-muted">Fulfillment:</span>
                                        <span className="text-theme-text capitalize">{order.fulfillment.toLowerCase()}</span>
                                    </div>

                                    {order.fulfillment === 'DELIVERY' && (
                                        <div className="flex justify-between pt-2">
                                            <span className="text-theme-text-muted">Delivery Address:</span>
                                            <span className="text-theme-text text-right">
                                                {order.deliveryStreet}
                                                <br />
                                                {order.deliveryCity}, {order.deliveryState} {order.deliveryPostcode}
                                            </span>
                                        </div>
                                    )}

                                    {order.fulfillment === 'PICKUP' && (
                                        <div className="flex justify-between pt-2">
                                            <span className="text-theme-text-muted">Pickup Time:</span>
                                            <span className="text-theme-text">
                                                {new Date(order.pickupTime).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-theme-primary rounded-lg p-4 text-left">
                                <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                                    <Package size={20} />
                                    Items
                                </h3>

                                <div className="space-y-2 text-sm">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between">
                                            <span className="text-theme-text-muted">
                                                {item.product?.name || 'Product'} x {item.quantity}
                                            </span>
                                            <span className="text-theme-text">${item.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-theme-primary rounded-lg p-4 text-left">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-theme-text-muted">Subtotal:</span>
                                        <span className="text-theme-text">${order.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-theme-text-muted">Delivery:</span>
                                        <span className="text-theme-text">${order.deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-theme-text-muted">Tax:</span>
                                        <span className="text-theme-text">${order.tax}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-theme-border font-bold">
                                        <span className="text-theme-text">Total:</span>
                                        <span className="text-theme-accent text-lg">${order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <Link
                            href="/"
                            className="inline-block px-6 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Back to Home
                        </Link>
                        <Link
                            href="/our-products"
                            className="inline-block px-6 py-2 border border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent/5 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                        {order?.stripeInvoiceUrl && (
                            <a
                                href={order.stripeInvoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2 border border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent/5 transition-colors"
                            >
                                <FileText size={16} />
                                Download Invoice
                            </a>
                        )}
                    </div>

                    <p className="text-sm text-theme-text-muted pt-4">
                        We've sent a confirmation email to {order?.guestEmail}
                    </p>

                    <PushNotificationPrompt />
                </div>
            </div>
        </div>
    );
}
