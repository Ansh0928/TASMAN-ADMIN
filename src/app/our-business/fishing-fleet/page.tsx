import type { Metadata } from 'next';
import { Anchor, Fish, MapPin, Waves, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Our Commercial Fishing Fleet | Tasman Star Seafoods',
    description: 'We own and operate our own trawlers, fishing the pristine waters off Australia\'s east coast for the freshest catch — prawns, snapper, barramundi, and more.',
    openGraph: {
        title: 'Our Commercial Fishing Fleet | Tasman Star Seafoods',
        description: 'Our own trawlers fish Australia\'s east coast waters daily for the freshest possible catch.',
        type: 'website',
    },
};

export default function FishingFleetPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            <div className="w-full h-[60vh] relative overflow-hidden bg-[#0A192F]">
                <img src="/assets/products/trawlers-tasman-star-peter-k.webp" alt="Tasman Star Fishing Vessels" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-[#0A192F]/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-10 z-10 lg:bottom-10 lg:left-10">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm text-white mb-6 uppercase tracking-widest">
                            <Anchor size={14} /> Our Fleet
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
                            Our Commercial<br />Fishing Fleet
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-200 font-light max-w-2xl leading-relaxed">
                            We own and operate our own trawlers, fishing the pristine waters off Australia&apos;s east coast to bring you the freshest possible catch.
                        </p>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col gap-24 max-w-7xl">

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

                {/* Where We Fish */}
                <section className="bg-theme-secondary rounded-[2.5rem] shadow-sm border border-theme-border overflow-hidden flex flex-col lg:flex-row group transition-all duration-300 hover:shadow-xl">
                    <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 text-[#FF8543] font-semibold tracking-wider uppercase text-sm mb-4">
                            <Fish size={18} /> Catch Zones
                        </div>
                        <h2 className="font-serif text-4xl font-bold text-theme-text mb-6 leading-tight">Where We Fish</h2>
                        <p className="text-theme-text-muted text-lg leading-relaxed mb-8">
                            Our vessels fish the rich waters from Moreton Bay down through the Gold Coast Reefs and into the northern Tasman Sea. These cold, nutrient-rich currents produce some of the finest seafood in the world.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-[#FF8543] shrink-0" />
                                <span className="text-theme-text font-medium">Gold Coast Reefs — Prawns, Snapper, Flathead</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-[#FF8543] shrink-0" />
                                <span className="text-theme-text font-medium">Moreton Bay — Mud Crab, Bug, Whiting</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-[#FF8543] shrink-0" />
                                <span className="text-theme-text font-medium">Tasman Sea — Tuna, Swordfish, Mahi Mahi</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-[#FF8543] shrink-0" />
                                <span className="text-theme-text font-medium">Local Harbour — Daily fresh catch offloaded</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 min-h-[400px] relative">
                        <img src="/assets/products/peter-k.webp" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Peter K Trawler at Sea" />
                    </div>
                </section>

                {/* Fleet Gallery */}
                <section>
                    <h2 className="font-serif text-4xl font-bold text-theme-text mb-8 text-center">Our Fleet in Action</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl overflow-hidden h-56 md:h-64 relative group">
                            <img src="/assets/products/prawn-trawler-peterk.webp" alt="Prawn Trawler Peter K" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold text-sm">Prawn Trawler — Peter K</p>
                        </div>
                        <div className="rounded-2xl overflow-hidden h-56 md:h-64 relative group">
                            <img src="/assets/products/trawlers.webp" alt="Tasman Star Trawler Fleet" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold text-sm">Our Trawler Fleet</p>
                        </div>
                        <div className="rounded-2xl overflow-hidden h-56 md:h-64 relative group">
                            <img src="/assets/products/tasman-star-unload.webp" alt="Unloading the Tasman Star" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold text-sm">Unloading the Catch</p>
                        </div>
                        <div className="rounded-2xl overflow-hidden h-56 md:h-64 relative group">
                            <img src="/assets/products/peter-k-unload.webp" alt="Dockside at Peter K" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold text-sm">Dockside Offload</p>
                        </div>
                        <div className="rounded-2xl overflow-hidden h-56 md:h-64 relative group">
                            <img src="/assets/products/peter-k-unload-2.webp" alt="Fresh Catch from Peter K" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold text-sm">Fresh from the Boat</p>
                        </div>
                        <div className="rounded-2xl overflow-hidden h-56 md:h-64 relative group">
                            <img src="/assets/products/peterk-unload.webp" alt="Daily Offload at Harbour" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-bold text-sm">Daily Harbour Offload</p>
                        </div>
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

            </main>
        </div>
    );
}
