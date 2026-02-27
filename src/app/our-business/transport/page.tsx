import type { Metadata } from 'next';
import { Truck, Snowflake, ShieldCheck, Route, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Transport & Fish Freight | Tasman Star Seafoods',
    description: 'Temperature-controlled seafood logistics across QLD, NSW, and beyond. Our refrigerated fleet ensures your seafood arrives at peak freshness.',
    openGraph: {
        title: 'Transport & Fish Freight | Tasman Star Seafoods',
        description: 'Our dedicated fleet of refrigerated vehicles ensures seafood arrives at peak freshness.',
        type: 'website',
    },
};

export default function TransportPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            <div className="w-full h-[60vh] relative overflow-hidden bg-[#0A192F]">
                <img src="/tasman-star-fleet1.jpeg" alt="Tasman Star Transport Fleet" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-[#0A192F]/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-10 z-10 lg:bottom-10 lg:left-10">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm text-white mb-6 uppercase tracking-widest">
                            <Truck size={14} /> Logistics
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
                            Transport &<br />Fish Freight
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-200 font-light max-w-2xl leading-relaxed">
                            Our dedicated fleet of refrigerated vehicles ensures seafood arrives at peak freshness — from the docks to your door.
                        </p>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col gap-24 max-w-7xl">

                {/* Cold Chain Section */}
                <section className="bg-theme-secondary rounded-[2.5rem] shadow-sm border border-theme-border overflow-hidden flex flex-col lg:flex-row group transition-all duration-300 hover:shadow-xl">
                    <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] opacity-50 -mr-20 -mt-20"></div>

                        <div className="inline-flex items-center gap-2 text-sky-500 font-semibold tracking-wider uppercase text-sm mb-4">
                            <Snowflake size={18} /> Cold Chain Logistics
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-theme-text mb-8 leading-tight">End-to-End Temperature Control</h2>

                        <div className="space-y-8 relative z-10">
                            <div className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 w-12 h-12 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center">
                                    <Snowflake size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-theme-text mb-2">Refrigerated Fleet</h3>
                                    <p className="text-theme-text-muted leading-relaxed text-lg">Every vehicle is purpose-built with commercial-grade refrigeration maintaining 0-4°C throughout transit.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 w-12 h-12 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-theme-text mb-2">GPS Tracked</h3>
                                    <p className="text-theme-text-muted leading-relaxed text-lg">Real-time tracking and temperature monitoring on every delivery ensures complete accountability.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 w-12 h-12 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center">
                                    <Route size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-theme-text mb-2">Interstate Freight</h3>
                                    <p className="text-theme-text-muted leading-relaxed text-lg">We freight fresh seafood to markets across QLD, NSW, VIC and beyond with guaranteed cold-chain integrity.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 min-h-[400px]">
                        <img src="/tasman-star-fleet2.jpeg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Refrigerated Transport Vehicles" />
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-theme-secondary border border-theme-border rounded-[2.5rem] p-10 lg:p-16">
                    <h2 className="font-serif text-4xl font-bold text-theme-text mb-12 text-center">Our Freight Capabilities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        <div className="flex flex-col items-center text-center">
                            <span className="text-5xl font-bold text-[#FF8543] mb-2">15+</span>
                            <p className="text-theme-text-muted text-lg">Refrigerated Vehicles</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-5xl font-bold text-[#FF8543] mb-2">6</span>
                            <p className="text-theme-text-muted text-lg">Days a Week</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-5xl font-bold text-[#FF8543] mb-2">5</span>
                            <p className="text-theme-text-muted text-lg">States Covered</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-5xl font-bold text-[#FF8543] mb-2">0-4°C</span>
                            <p className="text-theme-text-muted text-lg">Guaranteed Temp</p>
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="bg-[#0A192F] rounded-[2.5rem] p-10 lg:p-16 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Freight Enquiries</h2>
                        <p className="text-xl text-slate-300 mb-10">Need bulk seafood freight to your business or market? Get in touch.</p>
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
