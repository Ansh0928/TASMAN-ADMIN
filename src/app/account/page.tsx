import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from './SignOutButton';
import ProfileEditor from './ProfileEditor';

export default async function AccountPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login?callbackUrl=/account');
    }

    const role = session.user.role;
    const badge = role === 'ADMIN'
        ? { label: 'Admin', color: 'bg-red-500/15 text-red-400 border-red-500/20' }
        : role === 'WHOLESALE'
        ? { label: 'Wholesale', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' }
        : { label: 'Customer', color: 'bg-green-500/15 text-green-400 border-green-500/20' };

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-8">
                    {/* Account Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-theme-text mb-2">My Account</h1>
                            <p className="text-theme-text-muted">Welcome back, {session.user.name || session.user.email}</p>
                        </div>
                        <SignOutButton />
                    </div>

                    {/* Account Info & Profile Editor */}
                    <div className="bg-theme-secondary border border-theme-border rounded-xl p-6 mb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-theme-text-muted">Account Type:</span>
                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${badge.color}`}>
                                {badge.label}
                            </span>
                        </div>
                        {role === 'WHOLESALE' && (
                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-theme-border">
                                <span className="text-theme-text-muted">Wholesale Status:</span>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                                    session.user.wholesaleStatus === 'APPROVED'
                                        ? 'bg-green-500/15 text-green-400 border-green-500/20'
                                        : session.user.wholesaleStatus === 'PENDING'
                                        ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                                        : 'bg-red-500/15 text-red-400 border-red-500/20'
                                }`}>
                                    {session.user.wholesaleStatus || 'Not applied'}
                                </span>
                            </div>
                        )}
                    </div>
                    <ProfileEditor />

                    {/* Quick Links */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {(role === 'CUSTOMER' || role === 'ADMIN') && (
                            <>
                                <Link
                                    href="/account/orders"
                                    className="bg-theme-secondary border border-theme-border rounded-xl p-6 hover:border-theme-accent transition-colors group"
                                >
                                    <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-theme-accent transition-colors">Order History</h3>
                                    <p className="text-theme-text-muted text-sm">View your past orders and track deliveries</p>
                                </Link>
                                <Link
                                    href="/account/addresses"
                                    className="bg-theme-secondary border border-theme-border rounded-xl p-6 hover:border-theme-accent transition-colors group"
                                >
                                    <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-theme-accent transition-colors">Addresses</h3>
                                    <p className="text-theme-text-muted text-sm">Manage your delivery addresses</p>
                                </Link>
                            </>
                        )}

                        {role === 'WHOLESALE' && session.user.wholesaleStatus === 'APPROVED' && (
                            <Link
                                href="/wholesale/prices"
                                className="bg-theme-secondary border border-theme-border rounded-xl p-6 hover:border-theme-accent transition-colors group"
                            >
                                <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-theme-accent transition-colors">Wholesale Pricing</h3>
                                <p className="text-theme-text-muted text-sm">View current wholesale prices and availability</p>
                            </Link>
                        )}

                        {role === 'WHOLESALE' && session.user.wholesaleStatus === 'PENDING' && (
                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Application Pending</h3>
                                <p className="text-theme-text-muted text-sm">Your wholesale application is under review. You'll receive an email once approved.</p>
                            </div>
                        )}

                        {role === 'WHOLESALE' && !session.user.wholesaleStatus && (
                            <Link
                                href="/wholesale/apply"
                                className="bg-theme-secondary border border-theme-border rounded-xl p-6 hover:border-theme-accent transition-colors group"
                            >
                                <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-theme-accent transition-colors">Apply for Wholesale</h3>
                                <p className="text-theme-text-muted text-sm">Complete your wholesale application</p>
                            </Link>
                        )}

                        {role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                className="bg-theme-secondary border border-theme-border rounded-xl p-6 hover:border-theme-accent transition-colors group"
                            >
                                <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-theme-accent transition-colors">Admin Dashboard</h3>
                                <p className="text-theme-text-muted text-sm">Manage products, orders, and customers</p>
                            </Link>
                        )}
                    </div>

                    {/* Back to Shopping */}
                    <div className="text-center">
                        <Link
                            href="/our-products"
                            className="inline-block px-6 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
