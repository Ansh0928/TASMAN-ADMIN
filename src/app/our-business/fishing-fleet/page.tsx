'use client';

import { Anchor, Fish, Waves, Phone, Mail } from 'lucide-react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { CircularTestimonials } from '@/components/ui/circular-testimonials';

const FLEET_GALLERY = [
    {
        name: 'Tasman Star Trawlers',
        designation: 'Commercial Fishing Fleet',
        quote: 'Our fleet of commercial trawlers operates daily from the Gold Coast, targeting premium species in deep and shallow waters along Australia\'s east coast.',
        src: '/assets/products/trawlers-tasman-star-peter-k-hq.jpg',
    },
    {
        name: 'Peter K',
        designation: 'Prawn Trawler',
        quote: 'The Peter K is one of our flagship prawn trawlers, purpose-built for harvesting the finest wild-caught prawns from the pristine waters off Queensland.',
        src: '/assets/products/peter-k-hq.jpg',
    },
    {
        name: 'Harbour Offload',
        designation: 'Daily Fresh Catch',
        quote: 'Every morning our catch is offloaded dockside, iced immediately, and transported in cold-chain vehicles to our processing facility and retail stores.',
        src: '/assets/products/tasman-star-unload-hq.jpg',
    },
    {
        name: 'Peter K at Sea',
        designation: 'Deep Water Operations',
        quote: 'Operating in the rich fishing grounds off the Gold Coast, the Peter K brings in premium catches of prawns, snapper, and other east coast species.',
        src: '/assets/products/trawlers-hq.jpg',
    },
    {
        name: 'Dockside Operations',
        designation: 'Quality from Boat to Market',
        quote: 'Our experienced crew handles every catch with care. Fish is sorted, graded, and iced on board to maintain peak freshness from the moment it leaves the water.',
        src: '/assets/products/peter-k-unload-hq.jpg',
    },
];

