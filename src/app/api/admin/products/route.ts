import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products: products.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price.toString(),
                imageUrls: p.imageUrls,
                category: { id: p.category.id, name: p.category.name },
                stockQuantity: p.stockQuantity,
                unit: p.unit,
                isAvailable: p.isAvailable,
                isFeatured: p.isFeatured,
                isTodaysSpecial: p.isTodaysSpecial,
                createdAt: p.createdAt,
            })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('Admin products error:', err);
        return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, description, price, categoryId, imageUrls, stockQuantity, unit, isAvailable, isFeatured, isTodaysSpecial, tags } = body;

        if (!name || !price || !categoryId) {
            return NextResponse.json({ message: 'Name, price, and category are required' }, { status: 400 });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check slug uniqueness
        const existing = await prisma.product.findUnique({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const product = await prisma.product.create({
            data: {
                name,
                slug: finalSlug,
                description: description || null,
                price: parseFloat(price),
                categoryId,
                imageUrls: imageUrls || [],
                stockQuantity: stockQuantity || 0,
                unit: unit || 'PIECE',
                isAvailable: isAvailable ?? true,
                isFeatured: isFeatured ?? false,
                isTodaysSpecial: isTodaysSpecial ?? false,
                tags: tags || [],
            },
            include: { category: true },
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (err) {
        console.error('Create product error:', err);
        return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
    }
}
