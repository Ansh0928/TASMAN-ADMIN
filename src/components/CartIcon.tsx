'use client';

import { useCart } from './CartProvider';

export default function CartIcon() {
    const { itemCount, isCartLoading, setCartSideBarOpen } = useCart();

    return (
        <button
            onClick={() => setCartSideBarOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-black px-3 py-2.5 lg:px-5 lg:py-3 rounded-full font-bold transition-transform hover:scale-105 text-sm font-sans shadow-lg relative"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="hidden lg:inline">Cart</span>
            {(!isCartLoading && itemCount > 0) && (
                <span className="bg-[#FF8543] text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full ml-1">
                    {itemCount}
                </span>
            )}
        </button>
    );
}
