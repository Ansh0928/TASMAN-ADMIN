import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Fishing Fleet',
    description: 'Tasman Star Seafoods operates its own trawler fleet, bringing the freshest catch directly from the ocean to the east coast.',
    alternates: { canonical: '/our-business/fishing-fleet' },
    openGraph: {
        title: 'Our Fishing Fleet | Tasman Star Seafoods',
        description: 'Our own trawler fleet brings the freshest catch directly from the ocean to your table.',
        type: 'website',
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
