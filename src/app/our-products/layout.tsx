import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Products | Tasman Star Seafoods',
    description: 'Browse our full selection of premium fresh seafood — prawns, fish fillets, oysters, crabs, sashimi, platters, and more. Delivered fresh from the Gold Coast.',
    openGraph: {
        title: 'Our Products | Tasman Star Seafoods',
        description: 'Browse our full selection of premium fresh seafood delivered fresh from the Gold Coast.',
        type: 'website',
    },
};

export default function OurProductsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
