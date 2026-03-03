import type { Metadata } from 'next';
import Link from 'next/link';
import { Anchor, Handshake, Globe, Truck, Phone, Mail, Fish, MapPin, Waves, Package, Shell } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Our Partners | Tasman Star Seafoods',
    description: 'Discover Tasman Star\'s trusted supply chain partners — from the Sydney Fish Market to local commercial fishers across Australia\'s east coast.',
    openGraph: {
        title: 'Our Partners | Tasman Star Seafoods',
        description: 'Trusted partnerships powering Australia\'s freshest seafood supply chain.',
        type: 'website',
    },
};

const PARTNERS = [
    {
        icon: Fish,
        title: 'HUON Aquaculture Pty Ltd',
        description: 'Tasmania\'s premier salmon and ocean trout producer, delivering sustainably farmed fish renowned for quality and freshness.',
    },
    {
        icon: Waves,
        title: 'KB Seafood Co',
        description: 'Specialist seafood supplier providing a wide range of premium fresh and frozen products to the Australian market.',
    },
    {
        icon: Package,
        title: 'Markwell Foods',
        description: 'Leading food distributor supplying quality seafood and specialty products with reliable cold-chain logistics.',
    },
    {
        icon: Shell,
        title: 'Coral Coast',
        description: 'Sourcing the finest wild-caught seafood from Australia\'s pristine coral coast waters for retail and wholesale.',
    },
    {
        icon: Fish,
        title: 'Minastream Aquaculture QLD Pty Ltd',
        description: 'Queensland-based aquaculture specialists farming sustainable prawns and barramundi for the domestic market.',
    },
    {
        icon: Anchor,
        title: 'Poulos Bros Seafood',
        description: 'One of Australia\'s largest family-owned seafood wholesalers, operating from the Sydney Fish Market since 1985.',
    },
    {
        icon: Shell,
        title: 'Sea Pearl Pty Ltd',
        description: 'Premium shellfish and mollusc supplier, delivering oysters, mussels, and specialty shell products Australia-wide.',
    },
    {
        icon: Globe,
        title: 'Australia Bay Seafood',
        description: 'National seafood supplier connecting coastal fisheries with retailers and restaurants across every state.',
    },
];

const MARQUEE_PARTNERS = [
    { name: 'Sydney Fish Market', icon: Anchor, color: 'text-blue-400' },
    { name: 'HUON Aquaculture', icon: Fish, color: 'text-teal-400' },
    { name: 'KB Seafood Co', icon: Waves, color: 'text-blue-400' },
    { name: 'Markwell Foods', icon: Package, color: 'text-orange-400' },
    { name: 'Coral Coast', icon: Shell, color: 'text-pink-400' },
    { name: 'Minastream Aquaculture', icon: Fish, color: 'text-green-400' },
    { name: 'Poulos Bros Seafood', icon: Anchor, color: 'text-indigo-400' },
    { name: 'Sea Pearl', icon: Shell, color: 'text-purple-400' },
    { name: 'Australia Bay Seafood', icon: Globe, color: 'text-cyan-400' },
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

                {/* ── Animated Marquee ── */}
                <section className="w-full overflow-hidden py-12 flex flex-col items-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-theme-text tracking-tight">
                        Our Supply Partners
                    </h2>
                    <p className="text-theme-text-muted text-center mb-14 max-w-lg">
                        The trusted partners powering our seafood supply chain.
                    </p>

                    <div className="relative w-full overflow-hidden">
                        {/* fade masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

                        {/* scrolling track */}
                        <div
                            className="flex w-max items-center gap-16 md:gap-24 py-4"
                            style={{
                                animation: 'marquee 25s linear infinite',
                            }}
                        >
                            {[...MARQUEE_PARTNERS, ...MARQUEE_PARTNERS].map((p, i) => {
                                const Icon = p.icon;
                                return (
                                    <div
                                        key={`${p.name}-${i}`}
                                        className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-default select-none"
                                    >
                                        <Icon size={30} className={p.color} strokeWidth={1.5} />
                                        <span className="text-xl md:text-2xl font-bold text-theme-text whitespace-nowrap">
                                            {p.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Partner Grid */}
                <section>
                    <h2 className="font-serif text-3xl font-bold text-theme-text text-center mb-4">Our Supply Chain</h2>
                    <p className="text-theme-text-muted text-center mb-12 max-w-2xl mx-auto">
                        Tasman Star works with a carefully selected network of partners who share our commitment to quality, freshness, and sustainability.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PARTNERS.map((partner) => {
                            const Icon = partner.icon;
                            return (
                                <div key={partner.title} className="bg-theme-secondary rounded-2xl border border-theme-border p-8 shadow-sm hover:shadow-lg transition-shadow group">
                                    <div className="w-14 h-14 rounded-full bg-[#FF8543]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon size={28} className="text-[#FF8543]" />
                                    </div>
                                    <h3 className="font-serif text-xl font-bold text-theme-text mb-2">{partner.title}</h3>
                                    <p className="text-theme-text-muted">{partner.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Sydney Fish Market highlight */}
                <section className="bg-theme-secondary rounded-3xl border border-theme-border overflow-hidden flex flex-col md:flex-row group">
                    <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                        <p className="text-[#FF8543] font-bold tracking-widest uppercase text-xs mb-3">Key Partnership</p>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-theme-text mb-4">Sydney Fish Market</h2>
                        <p className="text-theme-text-muted leading-relaxed mb-4">
                            As the largest commercial fish market in the southern hemisphere, the Sydney Fish Market is a critical link in our supply chain. Fresh seafood arrives daily, giving us access to the widest variety of Australian species.
                        </p>
                        <p className="text-theme-text-muted leading-relaxed">
                            This partnership allows Tasman Star to offer premium species that aren&apos;t available through local waters alone — from Tasmanian salmon to Spencer Gulf prawns and beyond.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 min-h-[300px] overflow-hidden">
                        <img
                            src="/assets/products/trucks-sydney-fish-market.webp"
                            alt="Fresh seafood at market"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
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
