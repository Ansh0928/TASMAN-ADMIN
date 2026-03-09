import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Confirmed',
    description: 'Your Tasman Star Seafoods order has been confirmed.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
