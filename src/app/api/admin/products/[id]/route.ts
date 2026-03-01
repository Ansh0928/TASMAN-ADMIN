import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

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
            tags: product.tags,
            relatedProductIds: product.relatedProductIds,
        });
    } catch (err) {
        console.error('Get product error:', err);
        return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, description, price, categoryId, imageUrls, stockQuantity, unit, isAvailable, isFeatured, isTodaysSpecial, tags, relatedProductIds } = body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(categoryId && { categoryId }),
                ...(imageUrls && { imageUrls }),
                ...(stockQuantity !== undefined && { stockQuantity }),
                ...(unit && { unit }),
                ...(isAvailable !== undefined && { isAvailable }),
                ...(isFeatured !== undefined && { isFeatured }),
                ...(isTodaysSpecial !== undefined && { isTodaysSpecial }),
                ...(tags && { tags }),
                ...(relatedProductIds !== undefined && { relatedProductIds }),
            },
            include: { category: true },
        });

        return NextResponse.json({ product });
    } catch (err) {
        console.error('Update product error:', err);
        return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Delete product error:', err);
        return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
    }
}
