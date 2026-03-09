import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wholesale Order',
    description: 'Place a wholesale seafood order with Tasman Star Seafoods.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
