import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { notifyWholesalersOfUpdate } from '@/lib/wholesale-notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const categories = await prisma.wholesaleCategory.findMany({
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ categories });
    } catch (err) {
        console.error('Admin wholesale error:', err);
        return NextResponse.json({ message: 'Failed to fetch wholesale data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json();
        const { type } = body;

        if (type === 'category') {
            const { name, sortOrder } = body;
            if (!name) {
                return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
            }
            const category = await prisma.wholesaleCategory.create({
                data: { name, sortOrder: sortOrder || 0 },
            });
            return NextResponse.json({ category }, { status: 201 });
        }

        if (type === 'item') {
            const { categoryId, name, description, unit, price, isAvailable, sortOrder } = body;
            if (!categoryId || !name || !unit || price === undefined) {
                return NextResponse.json({ message: 'categoryId, name, unit, and price are required' }, { status: 400 });
            }
            const item = await prisma.wholesalePriceItem.create({
                data: {
                    categoryId,
                    name,
                    description: description || null,
                    unit,
                    price: parseFloat(price),
                    isAvailable: isAvailable ?? true,
                    sortOrder: sortOrder || 0,
                },
            });
            // Notify wholesalers (fire-and-forget)
            notifyWholesalersOfUpdate().catch(console.error);
            return NextResponse.json({ item }, { status: 201 });
        }

        return NextResponse.json({ message: 'Invalid type. Use "category" or "item".' }, { status: 400 });
    } catch (err) {
        console.error('Create wholesale error:', err);
        return NextResponse.json({ message: 'Failed to create wholesale entry' }, { status: 500 });
    }
}
