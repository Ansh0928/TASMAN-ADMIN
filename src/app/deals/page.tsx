import type { Metadata } from 'next';
import Link from 'next/link';
import { Flame, Clock, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { DealsGrid } from './DealsGrid';

export const metadata: Metadata = {
    title: 'Deals & Specials | Tasman Star Seafoods',
    description: 'Discover daily deals and special offers on premium fresh seafood from Tasman Star. Updated daily at 6 AM AEST.',
    openGraph: {
        title: 'Deals & Specials | Tasman Star Seafoods',
        description: 'Fresh from the boats, straight to your table. Grab these limited-time deals.',
        type: 'website',
    },
};

export default async function DealsPage() {
    const products = await prisma.product.findMany({
        where: { isTodaysSpecial: true, isAvailable: true },
        include: { category: true },
        take: 12,
    });

    const serialized = products.map((p, i) => {
        const price = Number(p.price);
        const discount = [10, 15, 20, 25, 30][i % 5];
        const salePrice = price * (1 - discount / 100);
        return {
            slug: p.slug,
            name: p.name,
            price: price.toFixed(2),
            salePrice: salePrice.toFixed(2),
            discount,
            imageUrl: p.imageUrls[0] || null,
            categoryName: p.category?.name || '',
        };
    });

    return (
        <div className="flex flex-col w-full bg-theme-primary min-h-screen transition-colors duration-300">

            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-[#0A192F] py-16 md:py-24 px-6">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#FF8543] blur-[100px]"></div>
                    <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-[#FF7F50] blur-[120px]"></div>
                </div>
                <div className="container mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#FF8543]/20 text-[#FF7F50] px-4 py-2 rounded-full text-sm font-bold mb-6 border border-[#FF8543]/30">
                        <Flame size={16} className="animate-pulse" />
                        Hot Deals
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
                        Today&apos;s <span className="text-[#FF7F50]">Specials</span>
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Fresh from the boats, straight to your table. Grab these limited-time deals before they&apos;re gone.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-400">
                        <Clock size={14} />
                        Updated daily at 6:00 AM AEST
                    </div>
                </div>
            </div>

            {/* Deals Grid */}
            <div className="container mx-auto px-4 md:px-6 py-12">
                <DealsGrid deals={serialized} />

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <div className="bg-[#0A192F] rounded-3xl p-10 border border-[#FF8543]/20 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#FF8543] blur-[80px] opacity-20"></div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 relative z-10">
                            Want fresh deals every day?
                        </h2>
                        <p className="text-slate-300 mb-6 relative z-10">
                            Visit our stores or check back daily — new specials drop every morning at 6 AM.
                        </p>
                        <Link
                            href="/our-products"
                            className="inline-flex items-center gap-2 bg-[#FF8543] hover:bg-[#E2743A] text-white font-bold px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105 relative z-10"
                        >
                            Browse All Products
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
