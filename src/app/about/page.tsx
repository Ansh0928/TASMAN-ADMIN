import type { Metadata } from 'next';
import { Anchor, Users, Truck, ShieldCheck, Clock, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us | Tasman Star Seafoods',
    description: 'Learn about Tasman Star — Gold Coast\'s trusted seafood destination with 25+ years of experience in wholesale, retail, fleet, and freight.',
    openGraph: {
        title: 'About Us | Tasman Star Seafoods',
        description: 'Gold Coast\'s trusted seafood destination — wholesale, retail, fleet, and freight all under one roof.',
        type: 'website',
    },
};

const TIMELINE = [
    {
        title: 'Getting Started',
        description: 'Tasman Star begins supplying fresh seafood to the Gold Coast, building relationships with local fishers and restaurants.',
    },
    {
        title: 'Growing Operations',
        description: 'The business expands across wholesale, retail, and freight — becoming a one-stop seafood supplier.',
    },
    {
        title: 'Fleet Expansion',
        description: 'Tasman Star launches its own commercial prawn trawler fleet, gaining direct access to the finest catch off Australia\'s east coast.',
    },
    {
        title: 'Gold Coast Icon',
        description: 'With 25+ years of experience, two retail stores, a wholesale division, and a full freight operation — Tasman Star becomes a Gold Coast destination.',
    },
];

