import type { Metadata } from 'next';
import { ShoppingBag } from 'lucide-react';
import OnlineDeliveryProducts from '@/app/our-business/online-delivery/OnlineDeliveryProducts';

export const metadata: Metadata = {
    title: 'Our Products',
    description: 'Browse our full range of premium Australian seafood — prawns, fish fillets, oysters, crabs, shellfish and more. Gold Coast\'s freshest catch.',
    alternates: { canonical: '/our-products' },
    openGraph: {
        title: 'Our Products | Tasman Star Seafoods',
        description: 'Browse premium Australian seafood. Fresh from the trawler to your table.',
        type: 'website',
    },
};

export default function OurProductsPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero */}
            <div className="w-full bg-[#0A192F] py-12 md:py-16 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FF8543]/10 blur-[100px] rounded-full"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm text-white mb-4 uppercase tracking-widest">
                        <ShoppingBag size={14} /> Our Products
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">Our Products</h1>
                    <p className="text-lg text-slate-300 font-light max-w-2xl mx-auto">
                        Browse our full range of premium Australian seafood — fresh from the trawler to your table.
                    </p>
                </div>
            </div>

            {/* Product Browsing */}
            <OnlineDeliveryProducts />
        </div>
    );
}
