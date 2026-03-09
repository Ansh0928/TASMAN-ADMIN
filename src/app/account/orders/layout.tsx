import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Orders',
    description: 'View your Tasman Star Seafoods order history and track deliveries.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
