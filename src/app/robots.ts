import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/wholesale/prices', '/wholesale/order'],
            },
        ],
        sitemap: 'https://tasman-admin.vercel.app/sitemap.xml',
    };
}
