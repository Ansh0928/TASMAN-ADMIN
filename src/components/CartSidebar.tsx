'use client';

import React from 'react';
import { useCart } from './CartProvider';
import { X, Minus, Plus, Trash2 } from 'lucide-react';

export default function CartSidebar() {
    const {
        items,
        isCartLoading,
        isCartSideBarOpen,
        setCartSideBarOpen,
        removeItem,
        updateQuantity,
        subtotal,
    } = useCart();

    if (!isCartSideBarOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                onClick={() => setCartSideBarOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-black z-[61] shadow-2xl flex flex-col transform transition-transform duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="font-serif text-2xl font-bold">Your Cart</h2>
                    <button
                        onClick={() => setCartSideBarOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-black"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Loading State */}
                {isCartLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            </div>
                            <p className="text-lg">Your cart is empty.</p>
                            <button
                                onClick={() => setCartSideBarOpen(false)}
                                className="text-theme-accent font-bold hover:underline"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                {/* Image */}
                                <div className="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0 relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200" />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h3 className="font-bold text-black font-sans leading-tight">{item.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{item.unit}</p>
                                        </div>
                                        <p className="font-bold text-black shrink-0">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:text-theme-accent active:text-theme-accent transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:text-theme-accent active:text-theme-accent transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2.5 text-slate-400 hover:text-red-500 active:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-slate-100 p-6 bg-white flex flex-col gap-4">
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-slate-500 pb-2">Shipping and taxes calculated at checkout.</p>
                        <a
                            href="/checkout"
                            className="bg-theme-accent hover:bg-theme-accent/90 active:bg-theme-accent/80 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-colors shadow-md text-lg w-full"
                        >
                            Proceed to Checkout
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}
