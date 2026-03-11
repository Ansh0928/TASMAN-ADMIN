'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
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
        <footer className="bg-theme-secondary text-theme-text-muted border-t border-theme-accent/20 pt-16 pb-8 z-10 relative">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="h-12 flex items-center bg-theme-primary rounded-xl px-2 w-max mb-2">
                            <img src="/assets/tasman-star-logo.png" alt="Tasman Star Seafoods" className="h-8 w-auto object-contain" />
                        </Link>
                        <p className="text-sm text-theme-text-muted">
                            Premium wholesale and retail seafood sourced directly from the finest pristine waters of Australia and beyond.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <a href="https://www.facebook.com/TasmanStarSeafoodMarket/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full bg-theme-tertiary flex items-center justify-center hover:bg-theme-accent active:bg-theme-accent hover:text-theme-primary active:text-theme-primary transition-colors"><Facebook size={18} /></a>
                            <a href="https://www.instagram.com/tasmanstarseafoodmarket/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full bg-theme-tertiary flex items-center justify-center hover:bg-theme-accent active:bg-theme-accent hover:text-theme-primary active:text-theme-primary transition-colors"><Instagram size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-theme-text font-serif font-bold text-lg mb-6 tracking-wide">Quick Links</h3>
                        <ul className="space-y-1 text-sm">
                            <li><Link href="/" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Our Business</Link></li>
                            <li><Link href="/about" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">About Us</Link></li>
                            <li><Link href="/our-partner" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Our Partner</Link></li>
                            <li><Link href="/our-products" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Our Products</Link></li>
                            <li><Link href="/deals" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Today&apos;s Deals</Link></li>
                            <li><Link href="/wholesale" className="block py-2 hover:text-theme-accent active:text-theme-accent transition-colors">Wholesale</Link></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="text-theme-text font-serif font-bold text-lg mb-6 tracking-wide">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3 items-center">
                                <Phone className="text-theme-accent shrink-0" size={18} />
                                <span>(07) 5522 1221</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="text-theme-accent shrink-0" size={18} />
                                <span>admin@tasmanstarseafood.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-theme-text font-serif font-bold text-lg mb-6 tracking-wide">Newsletter</h3>
                        <p className="text-sm text-theme-text-muted mb-4">
                            Subscribe to get special offers, free giveaways, and fresh catch alerts.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Your email"
                                className="bg-theme-tertiary text-sm w-full px-4 py-3 rounded-l-lg border border-theme-border focus:outline-none focus:border-theme-accent text-theme-text"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-theme-accent hover:bg-theme-accent/90 active:bg-theme-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-theme-primary font-bold px-4 py-3 rounded-r-lg transition-colors"
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
                <div className="border-t border-theme-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-theme-text-muted/70">
                    <p>&copy; {new Date().getFullYear()} Tasman Star Seafoods. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy-policy" aria-label="Privacy Policy" className="hover:text-theme-text transition-colors">Privacy Policy</Link>
                        <a href="#" aria-label="Terms of Service" className="hover:text-theme-text transition-colors">Terms of Service</a>
                        <a href="#" aria-label="Shipping Policy" className="hover:text-theme-text transition-colors">Shipping Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
