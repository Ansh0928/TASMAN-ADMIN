import RegionalMapLazy from '@/components/map/RegionalMapLazy';
import HomeBusinessCards from '@/components/HomeBusinessCards';
import HomeBestBuys from '@/components/HomeBestBuys';
import HomeForYouSection from '@/components/HomeForYouSection';
import RecentlyViewed from '@/components/RecentlyViewed';
import { getCachedFeaturedProducts } from '@/lib/query-cache';
import { Suspense } from 'react';

export default async function Home() {
  const bestBuys = await getCachedFeaturedProducts(10);

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

      {/* Hero Banner */}
      <div className="w-full bg-[#0A192F] py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-serif">
            Tasman Star Seafoods
          </h1>
          <p className="text-[#FF8543] font-semibold tracking-[0.3em] uppercase text-sm mb-4">Our Business</p>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg font-light">
            From the boats to the cold trucks, and straight to your business or home. A complete end-to-end seafood supply chain.
          </p>
        </div>
      </div>

      <main className="flex flex-col w-full">

        {/* For You / Popular This Week */}
        <Suspense fallback={null}>
          <HomeForYouSection />
        </Suspense>

        {/* Business Cards */}
        <section className="container mx-auto px-4 md:px-8 py-16 max-w-6xl">
          <HomeBusinessCards />
        </section>

        {/* Explore Our Waters */}
        <section className="container mx-auto px-4 md:px-8 max-w-6xl">
          <RegionalMapLazy />
        </section>

        {/* Best Buys */}
        <HomeBestBuys products={bestBuys} />

        {/* Recently Viewed */}
        <RecentlyViewed />

      </main>
    </div>
  );
}