const VALUES = [
    {
        icon: ShieldCheck,
        title: 'Quality First',
        description: 'The highest quality Australian and selected imported seafood, guaranteed fresh every day.',
    },
    {
        icon: Users,
        title: 'Knowledgeable Service',
        description: 'Decades of industry expertise backing every recommendation and every order we fulfil.',
    },
    {
        icon: Anchor,
        title: 'Boat to Plate',
        description: 'From our own trawler fleet to your table — we control the supply chain for unmatched freshness.',
    },
    {
        icon: Truck,
        title: 'Daily Freight',
        description: 'Connected to Sydney Fish Market and suppliers Australia-wide, with fresh deliveries arriving daily.',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero */}
            <div className="w-full bg-[#0A192F] py-16 md:py-24">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-[#FF8543] font-bold tracking-[0.3em] uppercase text-xs mb-4">Tasman Star</p>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">About Us</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                        Gold Coast&apos;s trusted seafood destination — wholesale, retail, fleet, and freight all under one roof.
                    </p>
                </div>
            </div>

            <main className="flex flex-col w-full">

                {/* About Tasman Star */}
                <section className="container mx-auto px-4 md:px-8 py-16 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-[#FF8543] font-bold tracking-widest uppercase text-xs mb-3">Who We Are</p>
                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-theme-text mb-6">Tasman Star Seafood Market</h2>
                            <p className="text-theme-text-muted leading-relaxed mb-4">
                                Tasman Star is one of the Gold Coast&apos;s most trusted seafood businesses. What started as a small operation has grown into a complete end-to-end seafood supply chain — from our own commercial trawler fleet to two retail stores, a wholesale division, and a dedicated freight operation.
                            </p>
                            <p className="text-theme-text-muted leading-relaxed mb-4">
                                We operate our own prawn trawler fleet off Australia&apos;s east coast, work with significant partnerships across commercial fishers and industry-leading suppliers, and run a temperature-controlled freight network connecting Bundaberg, Brisbane, and Sydney.
                            </p>
                            <p className="text-theme-text-muted leading-relaxed">
                                With direct connections to the Sydney Fish Market — the largest commercial fish market in the southern hemisphere — Tasman Star delivers the widest range of Australian and selected imported seafood products, backed by over 25 years of experience.
                            </p>
                        </div>
                        <div className="relative mt-8 md:mt-0">
                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-theme-border">
                                <img src="/assets/wholesale.png" alt="Tasman Star Fish Market" className="w-full h-80 object-cover" />
                            </div>
                            <div className="absolute -bottom-6 left-4 md:-left-6 bg-[#0A192F] rounded-2xl p-5 shadow-xl border border-[#FF8543]/20">
                                <p className="text-[#FF8543] font-bold text-3xl">25+</p>
                                <p className="text-slate-300 text-sm">Years of Experience</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
                    <div className="border-t border-theme-border pt-12">
                        <h2 className="font-serif text-3xl font-bold text-theme-text text-center mb-12">Our Journey</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {TIMELINE.map((item, i) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[#FF8543] text-white flex items-center justify-center font-bold text-sm shadow-md">
                                            {i + 1}
                                        </div>
                                        {i < TIMELINE.length - 1 && <div className="w-px flex-grow bg-[#FF8543]/20 mt-2 hidden md:block" />}
                                    </div>
                                    <div className="pb-6">
                                        <h3 className="font-serif text-lg font-bold text-theme-text mb-1">{item.title}</h3>
                                        <p className="text-theme-text-muted text-sm">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
                    <div className="border-t border-theme-border pt-12">
                        <h2 className="font-serif text-3xl font-bold text-theme-text text-center mb-4">What We Stand For</h2>
                        <p className="text-theme-text-muted text-center mb-10 max-w-lg mx-auto">Continued dedication and innovation in how the finest seafood reaches your plate.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {VALUES.map((value) => {
                                const Icon = value.icon;
                                return (
                                    <div key={value.title} className="bg-theme-card rounded-2xl border border-theme-border p-6 text-center shadow-sm">
                                        <div className="w-14 h-14 rounded-full bg-[#FF8543]/10 flex items-center justify-center mx-auto mb-4">
                                            <Icon size={26} className="text-[#FF8543]" />
                                        </div>
                                        <h3 className="font-serif text-lg font-bold text-theme-text mb-2">{value.title}</h3>
                                        <p className="text-theme-text-muted text-sm">{value.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Mathew Duncombe */}
                <section className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
                    <div className="border-t border-theme-border pt-12">
                        <h2 className="font-serif text-3xl font-bold text-theme-text text-center mb-10">Leadership</h2>
                        <div className="max-w-sm mx-auto">
                            <div className="bg-theme-card rounded-2xl border border-theme-border p-6 text-center shadow-sm">
                                <div className="w-20 h-20 rounded-full bg-[#0A192F] flex items-center justify-center mx-auto mb-4">
                                    <Users size={32} className="text-[#FF8543]" />
                                </div>
                                <h3 className="font-serif text-lg font-bold text-theme-text">Mathew Duncombe</h3>
                                <p className="text-[#FF8543] text-sm font-medium mb-2">Director</p>
                                <p className="text-theme-text-muted text-sm">Leading retail, online operations, wholesale growth, and customer experience at Tasman Star.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visit Us */}
                <section className="container mx-auto px-4 md:px-8 py-12 pb-20 max-w-5xl">
                    <div className="border-t border-theme-border pt-12">
                        <div className="bg-[#0A192F] rounded-3xl p-10 shadow-lg">
                            <h2 className="font-serif text-3xl font-bold text-white text-center mb-8">Visit Us</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex gap-4 items-start">
                                    <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                        <MapPin size={20} className="text-[#FF8543]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Labrador Store</h3>
                                        <p className="text-slate-400 text-sm">213 Brisbane Rd, Labrador QLD</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                        <MapPin size={20} className="text-[#FF8543]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Varsity Lakes Store</h3>
                                        <p className="text-slate-400 text-sm">201 Varsity Parade, Varsity Lakes QLD</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                        <Phone size={20} className="text-[#FF8543]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Call Us</h3>
                                        <p className="text-slate-400 text-sm">+61 7 5529 0844</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                        <Clock size={20} className="text-[#FF8543]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Opening Hours</h3>
                                        <p className="text-slate-400 text-sm">Open 7 days, 7am &ndash; 6pm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'LocalBusiness',
                        name: 'Tasman Star Seafoods',
                        description: 'Gold Coast\'s trusted seafood destination — wholesale, retail, fleet, and freight.',
                        url: 'https://tasmanstar.com.au',
                        telephone: '+61755290844',
                        address: [
                            {
                                '@type': 'PostalAddress',
                                streetAddress: '213 Brisbane Rd',
                                addressLocality: 'Labrador',
                                addressRegion: 'QLD',
                                postalCode: '4215',
                                addressCountry: 'AU',
                            },
                            {
                                '@type': 'PostalAddress',
                                streetAddress: '201 Varsity Parade',
                                addressLocality: 'Varsity Lakes',
                                addressRegion: 'QLD',
                                postalCode: '4227',
                                addressCountry: 'AU',
                            },
                        ],
                        openingHours: 'Mo-Su 07:00-18:00',
                        sameAs: [],
                    }),
                }}
            />
        </div>
    );
}
