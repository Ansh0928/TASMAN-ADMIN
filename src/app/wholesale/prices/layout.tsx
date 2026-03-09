import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wholesale Prices',
    description: 'View current wholesale seafood pricing from Tasman Star Seafoods.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
