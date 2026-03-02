import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '@/components/CartProvider';

const CART_STORAGE_KEY = 'tasman_cart';

function wrapper({ children }: { children: React.ReactNode }) {
    return <CartProvider>{children}</CartProvider>;
}

const sampleItem = {
    productId: 'prod-1',
    name: 'Atlantic Salmon',
    price: 29.99,
    quantity: 1,
    image: 'https://example.com/salmon.jpg',
    unit: 'KG',
    slug: 'atlantic-salmon',
};

const anotherItem = {
    productId: 'prod-2',
    name: 'Tiger Prawns',
    price: 39.99,
    quantity: 2,
    image: 'https://example.com/prawns.jpg',
    unit: 'KG',
    slug: 'tiger-prawns',
};

describe('CartProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid-1' as `${string}-${string}-${string}-${string}-${string}`);
    });

    it('provides cart context to children', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.items).toEqual([]);
        expect(result.current.itemCount).toBe(0);
        expect(result.current.subtotal).toBe(0);
        expect(typeof result.current.addItem).toBe('function');
        expect(typeof result.current.removeItem).toBe('function');
        expect(typeof result.current.updateQuantity).toBe('function');
        expect(typeof result.current.clearCart).toBe('function');
    });

    it('addItem adds new item to cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toMatchObject({
            productId: 'prod-1',
            name: 'Atlantic Salmon',
            price: 29.99,
            quantity: 1,
        });
        expect(result.current.items[0].id).toBeDefined();
    });

    it('addItem merges quantity for existing product', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        act(() => {
            result.current.addItem({ ...sampleItem, quantity: 3 });
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(4); // 1 + 3
    });

    it('removeItem removes item by id', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        const itemId = result.current.items[0].id;

        act(() => {
            result.current.removeItem(itemId);
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('updateQuantity updates item quantity', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        const itemId = result.current.items[0].id;

        act(() => {
            result.current.updateQuantity(itemId, 5);
        });

        expect(result.current.items[0].quantity).toBe(5);
    });

    it('updateQuantity removes item if quantity <= 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        const itemId = result.current.items[0].id;

        act(() => {
            result.current.updateQuantity(itemId, 0);
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('updateQuantity removes item if quantity is negative', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        const itemId = result.current.items[0].id;

        act(() => {
            result.current.updateQuantity(itemId, -1);
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('clearCart empties the cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        act(() => {
            result.current.addItem(anotherItem);
        });

        expect(result.current.items).toHaveLength(2);

        act(() => {
            result.current.clearCart();
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('itemCount sums all quantities', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem); // quantity: 1
        });

        act(() => {
            result.current.addItem(anotherItem); // quantity: 2
        });

        expect(result.current.itemCount).toBe(3); // 1 + 2
    });

    it('subtotal calculates correctly', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem); // 29.99 * 1
        });

        act(() => {
            result.current.addItem(anotherItem); // 39.99 * 2
        });

        // 29.99 + (39.99 * 2) = 29.99 + 79.98 = 109.97
        expect(result.current.subtotal).toBeCloseTo(109.97, 2);
    });

    it('persists to localStorage', () => {
        const setItemSpy = vi.spyOn(localStorage, 'setItem');

        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.addItem(sampleItem);
        });

        expect(setItemSpy).toHaveBeenCalledWith(
            CART_STORAGE_KEY,
            expect.stringContaining('Atlantic Salmon')
        );

        setItemSpy.mockRestore();
    });

    it('loads from localStorage on mount', () => {
        const storedItems = [
            {
                id: 'stored-1',
                productId: 'prod-1',
                name: 'Stored Salmon',
                price: 29.99,
                quantity: 2,
                image: 'https://example.com/salmon.jpg',
                unit: 'KG',
                slug: 'stored-salmon',
            },
        ];

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedItems));

        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].name).toBe('Stored Salmon');
        expect(result.current.items[0].quantity).toBe(2);
    });

    it('useCart throws error outside provider', () => {
        // Suppress console.error for this test since React will log the error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useCart());
        }).toThrow('useCart must be used within a CartProvider');

        consoleSpy.mockRestore();
    });

    it('addItem opens the cart sidebar', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.isCartSideBarOpen).toBe(false);

        act(() => {
            result.current.addItem(sampleItem);
        });

        expect(result.current.isCartSideBarOpen).toBe(true);
    });

    it('setCartSideBarOpen controls sidebar visibility', () => {
        const { result } = renderHook(() => useCart(), { wrapper });

        act(() => {
            result.current.setCartSideBarOpen(true);
        });

        expect(result.current.isCartSideBarOpen).toBe(true);

        act(() => {
            result.current.setCartSideBarOpen(false);
        });

        expect(result.current.isCartSideBarOpen).toBe(false);
    });
});
