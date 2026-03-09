import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your Tasman Star Seafoods account password.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
