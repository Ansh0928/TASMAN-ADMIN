import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccountPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login?callbackUrl=/account');
    }

    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-8">
                    {/* Account Header */}
                    <div>
                        <h1 className="text-4xl font-bold text-theme-text mb-2">My Account</h1>
                        <p className="text-theme-text-muted">Welcome back, {session.user.name || session.user.email}</p>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-theme-secondary border border-theme-border rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-theme-text mb-4">Account Information</h2>
                        <div className="space-y-3 text-theme-text-muted">
                            <div className="flex justify-between">
                                <span>Name:</span>
                                <span className="text-theme-text font-medium">{session.user.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Email:</span>
                                <span className="text-theme-text font-medium">{session.user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Account Type:</span>
                                <span className="text-theme-text font-medium capitalize">{session.user.role?.toLowerCase()}</span>
                            </div>
                            {session.user.role === 'WHOLESALE' && (
                                <div className="flex justify-between pt-2 border-t border-theme-border">
                                    <span>Wholesale Status:</span>
                                    <span className={`font-medium ${
                                        session.user.wholesaleStatus === 'APPROVED'
                                            ? 'text-green-500'
                                            : session.user.wholesaleStatus === 'PENDING'
                                            ? 'text-yellow-500'
                                            : 'text-red-500'
                                    }`}>
                                        {session.user.wholesaleStatus || 'Not applied'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {session.user.role === 'CUSTOMER' && (
                            <>
                                <Link
                                    href="/account/orders"
                                    className="bg-theme-secondary border border-theme-border rounded-lg p-6 hover:border-theme-accent transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-theme-text mb-2">Order History</h3>
                                    <p className="text-theme-text-muted">View your past orders and track deliveries</p>
                                </Link>
                                <Link
                                    href="/account/addresses"
                                    className="bg-theme-secondary border border-theme-border rounded-lg p-6 hover:border-theme-accent transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-theme-text mb-2">Addresses</h3>
                                    <p className="text-theme-text-muted">Manage your delivery addresses</p>
                                </Link>
                            </>
                        )}

                        {session.user.role === 'WHOLESALE' && session.user.wholesaleStatus === 'APPROVED' && (
                            <Link
                                href="/wholesale/prices"
                                className="bg-theme-secondary border border-theme-border rounded-lg p-6 hover:border-theme-accent transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-theme-text mb-2">Wholesale Pricing</h3>
                                <p className="text-theme-text-muted">View current wholesale prices and availability</p>
                            </Link>
                        )}

                        {session.user.role === 'WHOLESALE' && !session.user.wholesaleStatus && (
                            <Link
                                href="/wholesale/apply"
                                className="bg-theme-secondary border border-theme-border rounded-lg p-6 hover:border-theme-accent transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-theme-text mb-2">Apply for Wholesale</h3>
                                <p className="text-theme-text-muted">Complete your wholesale application</p>
                            </Link>
                        )}

                        {session.user.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                className="bg-theme-secondary border border-theme-border rounded-lg p-6 hover:border-theme-accent transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-theme-text mb-2">Admin Dashboard</h3>
                                <p className="text-theme-text-muted">Manage products, orders, and customers</p>
                            </Link>
                        )}
                    </div>

                    {/* Back to Shopping */}
                    <div className="text-center">
                        <Link
                            href="/our-products"
                            className="inline-block px-6 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
