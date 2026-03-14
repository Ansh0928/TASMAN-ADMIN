import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      { pathname: '/assets/**', search: '' },
      { pathname: '/**', search: '' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: `${process.env.AWS_S3_BUCKET_NAME || 'tasman-star-seafood'}.s3.${process.env.AWS_S3_REGION || 'ap-southeast-2'}.amazonaws.com`, pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.amazonaws.com; font-src 'self'; connect-src 'self' https://api.stripe.com https://*.amazonaws.com https://accounts.google.com; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Only upload source maps in production with auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress source map upload warnings when no auth token is set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Disable source maps upload when no auth token is available
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    // Delete source maps after upload to keep them out of client bundles
    deleteSourcemapsAfterUpload: true,
  },
});
