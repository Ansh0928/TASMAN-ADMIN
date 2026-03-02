import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tasman-admin.vercel.app';

    // Static pages
    const staticPages = [
        '', '/about', '/our-partner', '/our-products', '/deals',
        '/our-business/wholesale', '/our-business/retail-stores',
        '/our-business/online-delivery', '/our-business/transport',
        '/our-business/fishing-fleet', '/auth/login', '/auth/register',
        '/wholesale/apply',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const products = await prisma.product.findMany({
            where: { isAvailable: true },
            select: { slug: true, updatedAt: true },
        });
        productPages = products.map(product => ({
            url: `${baseUrl}/product/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }));
    } catch {
        // Database may not be available during build
    }

    return [...staticPages, ...productPages];
}
