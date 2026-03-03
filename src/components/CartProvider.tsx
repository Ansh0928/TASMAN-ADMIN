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
    stockWarnings: Map<string, string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tasman_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartLoading, setIsCartLoading] = useState(true);
    const [isCartSideBarOpen, setCartSideBarOpen] = useState(false);
    const [stockWarnings, setStockWarnings] = useState<Map<string, string>>(new Map());

    // Load cart from localStorage on mount
    useEffect(() => {
        let loadedItems: CartItem[] = [];
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                loadedItems = JSON.parse(stored);
                setItems(loadedItems);
            }
        } catch {
            // ignore parse errors
        }
        setIsCartLoading(false);

        if (loadedItems.length > 0) {
            const ids = loadedItems.map(i => i.productId).join(',');
            fetch(`/api/products/stock?ids=${ids}`)
                .then(res => res.json())
                .then((data: Record<string, { stockQuantity: number; isAvailable: boolean }>) => {
                    const warnings = new Map<string, string>();
                    for (const item of loadedItems) {
                        const stock = data[item.productId];
                        if (!stock || !stock.isAvailable || stock.stockQuantity <= 0) {
                            warnings.set(item.productId, 'Out of stock');
                        } else if (stock.stockQuantity < item.quantity) {
                            warnings.set(item.productId, 'Only limited stock available');
                        }
                    }
                    setStockWarnings(warnings);
                })
                .catch(() => {});
        }
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
            stockWarnings,
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
