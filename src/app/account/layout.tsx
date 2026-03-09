import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Account',
    description: 'Manage your Tasman Star Seafoods account, orders, and delivery addresses.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
