import type { Metadata } from 'next';
import { Globe } from 'lucide-react';
import OnlineDeliveryProducts from './OnlineDeliveryProducts';
import DeliveryZones from './DeliveryZones';

export const metadata: Metadata = {
    title: 'Online & Delivery',
    description: 'Order premium seafood online and get it delivered fresh to your door on the Gold Coast. Free delivery on orders over $150.',
    alternates: { canonical: '/our-business/online-delivery' },
    openGraph: {
        title: 'Online & Delivery | Tasman Star Seafoods',
        description: 'Premium seafood delivered fresh to your door. Order online and enjoy restaurant-quality seafood at home.',
        type: 'website',
    },
};

export default function OnlineDeliveryPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero */}
            <div className="w-full bg-[#0A192F] py-12 md:py-16 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FF8543]/10 blur-[100px] rounded-full"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm text-white mb-4 uppercase tracking-widest">
                        <Globe size={14} /> Online Store
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">Shop Fresh Seafood</h1>
                    <p className="text-lg text-slate-300 font-light max-w-2xl mx-auto">
                        Premium Australian seafood delivered fresh to your door. Browse, add to cart, and checkout in minutes.
                    </p>
                </div>
            </div>

            {/* Delivery Zones */}
            <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
                <DeliveryZones />
            </div>

            {/* Product Browsing */}
            <OnlineDeliveryProducts />
        </div>
    );
}
