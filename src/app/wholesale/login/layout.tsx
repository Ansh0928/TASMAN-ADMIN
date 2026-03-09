import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wholesale Login',
    description: 'Sign in to your Tasman Star Seafoods wholesale account.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
