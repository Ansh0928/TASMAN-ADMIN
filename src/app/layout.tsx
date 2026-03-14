import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import CartIcon from '@/components/CartIcon';
import CartSidebar from '@/components/CartSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import MobileMenuTrigger from '@/components/MobileMenuTrigger';
import MobileBottomNav from '@/components/MobileBottomNav';
import { UserMenu } from '@/components/UserMenu';
import SessionProvider from '@/components/SessionProvider';
import { auth } from '@/lib/auth';
import { Toaster } from 'sonner';
import { NAV_LINKS } from '@/lib/nav-links';
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Tasman Star Seafoods | Premium Seafood Gold Coast',
    template: '%s | Tasman Star Seafoods',
  },
  description: 'Fresh from the ocean, delivered to your door. Premium seafood from Tasman Star Seafoods — prawns, oysters, salmon, platters & more. Gold Coast\'s trusted seafood market.',
  metadataBase: new URL('https://tasman-admin.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tasman Star Seafoods | Premium Seafood Gold Coast',
    description: 'Fresh from the ocean, delivered to your door. Premium seafood — prawns, oysters, salmon, platters & more.',
    type: 'website',
    siteName: 'Tasman Star Seafoods',
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tasman Star Seafoods | Premium Seafood Gold Coast',
    description: 'Fresh from the ocean, delivered to your door. Premium seafood — prawns, oysters, salmon, platters & more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href={`https://${process.env.AWS_S3_BUCKET_NAME || 'tasman-star-seafood'}.s3.${process.env.AWS_S3_REGION || 'ap-southeast-2'}.amazonaws.com`} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://js.stripe.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-theme-primary text-theme-secondary font-sans min-h-screen flex justify-center selection:bg-theme-accent/30 selection:text-white antialiased">
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <SessionProvider>
        <ThemeProvider>
          <CartProvider>
          <WishlistProvider>
            <div className="w-full bg-theme-primary min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300">

              {/* Header */}
              <header className="sticky top-0 z-50 w-full bg-theme-header/95 supports-[backdrop-filter]:backdrop-blur-md border-b border-theme-accent/20 transition-colors duration-300">
                <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">

                  {/* Logo */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/" aria-label="Go to homepage" className="h-12 sm:h-16 w-auto flex items-center bg-theme-primary rounded-xl px-2 transition-colors duration-300">
                      <Image src="/assets/tasman-star-logo.png" alt="Tasman Star Seafoods" width={120} height={48} className="h-9 sm:h-12 w-auto object-contain" priority />
                    </Link>
                  </div>

                  {/* Desktop Nav */}
                  <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 font-sans font-medium text-sm text-theme-secondary ml-4 shrink-0">
                    {NAV_LINKS.map((link) => (
                      link.label === 'Deals' ? (
                        <Link key={link.href} href={link.href} className="hover:text-theme-accent transition-colors flex items-center gap-1 bg-theme-toggle border border-theme-toggle-border px-3 py-1.5 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
                          {link.label}
                        </Link>
                      ) : (
                        <Link key={link.href} href={link.href} className="hover:text-theme-accent transition-colors">{link.label}</Link>
                      )
                    ))}
                    {session?.user?.role === 'WHOLESALE' && session.user.wholesaleStatus === 'APPROVED' && (
                      <Link href="/wholesale/prices" className="hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-blue-400">
                        Wholesale
                      </Link>
                    )}
                  </nav>

                  <SearchBar />

                  <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                    <div className="hidden lg:block">
                      <ThemeToggle />
                    </div>
                    <CartIcon />
                    <div className="hidden lg:flex">
                      <UserMenu user={session?.user} />
                    </div>
                    <MobileMenuTrigger />
                  </div>

                </div>
              </header>

              {/* Mobile Nav */}
              <nav aria-label="Mobile navigation" className="lg:hidden w-full bg-theme-header border-b border-theme-accent/20 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 px-4 py-1.5 min-w-max">
                  {NAV_LINKS.map((link) => (
                    link.label === 'Deals' ? (
                      <Link key={link.href} href={link.href} className="text-theme-secondary hover:text-theme-accent active:text-theme-accent transition-colors text-sm font-medium px-3 py-3 rounded-full whitespace-nowrap flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
                        {link.label}
                      </Link>
                    ) : (
                      <Link key={link.href} href={link.href} className="text-theme-secondary hover:text-theme-accent active:text-theme-accent transition-colors text-sm font-medium px-3 py-3 rounded-full whitespace-nowrap">{link.label}</Link>
                    )
                  ))}
                  {session?.user?.role === 'WHOLESALE' && session.user.wholesaleStatus === 'APPROVED' && (
                    <Link href="/wholesale/prices" className="text-blue-400 hover:text-blue-300 active:text-blue-300 transition-colors text-sm font-medium px-3 py-2.5 rounded-full whitespace-nowrap bg-blue-500/10 border border-blue-500/20">
                      Wholesale
                    </Link>
                  )}
                </div>
              </nav>

              <main id="main-content" className="flex-grow w-full pb-16 lg:pb-0">
                {children}
              </main>

              <CartSidebar />
              <Footer />
              <MobileBottomNav />
            </div>
            <MobileMenu user={session?.user} />
            <Toaster theme="system" position="top-right" richColors closeButton />
          </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
        </SessionProvider>
        {/* Site-wide structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://tasman-admin.vercel.app/#organization',
                  name: 'Tasman Star Seafoods',
                  url: 'https://tasman-admin.vercel.app',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://tasman-admin.vercel.app/assets/tasman-star-logo.png',
                  },
                  description: 'Gold Coast\'s trusted seafood destination — wholesale, retail, fleet, and freight all under one roof.',
                  telephone: '+61755290844',
                  email: 'admin@tasmanstarseafood.com',
                  foundingDate: '2012',
                  address: [
                    { '@type': 'PostalAddress', streetAddress: '5-7 Olsen Ave', addressLocality: 'Labrador', addressRegion: 'QLD', postalCode: '4215', addressCountry: 'AU' },
                    { '@type': 'PostalAddress', streetAddress: '201 Varsity Parade', addressLocality: 'Varsity Lakes', addressRegion: 'QLD', postalCode: '4227', addressCountry: 'AU' },
                  ],
                  sameAs: [
                    'https://www.facebook.com/TasmanStarSeafoodMarket/',
                    'https://www.instagram.com/tasmanstarseafoodmarket/',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://tasman-admin.vercel.app/#website',
                  url: 'https://tasman-admin.vercel.app',
                  name: 'Tasman Star Seafoods',
                  publisher: { '@id': 'https://tasman-admin.vercel.app/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://tasman-admin.vercel.app/search?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}
