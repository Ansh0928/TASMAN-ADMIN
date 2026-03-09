'use client';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

type Logo = {
  src: string;
  alt: string;
  label?: string;
};

type LogoCloudProps = React.ComponentProps<'div'> & {
  logos: Logo[];
};

export function LogoCloud({ logos }: LogoCloudProps) {
  return (
    <div className="relative mx-auto w-full max-w-3xl py-8">
      <InfiniteSlider gap={56} reverse speed={60} speedOnHover={20}>
        {logos.map((logo) => (
          <div key={`logo-${logo.alt}`} className="flex flex-col items-center gap-2">
            <img
              alt={logo.alt}
              className="pointer-events-none h-10 select-none object-contain md:h-14"
              loading="lazy"
              src={logo.src}
            />
            {logo.label && (
              <span className="text-xs md:text-sm font-medium text-theme-text-muted whitespace-nowrap">
                {logo.label}
              </span>
            )}
          </div>
        ))}
      </InfiniteSlider>

      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 left-0 h-full w-[100px]"
        direction="left"
      />
      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 right-0 h-full w-[100px]"
        direction="right"
      />
    </div>
  );
}