export default function FishingFleetPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Scroll Expansion Hero */}
            <ScrollExpandMedia
                mediaType="image"
                mediaSrc="/assets/products/vessels-hq.png"
                bgImageSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
                title="Our Fishing Fleet"
                date="Boat to Plate"
                scrollToExpand="Scroll to explore"
                textBlend
            >

                {/* ── All page content reveals after scroll expansion ── */}
                <div className="flex flex-col gap-24 max-w-7xl mx-auto w-full">

                    {/* Fleet Overview */}
                    <section className="bg-theme-secondary rounded-[2.5rem] shadow-sm border border-theme-border p-10 lg:p-16">
                        <div className="text-center mb-12">
                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-theme-text mb-4">Fleet to Fork</h2>
                            <p className="text-theme-text-muted text-lg max-w-2xl mx-auto">
                                Unlike most seafood retailers, Tasman Star operates its own commercial fishing fleet. This means we control the quality from the moment the catch comes aboard to the moment it reaches your plate.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-16 h-16 bg-[#FF8543]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Anchor size={28} className="text-[#FF8543]" />
                                </div>
                                <h3 className="font-bold text-xl text-theme-text mb-2">Our Trawlers</h3>
                                <p className="text-theme-text-muted">Our fleet of commercial trawlers operates daily from the Gold Coast, targeting premium species in deep and shallow waters.</p>
                            </div>

                            <div className="flex flex-col items-center text-center group">
                                <div className="w-16 h-16 bg-[#FF8543]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Waves size={28} className="text-[#FF8543]" />
                                </div>
                                <h3 className="font-bold text-xl text-theme-text mb-2">Sustainable Practices</h3>
                                <p className="text-theme-text-muted">We follow strict sustainable fishing guidelines, respecting catch limits and seasonal closures to protect marine ecosystems.</p>
                            </div>

                            <div className="flex flex-col items-center text-center group">
                                <div className="w-16 h-16 bg-[#FF8543]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Fish size={28} className="text-[#FF8543]" />
                                </div>
                                <h3 className="font-bold text-xl text-theme-text mb-2">Premium Species</h3>
                                <p className="text-theme-text-muted">We target wild-caught prawns, snapper, barramundi, mud crab, and other premium species from Australia&apos;s east coast waters.</p>
                            </div>
                        </div>
                    </section>

                    {/* Our Fleet in Action — Circular Testimonials Carousel */}
                    <section>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-theme-text mb-4 text-center">Our Fleet in Action</h2>
                        <p className="text-theme-text-muted text-lg text-center max-w-2xl mx-auto mb-12">
                            Browse through our fleet — from our trawlers at sea to the daily dockside offload.
                        </p>
                        <div className="flex items-center justify-center">
                            <CircularTestimonials
                                testimonials={FLEET_GALLERY}
                                autoplay={true}
                                colors={{
                                    name: 'var(--text-primary)',
                                    designation: 'var(--text-accent)',
                                    testimony: 'var(--text-secondary)',
                                    arrowBackground: 'var(--bg-secondary)',
                                    arrowForeground: 'var(--text-primary)',
                                    arrowHoverBackground: 'var(--accent)',
                                }}
                                fontSizes={{
                                    name: '28px',
                                    designation: '16px',
                                    quote: '18px',
                                }}
                            />
                        </div>
                    </section>

                    {/* Quality Standards */}
                    <section className="bg-theme-secondary border border-theme-border rounded-[2.5rem] p-10 lg:p-16">
                        <h2 className="font-serif text-4xl font-bold text-theme-text mb-12 text-center">Our Quality Standards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="group flex flex-col items-center text-center">
                                <h3 className="font-bold text-2xl text-theme-text mb-4 flex flex-col items-center gap-3">
                                    <span className="text-[#FF8543] bg-[#FF8543]/10 w-12 h-12 rounded-full flex items-center justify-center text-lg transition-transform group-hover:scale-110">01</span>
                                    Boat to Market
                                </h3>
                                <p className="text-theme-text-muted text-lg leading-relaxed">Catch is iced immediately on board and transported in refrigerated holds to maintain optimal freshness.</p>
                            </div>

                            <div className="group flex flex-col items-center text-center">
                                <h3 className="font-bold text-2xl text-theme-text mb-4 flex flex-col items-center gap-3">
                                    <span className="text-[#FF8543] bg-[#FF8543]/10 w-12 h-12 rounded-full flex items-center justify-center text-lg transition-transform group-hover:scale-110">02</span>
                                    Hand Inspected
                                </h3>
                                <p className="text-theme-text-muted text-lg leading-relaxed">Every piece of seafood is hand-inspected for quality before it reaches our retail stores or wholesale customers.</p>
                            </div>

                            <div className="group flex flex-col items-center text-center">
                                <h3 className="font-bold text-2xl text-theme-text mb-4 flex flex-col items-center gap-3">
                                    <span className="text-[#FF8543] bg-[#FF8543]/10 w-12 h-12 rounded-full flex items-center justify-center text-lg transition-transform group-hover:scale-110">03</span>
                                    Fully Traceable
                                </h3>
                                <p className="text-theme-text-muted text-lg leading-relaxed">We know exactly where, when, and how every piece of seafood was caught — complete supply chain transparency.</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact CTA */}
                    <section className="bg-[#0A192F] rounded-[2.5rem] p-10 lg:p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Commercial Enquiries</h2>
                            <p className="text-xl text-slate-300 mb-10">Interested in our catch or wholesale supply from our fleet? Get in touch with our team.</p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <a href="tel:+61755290844" className="flex items-center justify-center gap-3 bg-white text-[#0A192F] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg">
                                    <Phone size={20} /> 07 5529 0844
                                </a>
                                <a href="mailto:info@tasmanstar.com.au" className="flex items-center justify-center gap-3 bg-transparent border border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                                    <Mail size={20} /> Contact Us
                                </a>
                            </div>
                        </div>
                    </section>

                </div>
            </ScrollExpandMedia>
        </div>
    );
}
