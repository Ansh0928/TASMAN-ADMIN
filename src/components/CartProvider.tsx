'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

export type CartItem = {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    unit: string;
    slug: string;
};

interface CartContextType {
    items: CartItem[];
    isCartLoading: boolean;
    isCartSideBarOpen: boolean;
    setCartSideBarOpen: (isOpen: boolean) => void;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tasman_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartLoading, setIsCartLoading] = useState(true);
    const [isCartSideBarOpen, setCartSideBarOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
        setIsCartLoading(false);
    }, []);

    // Persist cart to localStorage on change
    useEffect(() => {
        if (!isCartLoading) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isCartLoading]);

    const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === item.productId);
            if (existing) {
                return prev.map(i =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, { ...item, id: crypto.randomUUID() }];
        });
        toast.success(`${item.name} added to cart`);
        setCartSideBarOpen(true);
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(i => i.id !== id));
        } else {
            setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
        }
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            isCartLoading,
            isCartSideBarOpen,
            setCartSideBarOpen,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            itemCount,
            subtotal,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
