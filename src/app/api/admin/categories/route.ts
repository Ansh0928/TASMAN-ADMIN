import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const categories = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return NextResponse.json({ categories });
    } catch (err) {
        console.error('Admin categories error:', err);
        return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, slug, description, imageUrl, sortOrder } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
        }

        // Auto-generate slug from name if not provided
        const generatedSlug = (slug && slug.trim())
            ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check slug uniqueness
        const existing = await prisma.category.findUnique({ where: { slug: generatedSlug } });
        if (existing) {
            return NextResponse.json({ message: `A category with slug "${generatedSlug}" already exists` }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                slug: generatedSlug,
                description: description || null,
                imageUrl: imageUrl || null,
                sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (err) {
        console.error('Create category error:', err);
        return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
    }
}
