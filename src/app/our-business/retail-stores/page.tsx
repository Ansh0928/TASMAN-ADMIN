import type { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Clock, Phone } from 'lucide-react';
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials';

export const metadata: Metadata = {
    title: 'Our Retail Stores',
    description: 'Visit our fresh seafood stores at Labrador and Varsity Lakes on the Gold Coast. Open daily with the freshest catch from our own fleet.',
    alternates: { canonical: '/our-business/retail-stores' },
    openGraph: {
        title: 'Our Retail Stores | Tasman Star Seafoods',
        description: 'Visit our direct-to-public markets to pick your own fresh catch.',
        type: 'website',
    },
};

export default function RetailStoresPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Header Banner */}
            <div className="w-full h-[50vh] relative overflow-hidden bg-[#0A192F]">
                <Image src="/assets/products/store remake.png" alt="Tasman Star Retail Store" fill sizes="100vw" className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-[#0A192F]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-10 z-10">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">Our Retail Stores</h1>
                        <p className="text-xl text-slate-300 font-light max-w-xl mx-auto">
                            Visit our direct-to-public markets to pick your own fresh catch.
                        </p>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-8 py-16 flex flex-col gap-12 max-w-5xl">

                {/* Labrador Store */}
                <section className="bg-theme-secondary rounded-3xl shadow-sm border border-theme-border overflow-hidden flex flex-col md:flex-row group">
                    <div className="w-full md:w-1/2 overflow-hidden min-h-[240px] relative">
                        <Image src="/assets/products/labrador store.jpg" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Labrador Store Market Fresh Fish" />
                    </div>
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <div className="inline-block bg-[#FF8543]/10 text-[#FF8543] border border-[#FF8543]/20 text-xs font-bold px-3 py-1 uppercase rounded mb-4 w-max">Local Branch</div>
                        <h2 className="font-serif text-4xl font-bold text-theme-text mb-6">Labrador Market</h2>

                        <div className="flex flex-col gap-4 text-theme-text-muted">
                            <div className="flex items-start gap-3">
                                <MapPin size={20} className="text-[#FF8543] mt-1 shrink-0" />
                                <p>5-7 Olsen Ave, Labrador<br />QLD 4215</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-[#FF8543] shrink-0" />
                                <p>Open Daily: 7:00 AM - 6:00 PM</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={20} className="text-[#FF8543] shrink-0" />
                                <p>(07) 5529 2500</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Varsity Lakes Store */}
                <section className="bg-theme-secondary rounded-3xl shadow-sm border border-theme-border overflow-hidden flex flex-col md:flex-row group">
                    <div className="w-full md:w-1/2 overflow-hidden min-h-[240px] order-1 md:order-2 relative">
                        <Image src="/assets/products/storefront-flagship.webp" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Varsity Lakes Flagship Store - Staff with Premium Crab Display" />
                    </div>
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                        <div className="inline-block bg-[#FF8543] text-white text-xs font-bold px-3 py-1 uppercase rounded mb-4 w-max">Flagship Store</div>
                        <h2 className="font-serif text-4xl font-bold text-theme-text mb-6">Varsity Lakes</h2>

                        <div className="flex flex-col gap-4 text-theme-text-muted">
                            <div className="flex items-start gap-3">
                                <MapPin size={20} className="text-[#FF8543] mt-1 shrink-0" />
                                <p>20 Casua Dr, Varsity Lakes<br />QLD 4227</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-[#FF8543] shrink-0" />
                                <p>Open Daily: 7:00 AM - 6:00 PM</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={20} className="text-[#FF8543] shrink-0" />
                                <p>(07) 5522 1221</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Store Gallery */}
                <section>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-theme-text mb-8 text-center">Inside Our Stores</h2>
                </section>
            </main>

            <StaggerTestimonials />

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            '@context': 'https://schema.org',
                            '@type': 'LocalBusiness',
                            name: 'Tasman Star Seafoods - Labrador',
                            description: 'Local branch retail store on the Gold Coast',
                            telephone: '(07) 5529 2500',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: '5-7 Olsen Ave',
                                addressLocality: 'Labrador',
                                addressRegion: 'QLD',
                                postalCode: '4215',
                                addressCountry: 'AU',
                            },
                            openingHours: 'Mo-Su 07:00-18:00',
                        },
                        {
                            '@context': 'https://schema.org',
                            '@type': 'LocalBusiness',
                            name: 'Tasman Star Seafoods - Varsity Lakes',
                            description: 'Flagship seafood retail store',
                            telephone: '(07) 5522 1221',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: '20 Casua Dr',
                                addressLocality: 'Varsity Lakes',
                                addressRegion: 'QLD',
                                postalCode: '4227',
                                addressCountry: 'AU',
                            },
                            openingHours: 'Mo-Su 07:00-18:00',
                        },
                    ]),
                }}
            />
        </div>
    );
}
