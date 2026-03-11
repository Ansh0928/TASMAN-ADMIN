import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Tasman Star Seafoods — how we collect, use, and protect your personal information under Australian law.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold text-theme-text font-serif mb-2">
                    Privacy Policy
                </h1>
                <p className="text-theme-text-muted text-sm mb-12">
                    Last updated: 12 March 2026
                </p>

                <div className="prose prose-invert max-w-none space-y-10 text-theme-text-muted text-[15px] leading-relaxed">

                    {/* 1. Introduction */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">1. Introduction</h2>
                        <p>
                            Tasman Star Distribution Pty Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website{' '}
                            <span className="text-theme-accent">tasmanstarseafoods.com.au</span> and associated retail stores
                            located at 5-7 Olsen Ave, Labrador QLD 4215 and 201 Varsity Parade, Varsity Lakes QLD 4227.
                        </p>
                        <p className="mt-3">
                            We are committed to protecting your personal information in accordance with the{' '}
                            <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).
                            This Privacy Policy explains how we collect, hold, use, and disclose your personal information.
                        </p>
                    </section>

                    {/* 2. Information We Collect */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">2. Information We Collect</h2>
                        <p>We may collect the following types of personal information:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li><strong className="text-theme-text">Identity information:</strong> full name, email address, phone number</li>
                            <li><strong className="text-theme-text">Account information:</strong> login credentials (email and hashed password), Google OAuth profile data</li>
                            <li><strong className="text-theme-text">Delivery information:</strong> street address, suburb, state, postcode</li>
                            <li><strong className="text-theme-text">Payment information:</strong> processed securely through Stripe — we do not store your credit card details on our servers</li>
                            <li><strong className="text-theme-text">Order information:</strong> products ordered, order history, order value</li>
                            <li><strong className="text-theme-text">Wholesale application data:</strong> business name, ABN/ACN, business type, trade references</li>
                            <li><strong className="text-theme-text">Communication data:</strong> emails, SMS messages, and push notifications you receive from us</li>
                            <li><strong className="text-theme-text">Technical data:</strong> IP address, browser type, device information, and cookies for website functionality</li>
                            <li><strong className="text-theme-text">Newsletter subscription:</strong> email address for marketing communications</li>
                        </ul>
                    </section>

                    {/* 3. How We Collect Information */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">3. How We Collect Information</h2>
                        <p>We collect personal information through:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>Account registration on our website</li>
                            <li>Placing an order (online or in-store)</li>
                            <li>Wholesale account applications</li>
                            <li>Newsletter sign-up forms</li>
                            <li>Contacting us via email, phone, or social media</li>
                            <li>Google OAuth sign-in (with your consent)</li>
                            <li>Web push notification subscriptions</li>
                            <li>Cookies and similar technologies when you browse our website</li>
                        </ul>
                    </section>

                    {/* 4. Purpose of Collection */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">4. Why We Collect Your Information</h2>
                        <p>We use your personal information to:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>Process and fulfil your orders, including delivery</li>
                            <li>Manage your account and provide customer support</li>
                            <li>Process payments securely via Stripe</li>
                            <li>Assess and manage wholesale applications</li>
                            <li>Send order confirmations, shipping updates, and receipts via email and SMS</li>
                            <li>Send promotional offers and newsletters (with your consent)</li>
                            <li>Send push notifications about deals and order updates (with your consent)</li>
                            <li>Improve our website, products, and services</li>
                            <li>Comply with legal obligations and resolve disputes</li>
                            <li>Detect and prevent fraud</li>
                        </ul>
                    </section>

                    {/* 5. Third-Party Disclosure */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">5. Third-Party Disclosure</h2>
                        <p>
                            We do not sell, trade, or rent your personal information. We may share your information
                            with the following trusted third-party service providers who assist us in operating our business:
                        </p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li><strong className="text-theme-text">Stripe</strong> (United States) — payment processing</li>
                            <li><strong className="text-theme-text">Resend</strong> (United States) — transactional and marketing emails</li>
                            <li><strong className="text-theme-text">Twilio</strong> (United States) — SMS notifications</li>
                            <li><strong className="text-theme-text">Amazon Web Services (AWS)</strong> — image and file storage (S3)</li>
                            <li><strong className="text-theme-text">Vercel</strong> (United States) — website hosting</li>
                            <li><strong className="text-theme-text">Neon</strong> — database hosting</li>
                            <li><strong className="text-theme-text">Google</strong> — OAuth authentication (if you choose to sign in with Google)</li>
                        </ul>
                        <p className="mt-3">
                            These providers are bound by their own privacy policies and data protection obligations.
                            Where your data is transferred overseas (including to the United States), we take reasonable
                            steps to ensure it is protected in accordance with the APPs.
                        </p>
                    </section>

                    {/* 6. Cross-Border Disclosure */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">6. Cross-Border Disclosure</h2>
                        <p>
                            Some of our third-party service providers are located in the United States. By using our
                            services, you consent to the transfer of your personal information to these overseas
                            recipients. We take reasonable steps to ensure that overseas recipients handle your
                            personal information in accordance with the APPs (APP 8).
                        </p>
                    </section>

                    {/* 7. Cookies */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">7. Cookies and Tracking</h2>
                        <p>Our website uses cookies and similar technologies to:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>Maintain your login session</li>
                            <li>Remember your shopping cart</li>
                            <li>Store your theme preference (light/dark mode)</li>
                            <li>Analyse website usage and improve performance</li>
                        </ul>
                        <p className="mt-3">
                            You can control cookies through your browser settings. Disabling cookies may affect
                            the functionality of our website, including your ability to place orders.
                        </p>
                    </section>

                    {/* 8. Data Security */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">8. Data Security</h2>
                        <p>We take reasonable steps to protect your personal information from:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>Unauthorised access, modification, or disclosure</li>
                            <li>Misuse, interference, and loss</li>
                        </ul>
                        <p className="mt-3">Our security measures include:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>Encrypted HTTPS connections across the entire website</li>
                            <li>Hashed and salted passwords (we never store plaintext passwords)</li>
                            <li>Stripe PCI-DSS compliant payment processing — card details never touch our servers</li>
                            <li>Content Security Policy (CSP) headers</li>
                            <li>Rate limiting on API endpoints to prevent abuse</li>
                            <li>CSRF protection on all form submissions</li>
                            <li>Role-based access control for administrative functions</li>
                        </ul>
                    </section>

                    {/* 9. Data Retention */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">9. Data Retention</h2>
                        <p>
                            We retain your personal information only for as long as necessary to fulfil the purposes
                            for which it was collected, or as required by law. Specifically:
                        </p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li><strong className="text-theme-text">Account data:</strong> retained while your account is active, and for a reasonable period after deletion request</li>
                            <li><strong className="text-theme-text">Order records:</strong> retained for 7 years in accordance with Australian tax law requirements</li>
                            <li><strong className="text-theme-text">Newsletter subscriptions:</strong> retained until you unsubscribe</li>
                            <li><strong className="text-theme-text">Abandoned orders:</strong> automatically cleaned up after a reasonable period</li>
                        </ul>
                    </section>

                    {/* 10. Your Rights */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">10. Your Rights Under the Privacy Act</h2>
                        <p>Under the Australian Privacy Principles, you have the right to:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li><strong className="text-theme-text">Access</strong> — request a copy of the personal information we hold about you (APP 12)</li>
                            <li><strong className="text-theme-text">Correction</strong> — request correction of inaccurate, out-of-date, or incomplete information (APP 13)</li>
                            <li><strong className="text-theme-text">Opt out</strong> — unsubscribe from marketing communications at any time using the unsubscribe link in our emails or by contacting us</li>
                            <li><strong className="text-theme-text">Complain</strong> — lodge a complaint if you believe we have breached your privacy</li>
                        </ul>
                        <p className="mt-3">
                            To exercise any of these rights, please contact us using the details in Section 13 below.
                            We will respond to your request within 30 days.
                        </p>
                    </section>

                    {/* 11. Direct Marketing */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">11. Direct Marketing</h2>
                        <p>
                            We may use your personal information to send you marketing communications about our
                            products, special offers, and events. We will only do so where:
                        </p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>You have provided your consent (e.g., by subscribing to our newsletter)</li>
                            <li>You would reasonably expect to receive such communications based on your relationship with us</li>
                        </ul>
                        <p className="mt-3">
                            You can opt out of marketing communications at any time by clicking the &quot;unsubscribe&quot;
                            link in our emails, replying STOP to our SMS messages, or contacting us directly.
                            We comply with the <em>Spam Act 2003</em> (Cth) and the <em>Do Not Call Register Act 2006</em> (Cth).
                        </p>
                    </section>

                    {/* 12. Children */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">12. Children&apos;s Privacy</h2>
                        <p>
                            Our services are not directed to individuals under 18 years of age. We do not
                            knowingly collect personal information from children. If you believe a child has
                            provided us with personal information, please contact us and we will take steps
                            to delete such information.
                        </p>
                    </section>

                    {/* 13. Contact */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">13. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, wish to make a complaint, or
                            want to exercise your rights, please contact us:
                        </p>
                        <div className="mt-4 bg-theme-secondary rounded-xl p-6 border border-theme-border space-y-2">
                            <p><strong className="text-theme-text">Tasman Star Distribution Pty Ltd</strong></p>
                            <p>5-7 Olsen Ave, Labrador QLD 4215</p>
                            <p>Phone: <a href="tel:+61755221221" className="text-theme-accent hover:underline">(07) 5522 1221</a></p>
                            <p>Email: <a href="mailto:admin@tasmanstarseafood.com" className="text-theme-accent hover:underline">admin@tasmanstarseafood.com</a></p>
                        </div>
                    </section>

                    {/* 14. OAIC */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">14. Complaints to the OAIC</h2>
                        <p>
                            If you are not satisfied with our response to your privacy complaint, you may lodge
                            a complaint with the Office of the Australian Information Commissioner (OAIC):
                        </p>
                        <div className="mt-4 bg-theme-secondary rounded-xl p-6 border border-theme-border space-y-2">
                            <p><strong className="text-theme-text">Office of the Australian Information Commissioner</strong></p>
                            <p>GPO Box 5218, Sydney NSW 2001</p>
                            <p>Phone: 1300 363 992</p>
                            <p>Website: <span className="text-theme-accent">oaic.gov.au</span></p>
                        </div>
                    </section>

                    {/* 15. Changes */}
                    <section>
                        <h2 className="text-xl font-bold text-theme-text font-serif mb-3">15. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in our practices
                            or legal requirements. Any changes will be posted on this page with an updated
                            &quot;Last updated&quot; date. We encourage you to review this page periodically.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
