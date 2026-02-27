import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import CartIcon from '@/components/CartIcon';
import CartSidebar from '@/components/CartSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import { UserMenu } from '@/components/UserMenu';
import SessionProvider from '@/components/SessionProvider';
import { auth } from '@/lib/auth';

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
      <body className="bg-theme-primary text-theme-secondary font-sans min-h-screen flex justify-center selection:bg-[#FF8543]/30 selection:text-white antialiased">
        <SessionProvider>
        <ThemeProvider>
          <CartProvider>
            <div className="w-full bg-theme-primary min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300">

              {/* Header */}
              <header className="sticky top-0 z-50 w-full bg-theme-header backdrop-blur-md border-b border-theme-accent/20 transition-colors duration-300">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">

                  {/* Logo */}
                  <div className="flex items-center gap-2">
                    <a href="/" className="h-16 w-auto flex items-center bg-theme-primary rounded-xl px-2 transition-colors duration-300">
                      <img src="/assets/tasman-star-logo.png" alt="Tasman Star Seafoods" className="h-12 w-auto object-contain" />
                    </a>
                  </div>

                  {/* Desktop Nav */}
                  <nav className="hidden lg:flex items-center gap-6 font-sans font-medium text-sm text-theme-secondary ml-4 shrink-0">
                    <a href="/" className="hover:text-[#E2743A] transition-colors">Our Business</a>
                    <a href="/about" className="hover:text-[#E2743A] transition-colors">About Us</a>
                    <a href="/our-partner" className="hover:text-[#E2743A] transition-colors">Our Partner</a>
                    <a href="/our-products" className="hover:text-[#E2743A] transition-colors">Our Products</a>
                    <a href="/deals" className="hover:text-[#E2743A] transition-colors flex items-center gap-1 bg-theme-toggle border border-theme-toggle-border px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-[#FF7F50] animate-pulse"></span>
                      Deals
                    </a>
                  </nav>

                  <SearchBar />

                  <div className="flex items-center gap-3 shrink-0">
                    <ThemeToggle />
                    <CartIcon />
                    <UserMenu user={session?.user} />
                  </div>

                </div>
              </header>

              {/* Mobile Nav */}
              <nav className="lg:hidden sticky top-20 z-40 w-full bg-theme-header backdrop-blur-md border-b border-theme-accent/20 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 px-4 py-2 min-w-max">
                  <a href="/" className="text-theme-secondary hover:text-[#E2743A] transition-colors text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap">Our Business</a>
                  <a href="/about" className="text-theme-secondary hover:text-[#E2743A] transition-colors text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap">About Us</a>
                  <a href="/our-partner" className="text-theme-secondary hover:text-[#E2743A] transition-colors text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap">Our Partner</a>
                  <a href="/our-products" className="text-theme-secondary hover:text-[#E2743A] transition-colors text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap">Our Products</a>
                  <a href="/deals" className="text-theme-secondary hover:text-[#E2743A] transition-colors text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF7F50] animate-pulse"></span>
                    Deals
                  </a>
                </div>
              </nav>

              <main className="flex-grow w-full">
                {children}
              </main>

              <CartSidebar />
              <Footer />
            </div>
            <MobileMenu />
          </CartProvider>
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
