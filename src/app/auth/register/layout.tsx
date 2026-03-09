import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create your Tasman Star Seafoods account to start ordering premium seafood online.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
