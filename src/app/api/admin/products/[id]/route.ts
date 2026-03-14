import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { captureError } from '@/lib/error';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { deleteCached } from '@/lib/redis-cache';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { categories: { include: { category: true }, orderBy: { isPrimary: 'desc' } } },
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price.toString(),
            imageUrls: product.imageUrls,
            categories: product.categories.map(pc => ({
                id: pc.category.id,
                name: pc.category.name,
                slug: pc.category.slug,
                isPrimary: pc.isPrimary,
            })),
            primaryCategoryId: product.categories.find(pc => pc.isPrimary)?.category.id || '',
            stockQuantity: product.stockQuantity,
            unit: product.unit,
            isAvailable: product.isAvailable,
            isFeatured: product.isFeatured,
            isTodaysSpecial: product.isTodaysSpecial,
            discountPercent: product.discountPercent,
            tags: product.tags,
            countryOfOrigin: product.countryOfOrigin,
            relatedProductIds: product.relatedProductIds,
        });
    } catch (err) {
        captureError(err, 'Get product error');
        return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, description, price, categoryIds, primaryCategoryId, imageUrls, stockQuantity, unit, isAvailable, isFeatured, isTodaysSpecial, discountPercent, tags, countryOfOrigin, relatedProductIds } = body;

        // Validate category fields: if one is provided, both must be
        if ((categoryIds && !primaryCategoryId) || (!categoryIds && primaryCategoryId)) {
            return NextResponse.json({ message: 'Both categoryIds and primaryCategoryId must be provided together' }, { status: 400 });
        }
        if (categoryIds) {
            if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
                return NextResponse.json({ message: 'categoryIds must be a non-empty array' }, { status: 400 });
            }
            if (!categoryIds.includes(primaryCategoryId)) {
                return NextResponse.json({ message: 'primaryCategoryId must be included in categoryIds' }, { status: 400 });
            }
        }

        const product = await prisma.$transaction(async (tx) => {
            const updated = await tx.product.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(price && { price: parseFloat(price) }),
                    ...(imageUrls && { imageUrls: (imageUrls as string[]).map((u: string) => u.split('?')[0]) }),
                    ...(stockQuantity !== undefined && { stockQuantity }),
                    ...(unit && { unit }),
                    ...(isAvailable !== undefined && { isAvailable }),
                    ...(isFeatured !== undefined && { isFeatured }),
                    ...(isTodaysSpecial !== undefined && { isTodaysSpecial }),
                    ...(discountPercent !== undefined && { discountPercent: discountPercent ? parseInt(discountPercent, 10) : null }),
                    ...(countryOfOrigin !== undefined && { countryOfOrigin }),
                    ...(tags && { tags }),
                    ...(relatedProductIds !== undefined && { relatedProductIds }),
                },
            });

            if (categoryIds) {
                await tx.productCategory.deleteMany({ where: { productId: id } });
                await tx.productCategory.createMany({
                    data: categoryIds.map((catId: string) => ({
                        productId: id,
                        categoryId: catId,
                        isPrimary: catId === primaryCategoryId,
                    })),
                });
            }

            return tx.product.findUnique({
                where: { id },
                include: { categories: { include: { category: true } } },
            });
        });

        revalidateTag('products', 'max');
        await deleteCached('categories');
        return NextResponse.json({ product });
    } catch (err) {
        captureError(err, 'Update product error');
        return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        await prisma.product.delete({ where: { id } });
        revalidateTag('products', 'max');
        return NextResponse.json({ message: 'Product deleted' });
    } catch (err) {
        captureError(err, 'Delete product error');
        return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
    }
}
