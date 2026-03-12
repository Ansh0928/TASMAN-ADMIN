'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface CategoryData {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
}

interface CategoryCirclesProps {
    categories: CategoryData[];
}

export default function CategoryCircles({ categories }: CategoryCirclesProps) {
    // Only show categories that have images
    const withImages = categories.filter((c) => c.imageUrl);

    if (withImages.length === 0) return null;

    return (
        <section className="py-10">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-theme-text">Browse by Category</h2>
                <p className="text-theme-text-muted text-sm mt-1">Fresh seafood & more!</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-6 px-4 md:px-0">
                {withImages.map((category) => (
                    <Link
                        key={category.id}
                        href={`/our-products?category=${category.slug}`}
                        className="flex flex-col items-center gap-2 group py-2"
                    >
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-theme-border group-hover:border-theme-accent transition-all shadow-md group-hover:shadow-lg group-hover:scale-105">
                            <Image
                                src={category.imageUrl!}
                                alt={category.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                        </div>
                        <span className="text-theme-text text-xs md:text-sm font-medium text-center leading-tight group-hover:text-theme-accent transition-colors">
                            {category.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
