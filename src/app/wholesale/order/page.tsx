'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Trash2, ChevronLeft, CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import Link from 'next/link';

interface WholesaleItem {
    id: string;
    name: string;
    unit: string;
    price: string;
    isAvailable: boolean;
    isTodaysSpecial?: boolean;
}

interface WholesaleCategory {
    id: string;
    name: string;
    items: WholesaleItem[];
}

interface CartItem {
    itemId: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
}

interface WholesaleOrder {
    id: string;
    status: string;
    notes?: string;
    adminNotes?: string;
    createdAt: string;
    items: { quantity: number; unitPrice: string; total: string; wholesalePriceItem: { name: string; unit: string } }[];
}

export default function WholesaleOrderPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [categories, setCategories] = useState<WholesaleCategory[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [orders, setOrders] = useState<WholesaleOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') { router.push('/wholesale/login'); return; }

        Promise.all([
            fetch('/api/wholesale/prices').then(r => r.ok ? r.json() : []),
            fetch('/api/wholesale/orders').then(r => r.ok ? r.json() : []),
        ]).then(([cats, ords]) => {
            setCategories(cats || []);
            setOrders(ords || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [status, router]);

    const addToCart = (item: WholesaleItem) => {
        setCart(prev => {
            const existing = prev.find(c => c.itemId === item.id);
            if (existing) {
                return prev.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { itemId: item.id, name: item.name, unit: item.unit, price: parseFloat(item.price), quantity: 1 }];
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(c => {
            if (c.itemId !== itemId) return c;
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : c;
        }));
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(c => c.itemId !== itemId));
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

    const submitOrder = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/wholesale/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(c => ({ wholesalePriceItemId: c.itemId, quantity: c.quantity })),
                    notes,
                }),
            });
            if (res.ok) {
                setSubmitted(true);
                setCart([]);
                setNotes('');
                // Refresh orders
                const ords = await fetch('/api/wholesale/orders').then(r => r.json());
                setOrders(ords || []);
            }
        } catch (err) {
            console.error('Submit order error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const statusIcon = (s: string) => {
        switch (s) {
            case 'CONFIRMED': return <CheckCircle size={16} className="text-green-500" />;
            case 'REJECTED': return <XCircle size={16} className="text-red-500" />;
            case 'COMPLETED': return <Package size={16} className="text-blue-500" />;
            default: return <Clock size={16} className="text-yellow-500" />;
        }
    };

    if (status === 'loading' || loading) {
        return <div className="min-h-screen bg-theme-primary flex items-center justify-center"><p className="text-theme-text-muted">Loading...</p></div>;
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-theme-primary">
                <div className="container mx-auto px-4 py-12 max-w-lg text-center">
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-theme-text mb-2">Order Submitted</h1>
                    <p className="text-theme-text-muted mb-6">Your wholesale order request has been submitted. We&apos;ll review it and get back to you shortly.</p>
                    <button onClick={() => setSubmitted(false)} className="bg-theme-accent text-white px-6 py-2 rounded-lg hover:bg-theme-accent/90">
                        Place Another Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-8">
                <Link href="/wholesale/prices" className="flex items-center gap-1 text-theme-accent hover:underline mb-6">
                    <ChevronLeft size={16} /> Back to Price List
                </Link>

                <h1 className="text-3xl font-bold text-theme-text mb-6">Wholesale Order</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-theme-border">
                    <button onClick={() => setActiveTab('order')}
                        className={`pb-2 px-1 font-medium ${activeTab === 'order' ? 'text-theme-accent border-b-2 border-theme-accent' : 'text-theme-text-muted'}`}>
                        New Order
                    </button>
                    <button onClick={() => setActiveTab('history')}
                        className={`pb-2 px-1 font-medium ${activeTab === 'history' ? 'text-theme-accent border-b-2 border-theme-accent' : 'text-theme-text-muted'}`}>
                        Order History ({orders.length})
                    </button>
                </div>

                {activeTab === 'order' ? (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Product Selection */}
                        <div className="lg:col-span-2 space-y-4">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-theme-secondary border border-theme-border rounded-lg overflow-hidden">
                                    <div className="px-4 py-3 border-b border-theme-border">
                                        <h3 className="font-bold text-theme-text">{cat.name}</h3>
                                    </div>
                                    <div className="divide-y divide-theme-border/30">
                                        {cat.items.filter(i => i.isAvailable).map(item => {
                                            const inCart = cart.find(c => c.itemId === item.id);
                                            return (
                                                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                                                    <div>
                                                        <p className="text-theme-text font-medium">{item.name}</p>
                                                        <p className="text-sm text-theme-text-muted">{item.unit} &bull; ${parseFloat(item.price).toFixed(2)}</p>
                                                    </div>
                                                    {inCart ? (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-theme-text-muted hover:text-theme-text"><Minus size={16} /></button>
                                                            <span className="text-theme-text w-8 text-center">{inCart.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-theme-text-muted hover:text-theme-text"><Plus size={16} /></button>
                                                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-300 ml-1"><Trash2 size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => addToCart(item)} className="flex items-center gap-1 px-3 py-1.5 bg-theme-accent/10 text-theme-accent rounded text-sm hover:bg-theme-accent/20">
                                                            <Plus size={14} /> Add
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-theme-secondary border border-theme-border rounded-lg p-4 sticky top-24">
                                <h3 className="font-bold text-theme-text mb-3 flex items-center gap-2">
                                    <ShoppingCart size={18} /> Order Summary
                                </h3>
                                {cart.length === 0 ? (
                                    <p className="text-theme-text-muted text-sm">No items added yet</p>
                                ) : (
                                    <>
                                        <div className="space-y-2 mb-4">
                                            {cart.map(item => (
                                                <div key={item.itemId} className="flex justify-between text-sm">
                                                    <span className="text-theme-text">{item.name} x{item.quantity}</span>
                                                    <span className="text-theme-text-muted">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-theme-border pt-3 flex justify-between font-bold text-theme-text">
                                            <span>Estimated Total</span>
                                            <span className="text-theme-accent">${cartTotal.toFixed(2)}</span>
                                        </div>
                                        <textarea
                                            rows={3}
                                            placeholder="Order notes (optional)"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full mt-3 px-3 py-2 bg-theme-primary border border-theme-border rounded-lg text-theme-text text-sm focus:border-theme-accent focus:outline-none"
                                        />
                                        <button onClick={submitOrder} disabled={submitting}
                                            className="w-full mt-3 bg-theme-accent text-white py-2 rounded-lg hover:bg-theme-accent/90 disabled:opacity-50">
                                            {submitting ? 'Submitting...' : 'Submit Order Request'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Order History */
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <p className="text-theme-text-muted text-center py-8">No orders yet</p>
                        ) : orders.map(order => (
                            <div key={order.id} className="bg-theme-secondary border border-theme-border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {statusIcon(order.status)}
                                        <span className="font-bold text-theme-text">#{order.id.slice(-8).toUpperCase()}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            order.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                            order.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>{order.status}</span>
                                    </div>
                                    <span className="text-theme-text-muted text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="space-y-1">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-theme-text">{item.wholesalePriceItem.name} x{item.quantity}</span>
                                            <span className="text-theme-text-muted">${parseFloat(item.total).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-theme-border/30 mt-2 pt-2 flex justify-between font-bold text-sm">
                                    <span className="text-theme-text">Total</span>
                                    <span className="text-theme-accent">${order.items.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2)}</span>
                                </div>
                                {order.adminNotes && (
                                    <p className="text-sm text-theme-text-muted mt-2 italic">Admin: {order.adminNotes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
