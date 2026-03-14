"use client"

import React from 'react';

interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  /** Optional class for the image */
  imageClassName?: string;
  /** Optional inline style for the image */
  imageStyle?: React.CSSProperties;
  /** If true, image is rotated -90deg and shown in full (no crop) via a wrapper */
  rotateLeftFull?: boolean;
}

const storePhotos: GalleryItem[] = [
  { src: '/assets/products/oyster-opening.jpg', alt: 'Fresh oyster opening', caption: 'Fresh Oyster Opening' },
  { src: '/assets/products/carl.jpg', alt: 'Kyle at work', caption: 'Kyle at Work', rotateLeftFull: true },
  { src: '/assets/products/store.webp', alt: 'Store interior', caption: 'Fresh Daily Selection' },
  { src: '/assets/products/tuna-tail-cut.jpg', alt: 'Tuna tail cut', caption: 'Tuna Tail Cut' },
  { src: '/assets/products/img0821.webp', alt: 'Ocean perch and snapper display', caption: 'Ocean Perch & Snapper' },
  { src: '/assets/products/yellow-fin-tuna-whole.jpg', alt: 'Yellow Fin Tuna whole', caption: 'Yellow Fin Tuna Whole' },
  { src: '/assets/products/store-2.webp', alt: 'Fresh fish display', caption: 'Premium Fish Display' },
  { src: '/assets/products/storefront-flagship.webp', alt: 'Staff with premium crab display', caption: 'Our Famous Crab Mountain' },
  { src: '/assets/products/img0866.webp', alt: 'Oysters Kilpatrick and Mornay', caption: 'Oysters Kilpatrick & Mornay' },
  { src: '/assets/products/img3505.webp', alt: 'Sashimi and premium cuts counter', caption: 'Sashimi & Premium Cuts' },
  { src: '/assets/products/store-6.webp', alt: 'Fresh catch display', caption: 'Fresh Catch Display' },
  { src: '/assets/products/img0089.webp', alt: 'Whole fresh fish on ice', caption: 'Whole Fresh Fish' },
  { src: '/assets/products/store-8.webp', alt: 'Premium seafood selection', caption: 'Premium Seafood' },
  { src: '/assets/products/img0362.webp', alt: 'Tasman Star trucks at Sydney Fish Market', caption: 'Direct from Sydney Fish Market' },
  { src: '/assets/products/store-pic-9.webp', alt: 'Store atmosphere', caption: 'Our Welcoming Store' },
  { src: '/assets/products/img0881.webp', alt: 'Vibrant Alfonsino display', caption: 'Vibrant Alfonsino' },
  { src: '/assets/products/christmas-shop.webp', alt: 'Christmas at Tasman Star', caption: 'Christmas at Tasman Star' },
];

function PhotoCard({ item }: { item: GalleryItem }) {
  const rotateLeftFull = item.rotateLeftFull === true;
  const hasCustomTransform = !rotateLeftFull && item.imageStyle?.transform != null;
  return (
    <div className="relative flex-shrink-0 w-[280px] sm:w-[320px] h-[360px] sm:h-[420px] rounded-2xl overflow-hidden group/card">
      {rotateLeftFull ? (
        /* Rotated wrapper: inner size = card size swapped so after -90deg it fills the card. Full image visible with object-contain. */
        <div className="absolute inset-0 flex items-center justify-center bg-theme-secondary transition-transform duration-700 group-hover/card:scale-105">
          <div className="w-[360px] h-[280px] sm:w-[420px] sm:h-[320px] shrink-0 -rotate-90">
            <img
              src={item.src}
              alt={item.alt}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      ) : hasCustomTransform ? (
        <div className="absolute inset-0 bg-theme-secondary transition-transform duration-700 group-hover/card:scale-105 flex items-center justify-center">
          <img
            src={item.src}
            alt={item.alt}
            className={`absolute inset-0 w-full h-full ${item.imageClassName ?? 'object-cover'}`}
            style={item.imageStyle}
          />
        </div>
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 ${item.imageClassName ?? ''}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-white font-semibold text-base sm:text-lg drop-shadow-md">
          {item.caption}
        </p>
      </div>
    </div>
  );
}

export const StaggerTestimonials: React.FC = () => {
  const allPhotos = [...storePhotos, ...storePhotos];

  return (
    <div className="w-full overflow-hidden py-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="relative">
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32"
          style={{ background: 'linear-gradient(to right, var(--bg-secondary), transparent)' }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32"
          style={{ background: 'linear-gradient(to left, var(--bg-secondary), transparent)' }}
        />

        {/* Marquee track */}
        <div className="flex gap-4 sm:gap-6 hover:[animation-play-state:paused] animate-[store-marquee_60s_linear_infinite] w-max">
          {allPhotos.map((item, i) => (
            <PhotoCard key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
