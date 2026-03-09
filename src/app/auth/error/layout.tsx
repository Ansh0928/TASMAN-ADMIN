import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Authentication Error',
    description: 'An authentication error occurred. Please try again.',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
