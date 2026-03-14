import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { captureError } from '@/lib/error';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true },
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
            categoryId: product.categoryId,
            category: { id: product.category.id, name: product.category.name },
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
        const { name, description, price, categoryId, imageUrls, stockQuantity, unit, isAvailable, isFeatured, isTodaysSpecial, discountPercent, tags, countryOfOrigin, relatedProductIds } = body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(categoryId && { categoryId }),
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
            include: { category: true },
        });

        revalidateTag('products', 'max');
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
