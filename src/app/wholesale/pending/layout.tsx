import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Application Pending',
    description: 'Your Tasman Star Seafoods wholesale application is being reviewed.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
