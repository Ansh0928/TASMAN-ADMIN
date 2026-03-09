import type { Metadata } from 'next';
import Link from 'next/link';
import { Handshake, Mail } from 'lucide-react';
import { SpinningLogos } from '@/components/ui/spinning-logos';
import { LogoCloud } from '@/components/ui/logo-cloud';

export const metadata: Metadata = {
    title: 'Our Partners',
    description: 'Discover Tasman Star\'s trusted supply chain partners — from the Sydney Fish Market to local commercial fishers across Australia\'s east coast.',
    alternates: { canonical: '/our-partner' },
    openGraph: {
        title: 'Our Partners | Tasman Star Seafoods',
        description: 'Trusted partnerships powering Australia\'s freshest seafood supply chain.',
        type: 'website',
    },
};

const partnerLogos = [
    {
        src: '/assets/partners/sydney-fish-market.svg',
        alt: 'Sydney Fish Market Logo',
        label: 'Sydney Fish Market',
    },
    {
        src: '/assets/partners/pacific-west.png',
        alt: 'Pacific West Logo',
        label: 'Pacific West',
    },
    {
        src: '/assets/partners/tasman-star.png',
        alt: 'Tasman Star Seafoods Logo',
        label: 'Tasman Star Seafoods',
    },
];

export default function OurPartnerPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero */}
            <div className="w-full bg-[#0A192F] py-16 md:py-24 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FF8543]/10 blur-[100px] rounded-full"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm text-white mb-6 uppercase tracking-widest">
                        <Handshake size={14} /> Partnerships
                    </div>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">Our Partners</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                        Trusted partnerships across the seafood industry — from fishers to freight — powering Australia&apos;s freshest supply chain.
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-8 py-16 max-w-5xl flex flex-col gap-16">

                {/* Partner Logo Cloud */}
                <section className="flex flex-col items-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-theme-text tracking-tight">
                        Our Supply Partners
                    </h2>
                    <p className="text-theme-text-muted text-center mb-4 max-w-lg">
                        The trusted partners powering our seafood supply chain.
                    </p>
                    <LogoCloud logos={partnerLogos} />
                </section>

                {/* Spinning Partner Logos */}
                <section className="flex flex-col items-center">
                    <SpinningLogos />
                </section>

                {/* Become a Partner CTA */}
                <section className="bg-[#0A192F] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <Handshake size={40} className="text-[#FF8543] mx-auto mb-6" />
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Partner With Us</h2>
                        <p className="text-xl text-slate-300 mb-10">
                            Interested in becoming a supply partner or wholesale customer? We&apos;d love to hear from you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/wholesale/apply" className="flex items-center justify-center gap-3 bg-[#FF8543] hover:bg-[#E2743A] text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-lg">
                                <Handshake size={20} /> Apply for Wholesale
                            </Link>
                            <a href="mailto:info@tasmanstar.com.au" className="flex items-center justify-center gap-3 bg-transparent border border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                                <Mail size={20} /> Contact Us
                            </a>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
