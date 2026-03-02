import React from 'react';
import { Anchor, Fish, MapPin, Ship, Waves } from 'lucide-react';

const PARTNERS = [
    { name: 'Sydney Fish Market', icon: Anchor, color: 'text-blue-400' },
    { name: 'Brisbane City', icon: MapPin, color: 'text-orange-400' },
    { name: 'Salmon Kings', icon: Fish, color: 'text-pink-400' },
    { name: 'Gold Coast Trawlers', icon: Ship, color: 'text-teal-400' },
    { name: 'Pacific Catch', icon: Waves, color: 'text-indigo-400' },
];

export function PartnerMarquee() {
    return (
        <div className="w-full overflow-hidden py-16 flex flex-col items-center">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 text-theme-text tracking-tight">
                Trusted by the best partners
            </h3>
            <p className="text-theme-text-muted text-center mb-16 max-w-lg">
                The foundational partnerships that have been powering our supply chain from the very start.
            </p>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks for smooth fade at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-theme-primary to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-theme-primary to-transparent z-10 pointer-events-none" />

                {/* Animated Track */}
                <div className="flex w-max min-w-full animate-marquee items-center gap-16 md:gap-24 py-4 pr-16 md:pr-24 hover:[animation-play-state:paused]">
                    {/* Double the logos to create an infinite loop effect */}
                    {[...PARTNERS, ...PARTNERS].map((partner, idx) => {
                        const Icon = partner.icon;
                        return (
                            <div
                                key={`${partner.name}-${idx}`}
                                className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            >
                                <Icon size={32} className={partner.color} strokeWidth={1.5} />
                                <span className="text-xl md:text-2xl font-bold text-theme-text tracking-tight whitespace-nowrap">
                                    {partner.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
