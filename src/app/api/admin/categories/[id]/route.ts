import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { captureError } from '@/lib/error';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, slug, description, imageUrl, sortOrder } = body;

        // Check category exists
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        // If slug is being changed, validate uniqueness
        if (slug !== undefined && slug !== existing.slug) {
            const normalizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const slugTaken = await prisma.category.findUnique({ where: { slug: normalizedSlug } });
            if (slugTaken && slugTaken.id !== id) {
                return NextResponse.json({ message: `A category with slug "${normalizedSlug}" already exists` }, { status: 400 });
            }
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(slug !== undefined && {
                    slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                }),
                ...(description !== undefined && { description: description || null }),
                ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
                ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder, 10) }),
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return NextResponse.json({ category });
    } catch (err) {
        captureError(err, 'Update category error');
        return NextResponse.json({ message: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        // Check category exists
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        // Prevent deletion if products are associated
        if (category._count.products > 0) {
            return NextResponse.json(
                { message: `Cannot delete category with existing products. This category has ${category._count.products} product(s). Reassign or remove them first.` },
                { status: 400 }
            );
        }

        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ message: 'Category deleted' });
    } catch (err) {
        captureError(err, 'Delete category error');
        return NextResponse.json({ message: 'Failed to delete category' }, { status: 500 });
    }
}
