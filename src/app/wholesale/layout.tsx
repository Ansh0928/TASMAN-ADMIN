import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wholesale Seafood',
    description: 'Tasman Star Seafoods wholesale program — premium seafood supply for restaurants, cafes, and grocers on the Gold Coast and beyond.',
    alternates: { canonical: '/wholesale' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
