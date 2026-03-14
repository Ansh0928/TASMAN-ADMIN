'use client';

import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';

interface HomeBestBuysProps {
  products: ProductCardData[];
}

export default function HomeBestBuys({ products }: HomeBestBuysProps) {
  if (products.length === 0) return null;
  return (
    <section className="container mx-auto max-w-7xl pb-16">
      <ProductCarousel
        title="Best Buys"
        subtitle="Our top picks for you"
        viewAllHref="/our-products"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} badge="Best Buy" />
        ))}
      </ProductCarousel>
    </section>
  );
}
