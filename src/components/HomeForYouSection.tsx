import ProductCarousel from '@/components/ProductCarousel';
import ProductCard, { type ProductCardData } from '@/components/ProductCard';

interface PersonalizedResponse {
    products: ProductCardData[];
    personalised: boolean;
}

async function fetchPersonalized(): Promise<PersonalizedResponse | null> {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/personalized`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function HomeForYouSection() {
    const data = await fetchPersonalized();

    if (!data || data.products.length === 0) return null;

    const title = data.personalised ? 'For You' : 'Popular This Week';
    const subtitle = data.personalised ? 'Based on your past orders' : 'What others are buying';

    return (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl">
            <ProductCarousel
                title={title}
                subtitle={subtitle}
                viewAllHref="/our-business/online-delivery"
            >
                {data.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </ProductCarousel>
        </section>
    );
}
