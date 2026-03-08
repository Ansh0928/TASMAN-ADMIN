'use client';

import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    async function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = (await res.json()) as { message: string };
            if (!res.ok) {
                setIsError(true);
                setMessage(data.message || 'Something went wrong.');
                return;
            }
            setMessage(data.message);
            if (res.status === 201) {
                toast.success(data.message);
                setEmail('');
            }
        } catch {
            setIsError(true);
            setMessage('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <footer className="bg-[#0A192F] text-slate-300 border-t border-theme-accent/20 pt-16 pb-8 z-10 relative">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="flex flex-col gap-4">
                        <a href="/" className="h-12 w-auto flex items-center bg-[#020C1B] rounded-xl px-2 w-max mb-2">
                            <img src="/assets/tasman-star-logo.png" alt="Tasman Star Seafoods" className="h-8 w-auto object-contain" />
                        </a>
                        <p className="text-sm text-slate-400">
                            Premium wholesale and retail seafood sourced directly from the finest pristine waters of Australia and beyond.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <a href="#" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-theme-accent active:bg-theme-accent hover:text-[#020C1B] active:text-[#020C1B] transition-colors"><Facebook size={18} /></a>
                            <a href="#" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-theme-accent active:bg-theme-accent hover:text-[#020C1B] active:text-[#020C1B] transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center hover:bg-theme-accent active:bg-theme-accent hover:text-[#020C1B] active:text-[#020C1B] transition-colors"><Twitter size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-serif font-bold text-lg mb-6 tracking-wide">Quick Links</h3>
                        <ul className="space-y-1 text-sm">
                            <li><a href="/" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Our Business</a></li>
                            <li><a href="/about" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">About Us</a></li>
                            <li><a href="/our-partner" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Our Partner</a></li>
                            <li><a href="/our-products" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Our Products</a></li>
                            <li><a href="/deals" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Today&apos;s Deals</a></li>
                            <li><a href="/wholesale" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Wholesale</a></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="text-white font-serif font-bold text-lg mb-6 tracking-wide">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3 items-center">
                                <Phone className="text-theme-accent shrink-0" size={18} />
                                <span>+61 7 5529 0844</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="text-theme-accent shrink-0" size={18} />
                                <span>info@tasmanstar.com.au</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-serif font-bold text-lg mb-6 tracking-wide">Newsletter</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Subscribe to get special offers, free giveaways, and fresh catch alerts.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Your email"
                                className="bg-[#112240] text-sm w-full px-4 py-3 rounded-l-lg border border-white/10 focus:outline-none focus:border-theme-accent text-white"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-theme-accent hover:bg-theme-accent/90 active:bg-theme-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-[#020C1B] font-bold px-4 py-3 rounded-r-lg transition-colors"
                            >
                                {loading ? '...' : 'Subscribe'}
                            </button>
                        </form>
                        {message && (
                            <p className={`text-xs mt-2 ${isError ? 'text-red-400' : 'text-emerald-400'}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Tasman Star Seafoods. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Shipping Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
