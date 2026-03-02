import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const categorySlug = searchParams.get('category');
        const featured = searchParams.get('featured') === 'true';
        const todaysSpecial = searchParams.get('todaysSpecial') === 'true';
        const limit = parseInt(searchParams.get('limit') || '12', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);

        const skip = (page - 1) * limit;

        // Build filters
        const where: any = { isAvailable: true };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (categorySlug) {
            where.category = {
                slug: categorySlug,
            };
        }

        if (featured) {
            where.isFeatured = true;
        }

        if (todaysSpecial) {
            where.isTodaysSpecial = true;
        }

        // Fetch products
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json(
            {
                products: products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    price: p.price.toString(),
                    imageUrls: p.imageUrls,
                    category: {
                        id: p.category.id,
                        name: p.category.name,
                        slug: p.category.slug,
                    },
                    unit: p.unit,
                    stockQuantity: p.stockQuantity,
                    isFeatured: p.isFeatured,
                    isTodaysSpecial: p.isTodaysSpecial,
                    tags: p.tags,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
