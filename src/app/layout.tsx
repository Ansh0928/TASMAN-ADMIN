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

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Tasman Star Market | Premium Seafood',
  description: 'Fresh from the ocean, delivered to your door. Premium seafood from Tasman Star — prawns, oysters, salmon, platters & more.',
  openGraph: {
    title: 'Tasman Star Seafood Market',
    description: 'Fresh from the ocean, delivered to your door. Premium seafood — prawns, oysters, salmon, platters & more.',
    type: 'website',
    siteName: 'Tasman Star Seafood Market',
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
      <body className="bg-theme-primary text-theme-secondary font-sans min-h-screen flex justify-center selection:bg-theme-accent/30 selection:text-white antialiased">
        <SessionProvider>
        <ThemeProvider>
          <CartProvider>
          <WishlistProvider>
            <div className="w-full bg-theme-primary min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300">

              {/* Header */}
              <header className="sticky top-0 z-50 w-full bg-theme-header backdrop-blur-md border-b border-theme-accent/20 transition-colors duration-300">
                <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">

                  {/* Logo */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a href="/" className="h-12 sm:h-16 w-auto flex items-center bg-theme-primary rounded-xl px-2 transition-colors duration-300">
                      <img src="/assets/tasman-star-logo.png" alt="Tasman Star Seafoods" className="h-9 sm:h-12 w-auto object-contain" />
                    </a>
                  </div>

                  {/* Desktop Nav */}
                  <nav className="hidden lg:flex items-center gap-6 font-sans font-medium text-sm text-theme-secondary ml-4 shrink-0">
                    {NAV_LINKS.map((link) => (
                      link.label === 'Deals' ? (
                        <a key={link.href} href={link.href} className="hover:text-theme-accent transition-colors flex items-center gap-1 bg-theme-toggle border border-theme-toggle-border px-3 py-1.5 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
                          {link.label}
                        </a>
                      ) : (
                        <a key={link.href} href={link.href} className="hover:text-theme-accent transition-colors">{link.label}</a>
                      )
                    ))}
                    {session?.user?.role === 'WHOLESALE' && session.user.wholesaleStatus === 'APPROVED' && (
                      <a href="/wholesale/prices" className="hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-blue-400">
                        Wholesale
                      </a>
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
              <nav className="lg:hidden w-full bg-theme-header border-b border-theme-accent/20 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 px-4 py-1.5 min-w-max">
                  {NAV_LINKS.map((link) => (
                    link.label === 'Deals' ? (
                      <a key={link.href} href={link.href} className="text-theme-secondary hover:text-theme-accent active:text-theme-accent transition-colors text-sm font-medium px-3 py-3 rounded-full whitespace-nowrap flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
                        {link.label}
                      </a>
                    ) : (
                      <a key={link.href} href={link.href} className="text-theme-secondary hover:text-theme-accent active:text-theme-accent transition-colors text-sm font-medium px-3 py-3 rounded-full whitespace-nowrap">{link.label}</a>
                    )
                  ))}
                  {session?.user?.role === 'WHOLESALE' && session.user.wholesaleStatus === 'APPROVED' && (
                    <a href="/wholesale/prices" className="text-blue-400 hover:text-blue-300 active:text-blue-300 transition-colors text-sm font-medium px-3 py-2.5 rounded-full whitespace-nowrap bg-blue-500/10 border border-blue-500/20">
                      Wholesale
                    </a>
                  )}
                </div>
              </nav>

              <main className="flex-grow w-full pb-16 lg:pb-0">
                {children}
              </main>

              <CartSidebar />
              <Footer />
              <MobileBottomNav />
            </div>
            <MobileMenu user={session?.user} />
            <Toaster theme="dark" position="top-right" richColors closeButton />
          </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
