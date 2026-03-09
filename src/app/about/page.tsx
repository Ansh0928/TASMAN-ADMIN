import type { Metadata } from 'next';
import { Anchor, Users, Truck, ShieldCheck, Clock, MapPin, Phone, Cpu, Heart } from 'lucide-react';
import type { TeamMember } from '@/components/ui/team-showcase';
import TeamShowcase from '@/components/ui/team-showcase';

export const metadata: Metadata = {
    title: 'About Us | Tasman Star Seafoods',
    description: 'Learn about Tasman Star — Gold Coast\'s trusted seafood destination with 13+ years of experience in wholesale, retail, fleet, and freight.',
    openGraph: {
        title: 'About Us | Tasman Star Seafoods',
        description: 'Gold Coast\'s trusted seafood destination — wholesale, retail, fleet, and freight all under one roof.',
        type: 'website',
    },
};

const TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Mathew Duncombe', role: 'DIRECTOR', image: '/assets/team/matty.png' },
    { id: '2', name: 'Mathew Perkins', role: 'WHOLESALE OPERATIONS', image: '/assets/team/matty-p.png' },
    { id: '3', name: 'Kyle', role: 'RETAIL OPERATIONS MANAGER', image: '/assets/team/kyle.png' },
    { id: '4', name: 'Ben', role: 'HR', image: '/assets/team/ben.png' },
    { id: '5', name: 'Harry', role: 'PRODUCTION TEAM', image: '/assets/team/harry.png' },
    { id: '6', name: 'Bella', role: 'CUSTOMER SERVICE', image: '/assets/team/bella.png' },
    { id: '7', name: 'Taka', role: 'SUSHI CHEF · 12+ YEARS EXPERIENCE', image: '/assets/team/taka.jpg' },
    { id: '8', name: 'Ichy', role: 'SUSHI CHEF', image: '/assets/team/ichy.png' },
];

const VALUES = [
    { icon: ShieldCheck, title: 'Quality First', description: 'Guaranteed fresh, every single day.' },
    { icon: Heart, title: 'Family Owned', description: 'Proudly family-run for over 13 years.' },
    { icon: Anchor, title: 'Boat to Plate', description: 'Our own trawler fleet, direct to you.' },
    { icon: Truck, title: 'Daily Freight', description: 'Connected Australia-wide, delivered daily.' },
    { icon: Cpu, title: 'Tech & AI Enabled', description: 'Modern systems powering smarter operations.' },
    { icon: Users, title: 'Expert Team', description: 'Decades of hands-on seafood expertise.' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero */}
            <div className="w-full bg-[#0A192F] py-16 md:py-20 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FF8543]/8 blur-[100px] rounded-full"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <p className="text-[#FF8543] font-bold tracking-[0.3em] uppercase text-xs mb-4">Tasman Star</p>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">About Us</h1>
                    <p className="text-slate-300 max-w-xl mx-auto text-lg">
                        Gold Coast&apos;s trusted seafood destination — wholesale, retail, fleet, and freight all under one roof.
                    </p>
                </div>
            </div>

            <main className="flex flex-col w-full">

                {/* Who We Are + Image */}
                <section className="container mx-auto px-4 md:px-8 py-14 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="text-[#FF8543] font-bold tracking-widest uppercase text-xs mb-3">Who We Are</p>
                            <h2 className="font-serif text-3xl font-bold text-theme-text mb-4">Tasman Star Seafood Market</h2>
                            <p className="text-theme-text-muted leading-relaxed mb-3">
                                From a small Gold Coast operation to a complete seafood supply chain — our own trawler fleet, two retail stores, wholesale, and freight across the east coast.
                            </p>
                            <p className="text-theme-text-muted leading-relaxed">
                                Direct connections to the Sydney Fish Market give us access to the widest range of Australian seafood, backed by over 13 years of experience.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="rounded-2xl overflow-hidden shadow-xl border border-theme-border">
                                <img src="/assets/retail-store.jpeg" alt="Tasman Star Seafood Market storefront" className="w-full h-72 object-cover" />
                            </div>
                            <div className="absolute -bottom-5 left-4 md:-left-4 bg-[#0A192F] rounded-xl p-4 shadow-xl border border-[#FF8543]/20">
                                <p className="text-[#FF8543] font-bold text-2xl">13+</p>
                                <p className="text-slate-300 text-xs">Years of Experience</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values — compact row */}
                <section className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {VALUES.map((value) => {
                            const Icon = value.icon;
                            return (
                                <div key={value.title} className="bg-theme-card rounded-xl border border-theme-border p-5 text-center">
                                    <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center mx-auto mb-3">
                                        <Icon size={22} className="text-[#FF8543]" />
                                    </div>
                                    <h3 className="font-serif text-sm font-bold text-theme-text mb-1">{value.title}</h3>
                                    <p className="text-theme-text-muted text-xs">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Meet the Team */}
                <section className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
                    <div className="border-t border-theme-border pt-10">
                        <h2 className="font-serif text-3xl font-bold text-theme-text text-center mb-2">Meet the Team</h2>
                        <p className="text-theme-text-muted text-center mb-4 max-w-md mx-auto">The people behind the freshest seafood on the Gold Coast.</p>
                        <TeamShowcase members={TEAM_MEMBERS} />
                    </div>
                </section>

                {/* Visit Us */}
                <section className="container mx-auto px-4 md:px-8 py-10 pb-16 max-w-5xl">
                    <div className="bg-[#0A192F] rounded-2xl p-8 shadow-lg">
                        <h2 className="font-serif text-2xl font-bold text-white text-center mb-6">Visit Us</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                    <MapPin size={18} className="text-[#FF8543]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Labrador</h3>
                                    <p className="text-slate-400 text-xs">5-7 Olsen Ave, QLD 4215</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                    <MapPin size={18} className="text-[#FF8543]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Varsity Lakes</h3>
                                    <p className="text-slate-400 text-xs">201 Varsity Parade, QLD</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                    <Phone size={18} className="text-[#FF8543]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Call Us</h3>
                                    <p className="text-slate-400 text-xs">+61 7 5529 0844</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                    <Clock size={18} className="text-[#FF8543]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Hours</h3>
                                    <p className="text-slate-400 text-xs">Open 7 days, 7am &ndash; 6pm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

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
                            { '@type': 'PostalAddress', streetAddress: '5-7 Olsen Ave', addressLocality: 'Labrador', addressRegion: 'QLD', postalCode: '4215', addressCountry: 'AU' },
                            { '@type': 'PostalAddress', streetAddress: '201 Varsity Parade', addressLocality: 'Varsity Lakes', addressRegion: 'QLD', postalCode: '4227', addressCountry: 'AU' },
                        ],
                        openingHours: 'Mo-Su 07:00-18:00',
                    }),
                }}
            />
        </div>
    );
}
