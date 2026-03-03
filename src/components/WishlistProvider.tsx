'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface WishlistContextType {
    wishlist: string[];
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'tasman_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (stored) {
                setWishlist(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
        }
    }, [wishlist, loaded]);

    const addToWishlist = useCallback((productId: string) => {
        setWishlist(prev => {
            if (prev.includes(productId)) return prev;
            return [...prev, productId];
        });
        toast.success('Added to wishlist');
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
    }, []);

    const isInWishlist = useCallback((productId: string) => {
        return wishlist.includes(productId);
    }, [wishlist]);

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            wishlistCount,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
