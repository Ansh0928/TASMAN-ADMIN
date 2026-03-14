import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { captureError } from '@/lib/error';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { deleteCached } from '@/lib/redis-cache';

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
                include: { categories: { include: { category: true }, where: { isPrimary: true } } },
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
                category: { id: p.categories[0]?.category.id || '', name: p.categories[0]?.category.name || 'Uncategorized' },
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
        captureError(err, 'Admin products error');
        return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, description, price, categoryIds, primaryCategoryId, imageUrls, stockQuantity, unit, isAvailable, isFeatured, isTodaysSpecial, discountPercent, tags, countryOfOrigin } = body;

        if (!name || !price || !categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
            return NextResponse.json({ message: 'Name, price, and at least one category are required' }, { status: 400 });
        }

        if (primaryCategoryId && !categoryIds.includes(primaryCategoryId)) {
            return NextResponse.json({ message: 'primaryCategoryId must be included in categoryIds' }, { status: 400 });
        }

        const effectivePrimary = primaryCategoryId || categoryIds[0];

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check slug uniqueness
        const existing = await prisma.product.findUnique({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const product = await prisma.$transaction(async (tx) => {
            const created = await tx.product.create({
                data: {
                    name,
                    slug: finalSlug,
                    description: description || null,
                    price: parseFloat(price),
                    imageUrls: imageUrls || [],
                    stockQuantity: stockQuantity || 0,
                    unit: unit || 'PIECE',
                    isAvailable: isAvailable ?? true,
                    isFeatured: isFeatured ?? false,
                    isTodaysSpecial: isTodaysSpecial ?? false,
                    discountPercent: isTodaysSpecial && discountPercent ? parseInt(discountPercent, 10) : null,
                    countryOfOrigin: countryOfOrigin || 'Australia',
                    tags: tags || [],
                },
            });

            await tx.productCategory.createMany({
                data: categoryIds.map((catId: string) => ({
                    productId: created.id,
                    categoryId: catId,
                    isPrimary: catId === effectivePrimary,
                })),
            });

            return tx.product.findUnique({
                where: { id: created.id },
                include: { categories: { include: { category: true } } },
            });
        });

        revalidateTag('products', 'max');
        await deleteCached('categories');
        return NextResponse.json({ product }, { status: 201 });
    } catch (err) {
        captureError(err, 'Create product error');
        return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
    }
}
