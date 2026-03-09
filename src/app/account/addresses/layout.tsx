import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Addresses',
    description: 'Manage your delivery addresses for Tasman Star Seafoods orders.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
