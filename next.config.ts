import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: `${process.env.AWS_S3_BUCKET_NAME || 'tasman-star-seafood'}.s3.${process.env.AWS_S3_REGION || 'ap-southeast-2'}.amazonaws.com`, pathname: '/**' },
    ],
  },
};

export default nextConfig;
