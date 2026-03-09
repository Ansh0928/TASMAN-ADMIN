import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Handshake, Mail } from 'lucide-react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

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

type Partner = {
    name: string;
    description: string;
    logoSrc: string;
    logoAlt: string;
};

const partners: Partner[] = [
    {
        name: 'Sydney Fish Market',
        description: 'Seafood market partner',
        logoSrc: '/assets/partners/sydney-fish-market.svg',
        logoAlt: 'Sydney Fish Market logo',
    },
    {
        name: 'Pacific West',
        description: 'Prepared seafood supplier',
        logoSrc: '/assets/partners/pacific-west.png',
        logoAlt: 'Pacific West logo',
    },
    {
        name: 'Tasman Star Seafoods',
        description: 'Core seafood distribution partner',
        logoSrc: '/assets/partners/tasman-star.png',
        logoAlt: 'Tasman Star Seafoods logo',
    },
    {
        name: 'HUON Aquaculture',
        description: 'Aquaculture partner',
        logoSrc: '/assets/partners/huon.png',
        logoAlt: 'HUON Aquaculture logo',
    },
    {
        name: 'KB Seafood Co',
        description: 'Seafood supply partner',
        logoSrc: '/assets/partners/kb-seafood.png',
        logoAlt: 'KB Seafood Co logo',
    },
    {
        name: 'Markwell Foods',
        description: 'Foodservice supplier',
        logoSrc: '/assets/partners/markwell.png',
        logoAlt: 'Markwell Foods logo',
    },
    {
        name: 'Coral Coast',
        description: 'Seafood supplier',
        logoSrc: '/assets/partners/coral-coast.png',
        logoAlt: 'Coral Coast logo',
    },
    {
        name: 'MainStream Aquaculture',
        description: 'Premium aquaculture partner',
        logoSrc: '/assets/partners/mainstream.png',
        logoAlt: 'MainStream Aquaculture logo',
    },
    {
        name: 'Poulos Bros Seafood',
        description: 'Wholesale seafood supplier',
        logoSrc: '/assets/partners/poulos-bros.png',
        logoAlt: 'Poulos Bros Seafood logo',
    },
    {
        name: 'Australia Bay Seafood',
        description: 'Seafood supplier',
        logoSrc: '/assets/partners/australia-bay.png',
        logoAlt: 'Australia Bay Seafood logo',
    },
    {
        name: 'Raptis Fishing Company',
        description: 'Fishing partner',
        logoSrc: '/assets/partners/raptis.png',
        logoAlt: 'Raptis Fishing Company logo',
    },
    {
        name: 'Northern Wild Catch',
        description: 'Wild catch supplier',
        logoSrc: '/assets/partners/northern-wild-catch.png',
        logoAlt: 'Northern Wild Catch logo',
    },
    {
        name: 'Sea Harvest',
        description: 'Seafood supplier',
        logoSrc: '/assets/partners/sea-harvest.png',
        logoAlt: 'Sea Harvest logo',
    },
    {
        name: 'Red Chamber Australia',
        description: 'Wholesale partner',
        logoSrc: '/assets/partners/red-chamber.png',
        logoAlt: 'Red Chamber Australia logo',
    },
    {
        name: 'Yarra Valley Caviar',
        description: 'Specialty supplier',
        logoSrc: '/assets/partners/yarra-valley-caviar.png',
        logoAlt: 'Yarra Valley Caviar logo',
    },
    {
        name: 'Sea Farm Group',
        description: 'Aquaculture partner',
        logoSrc: '/assets/partners/sea-farm-group.png',
        logoAlt: 'Sea Farm Group logo',
    },
];

const partnerRows = [
    partners.filter((_, index) => index % 2 === 0),
    partners.filter((_, index) => index % 2 === 1),
];

function PartnerCard({ partner }: { partner: Partner }) {
    return (
        <article className="flex min-w-[200px] max-w-[200px] sm:min-w-[250px] sm:max-w-[250px] items-center gap-3 sm:gap-4 rounded-2xl border border-theme-border bg-theme-secondary px-3 sm:px-4 py-3 sm:py-4 shadow-sm">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-theme-border bg-white">
                <Image
                    src={partner.logoSrc}
                    alt={partner.logoAlt}
                    width={48}
                    height={48}
                    className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
            </div>

            <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold leading-tight text-theme-text">
                    {partner.name}
                </h3>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs leading-relaxed text-theme-text-muted">
                    {partner.description}
                </p>
            </div>
        </article>
    );
}

export default function OurPartnerPage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero */}
            <div className="w-full bg-[#0A192F] py-16 md:py-24 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[60%] w-[60%] rounded-full bg-[#FF8543]/10 blur-[100px]"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm uppercase tracking-widest text-white backdrop-blur-sm mb-6">
                        <Handshake size={14} /> Partnerships
                    </div>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">Our Partners</h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-300">
                        Trusted partnerships across the seafood industry — from fishers to freight — powering Australia&apos;s freshest supply chain.
                    </p>
                </div>
            </div>

            {/* Scrolling Partner Showcase — full width */}
            <section className="w-full py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-8 mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 text-theme-text tracking-tight">
                        Our Supply Partners
                    </h2>
                    <p className="max-w-2xl mx-auto text-center text-sm sm:text-base text-theme-text-muted">
                        Trusted partners powering our seafood supply chain across Australia.
                    </p>
                </div>

                <div className="w-full space-y-4 sm:space-y-5">
                    {partnerRows.map((row, index) => (
                        <div
                            key={`partner-row-${index}`}
                            className="w-full overflow-hidden py-3 sm:py-4"
                        >
                            <InfiniteSlider
                                gap={12}
                                reverse={index % 2 === 1}
                                speed={20}
                                speedOnHover={8}
                            >
                                {row.map((partner) => (
                                    <PartnerCard
                                        key={`${index}-${partner.name}`}
                                        partner={partner}
                                    />
                                ))}
                            </InfiniteSlider>
                        </div>
                    ))}
                </div>
            </section>

            {/* Become a Partner CTA */}
            <section className="w-full px-4 md:px-8 pb-16">
                <div className="max-w-5xl mx-auto bg-[#0A192F] rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <Handshake size={36} className="text-[#FF8543] mx-auto mb-4 sm:mb-6" />
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">Partner With Us</h2>
                        <p className="text-base sm:text-xl text-slate-300 mb-8 sm:mb-10">
                            Interested in becoming a supply partner or wholesale customer? We&apos;d love to hear from you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                            <Link href="/wholesale/apply" className="flex items-center justify-center gap-3 bg-[#FF8543] hover:bg-[#E2743A] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-colors shadow-lg">
                                <Handshake size={20} /> Apply for Wholesale
                            </Link>
                            <a href="mailto:info@tasmanstar.com.au" className="flex items-center justify-center gap-3 bg-transparent border border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-colors">
                                <Mail size={20} /> Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
