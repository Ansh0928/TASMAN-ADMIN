import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Apply for Wholesale',
    description: 'Apply for a wholesale account with Tasman Star Seafoods. Get access to wholesale pricing for restaurants, cafes, and grocers.',
    alternates: { canonical: '/wholesale/apply' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
