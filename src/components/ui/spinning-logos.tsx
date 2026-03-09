"use client"

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const PARTNERS = [
  { logo: '/assets/partners/huon.png', name: 'HUON Aquaculture', bg: 'bg-white' },
  { logo: '/assets/partners/kb-seafood.png', name: 'KB Seafood Co', bg: 'bg-[#1a2e5a]' },
  { logo: '/assets/partners/markwell.png', name: 'Markwell Foods', bg: 'bg-white' },
  { logo: '/assets/partners/coral-coast.png', name: 'Coral Coast', bg: 'bg-white' },
  { logo: '/assets/partners/mainstream.png', name: 'MainStream Aquaculture', bg: 'bg-white' },
  { logo: '/assets/partners/poulos-bros.png', name: 'Poulos Bros Seafood', bg: 'bg-white' },
  { logo: '/assets/partners/sea-pearl.png', name: 'Pearl Seafoods', bg: 'bg-white' },
  { logo: '/assets/partners/australia-bay.png', name: 'Australia Bay Seafood', bg: 'bg-white' },
];

export const SpinningLogos: React.FC = () => {
  const radiusToCenterOfIcons = 180;
  const iconWrapperWidth = 64;
  const ringPadding = 40;

  const toRadians = (degrees: number): number => (Math.PI / 180) * degrees;

  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 overflow-hidden">
      <div
        style={{
          width: radiusToCenterOfIcons * 2 + iconWrapperWidth + ringPadding,
          height: radiusToCenterOfIcons * 2 + iconWrapperWidth + ringPadding,
        }}
        className="relative rounded-full bg-theme-secondary shadow-lg border border-theme-border"
      >
        <div className="absolute inset-0 animate-[spin-slow_30s_linear_infinite]">
          {PARTNERS.map((partner, index) => {
            const angle = (360 / PARTNERS.length) * index;
            return (
              <div
                key={index}
                style={{
                  top: `calc(50% - ${iconWrapperWidth / 2}px + ${radiusToCenterOfIcons * Math.sin(toRadians(angle))}px)`,
                  left: `calc(50% - ${iconWrapperWidth / 2}px + ${radiusToCenterOfIcons * Math.cos(toRadians(angle))}px)`,
                  width: iconWrapperWidth,
                  height: iconWrapperWidth,
                }}
                className={cn(
                  "absolute flex items-center justify-center rounded-full shadow-md border-2 border-white/20 animate-[spin-reverse_30s_linear_infinite] overflow-hidden",
                  partner.bg
                )}
                aria-label={partner.name}
                title={partner.name}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={48}
                  height={48}
                  className="object-contain w-10 h-10"
                />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-theme-primary rounded-full w-3/5 h-3/5 flex items-center justify-center shadow-inner border-4 border-theme-border">
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#FF8543] text-center px-4 leading-tight">
              Tasman<br />Star
            </span>
          </div>
        </div>
      </div>

      {/* Partner Names Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl w-full px-4">
        {PARTNERS.map((partner, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-theme-secondary border border-theme-border rounded-xl px-3 py-3"
          >
            <div className={cn("w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden", partner.bg)}>
              <Image
                src={partner.logo}
                alt={partner.name}
                width={32}
                height={32}
                className="object-contain w-7 h-7"
              />
            </div>
            <span className="text-theme-text text-xs font-medium leading-tight">{partner.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
