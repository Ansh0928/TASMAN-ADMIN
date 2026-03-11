import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, Phone, Mail, Truck, Scissors, Star, MessageSquare } from 'lucide-react';
import { WholesaleHero } from '@/components/WholesaleHero';

export const metadata: Metadata = {
    title: 'Wholesale Supply',
    description: 'Premium wholesale seafood supply for restaurants, cafes, and grocers. Custom filleting, daily deliveries, and exclusive access to rare species.',
    alternates: { canonical: '/our-business/wholesale' },
    openGraph: {
        title: 'Wholesale Supply | Tasman Star Seafoods',
        description: 'Providing chefs and grocers with uncompromised quality, straight off the boats.',
        type: 'website',
    },
};

export default function WholesalePage() {
    return (
        <div className="min-h-screen bg-theme-primary flex flex-col transition-colors duration-300">

            {/* Hero */}
            <div className="relative overflow-hidden bg-black">
                <WholesaleHero />
            </div>

            <main className="container mx-auto px-4 md:px-8 py-16 max-w-5xl flex flex-col gap-8">

                {/* Row 1: Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-theme-card rounded-2xl border border-theme-border p-6 shadow-sm text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#FF8543]/10 flex items-center justify-center mb-4">
                            <Scissors size={26} className="text-[#FF8543]" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-theme-text mb-2">Custom Filleting</h3>
                        <p className="text-theme-text-muted text-sm">Tailored cuts and portion control to suit your menu.</p>
                    </div>
                    <div className="bg-theme-card rounded-2xl border border-theme-border p-6 shadow-sm text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#FF8543]/10 flex items-center justify-center mb-4">
                            <Truck size={26} className="text-[#FF8543]" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-theme-text mb-2">Daily Deliveries</h3>
                        <p className="text-theme-text-muted text-sm">Fresh stock delivered to your door before 2pm, every day.</p>
                    </div>
                    <div className="bg-theme-card rounded-2xl border border-theme-border p-6 shadow-sm text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#FF8543]/10 flex items-center justify-center mb-4">
                            <Star size={26} className="text-[#FF8543]" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-theme-text mb-2">Exclusive Access</h3>
                        <p className="text-theme-text-muted text-sm">First pick of limited and rare species.</p>
                    </div>
                </div>

                {/* Row 2: Become a Partner | Contact Sales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Become a Partner */}
                    <div className="bg-theme-card rounded-3xl border border-theme-border shadow-lg overflow-hidden flex flex-col">
                        <div className="bg-[#0A192F] p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#FF8543]/10 flex items-center justify-center mx-auto mb-3">
                                <ClipboardList size={28} className="text-[#FF8543]" />
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-white">Become a Partner</h2>
                        </div>
                        <div className="p-6 flex flex-col flex-grow gap-4">
                            <p className="text-theme-text-muted text-sm text-center">
                                Register as a wholesale partner to access daily pricing, priority stock, and flexible delivery schedules.
                            </p>
                            <div className="text-center">
                                <Link
                                    href="/wholesale/apply"
                                    className="inline-block bg-[#FF8543] hover:bg-[#E2743A] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
                                >
                                    Apply for Wholesale
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Contact Sales */}
                    <div className="bg-theme-card rounded-3xl border border-theme-border shadow-lg overflow-hidden flex flex-col">
                        <div className="bg-[#0A192F] p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#FF8543]/10 flex items-center justify-center mx-auto mb-4">
                                <Phone size={32} className="text-[#FF8543]" />
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-white">Contact Sales</h2>
                        </div>
                        <div className="p-6 flex flex-col flex-grow gap-3">
                            <a href="tel:+61755290844" className="flex items-center gap-4 bg-[#0A192F] rounded-2xl p-5 hover:bg-[#112240] transition-colors group">
                                <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                    <Phone size={20} className="text-[#FF8543]" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">Call The Sales Team</p>
                                    <p className="text-[#FF8543] font-bold text-xl">0755076712</p>
                                </div>
                            </a>
                            <a href="mailto:info@tasmanstar.com.au?subject=Wholesale Enquiry" className="flex items-center gap-4 bg-[#0A192F] rounded-2xl p-5 hover:bg-[#112240] transition-colors group">
                                <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                    <MessageSquare size={20} className="text-[#FF8543]" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">Message Us</p>
                                    <p className="text-white font-medium text-sm">Send an enquiry</p>
                                </div>
                            </a>
                            <a href="mailto:info@tasmanstar.com.au" className="flex items-center gap-4 bg-[#0A192F] rounded-2xl p-5 hover:bg-[#112240] transition-colors group">
                                <div className="w-11 h-11 rounded-full bg-[#FF8543]/10 flex items-center justify-center shrink-0">
                                    <Mail size={20} className="text-[#FF8543]" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">Email</p>
                                    <p className="text-white font-medium text-sm">warehouse@tasmanstarseafood.com</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Row 3: Newsletter Sign Up */}
                <div className="bg-gradient-to-br from-[#0A192F] to-[#112240] rounded-3xl p-10 shadow-lg border border-[#FF8543]/20">
                    <div className="max-w-xl mx-auto text-center">
                        <Mail size={36} className="text-[#FF8543] mx-auto mb-4" />
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
                            Sign up to our Daily Product List
                        </h2>
                        <p className="text-slate-300 mb-8">
                            to see what&apos;s available today
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-grow bg-white/10 text-white placeholder-slate-400 px-5 py-3.5 rounded-full border border-white/20 focus:outline-none focus:border-[#FF8543] text-sm"
                            />
                            <button
                                type="submit"
                                className="bg-[#FF8543] hover:bg-[#E2743A] text-white font-bold py-3.5 px-8 rounded-full transition-colors shadow-lg whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

            </main>
        </div>
    );
}
