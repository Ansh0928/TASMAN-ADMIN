import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, SearchX } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
    title: 'Search | Tasman Star Seafoods',
    description: 'Search our full range of premium fresh seafood products.',
    openGraph: {
        title: 'Search | Tasman Star Seafoods',
        description: 'Search our full range of premium fresh seafood products.',
        type: 'website',
    },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const query = q?.trim() || '';

    const results = query
        ? await prisma.product.findMany({
              where: {
                  isAvailable: true,
                  OR: [
                      { name: { contains: query, mode: 'insensitive' } },
                      { description: { contains: query, mode: 'insensitive' } },
                      { tags: { hasSome: [query.toLowerCase()] } },
                  ],
              },
              take: 20,
          })
        : [];

    return (
        <div className="flex flex-col w-full bg-theme-primary min-h-screen transition-colors duration-300">
            <section className="container mx-auto px-4 md:px-6 pt-8 pb-4">
                <Link href="/" className="inline-flex items-center gap-1 text-theme-text-muted hover:text-[#FF8543] transition-colors text-sm mb-6">
                    <ChevronLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-3xl md:text-4xl font-serif font-bold text-theme-text mb-2">
                    {query ? `Results for "${query}"` : 'Search'}
                </h1>
                {query && (
                    <p className="text-theme-text-muted text-sm">{results.length} product{results.length !== 1 ? 's' : ''} found</p>
                )}
            </section>

            <section className="container mx-auto px-4 md:px-6 py-8">
                {results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {results.map((product) => {
                            const price = `$${Number(product.price).toFixed(2)}`;
                            const image = product.imageUrls[0];

                            return (
                                <Link
                                    key={product.slug}
                                    href={`/product/${product.slug}`}
                                    className="bg-theme-card rounded-2xl overflow-hidden shadow-lg border border-theme-border flex flex-col group relative hover:border-[#E2743A]/50 transition-colors duration-300"
                                >
                                    <div className="aspect-[4/3] w-full bg-theme-tertiary overflow-hidden relative">
                                        {image ? (
                                            <img src={image} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-theme-tertiary flex items-center justify-center text-theme-text-muted text-4xl">🐟</div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow justify-between">
                                        <div>
                                            <h3 className="text-theme-text font-serif text-lg leading-snug mb-2 group-hover:text-[#E2743A] transition-colors line-clamp-2">{product.name}</h3>
                                        </div>
                                        <div className="flex items-end justify-between mt-auto">
                                            <span className="text-[#FF7F50] font-bold text-xl">{price}</span>
                                            <div className="w-11 h-11 rounded-full bg-[#FF8543] hover:bg-[#1A908A] text-white flex items-center justify-center font-bold text-xl transition-all shadow-md group-hover:scale-110">
                                                +
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : query ? (
                    <div className="text-center py-20">
                        <SearchX size={48} className="text-theme-text-muted mx-auto mb-4" />
                        <p className="text-theme-text-muted text-lg mb-2">No products found for &quot;{query}&quot;</p>
                        <p className="text-theme-text-muted text-sm">Try searching for prawns, salmon, oysters, or platters</p>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-theme-text-muted text-lg">Enter a search term to find products</p>
                    </div>
                )}
            </section>
        </div>
    );
}
