import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0A192F] text-slate-300 border-t border-[#FF8543]/20 pt-16 pb-8 z-10 relative">
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
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FF8543] hover:text-[#020C1B] transition-colors"><Facebook size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FF8543] hover:text-[#020C1B] transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FF8543] hover:text-[#020C1B] transition-colors"><Twitter size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-serif font-bold text-lg mb-6 tracking-wide">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/" className="hover:text-[#FF8543] transition-colors">Our Business</a></li>
                            <li><a href="/about" className="hover:text-[#FF8543] transition-colors">About Us</a></li>
                            <li><a href="/our-partner" className="hover:text-[#FF8543] transition-colors">Our Partner</a></li>
                            <li><a href="/our-products" className="hover:text-[#FF8543] transition-colors">Our Products</a></li>
                            <li><a href="/deals" className="hover:text-[#FF8543] transition-colors">Today&apos;s Deals</a></li>
                            <li><a href="/wholesale" className="hover:text-[#FF8543] transition-colors">Wholesale</a></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="text-white font-serif font-bold text-lg mb-6 tracking-wide">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3">
                                <MapPin className="text-[#FF8543] shrink-0" size={18} />
                                <span>213 Brisbane Rd, Labrador QLD<br />201 Varsity Parade, Varsity Lakes QLD</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Phone className="text-[#FF8543] shrink-0" size={18} />
                                <span>+61 7 5529 0844</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="text-[#FF8543] shrink-0" size={18} />
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
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="bg-[#112240] text-sm w-full px-4 py-2.5 rounded-l-lg border border-white/10 focus:outline-none focus:border-[#FF8543] text-white"
                            />
                            <button className="bg-[#FF8543] hover:bg-[#E2743A] text-[#020C1B] font-bold px-4 rounded-r-lg transition-colors">
                                Subscribe
                            </button>
                        </div>
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
