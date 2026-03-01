import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { notifyWholesalersOfUpdate } from '@/lib/wholesale-notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { type } = body;

        if (type === 'category') {
            const { name, sortOrder } = body;
            const category = await prisma.wholesaleCategory.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(sortOrder !== undefined && { sortOrder }),
                },
            });
            return NextResponse.json({ category });
        }

        if (type === 'item') {
            const { name, description, unit, price, isAvailable, isTodaysSpecial, isFeatured, sortOrder, categoryId } = body;
            const item = await prisma.wholesalePriceItem.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(unit && { unit }),
                    ...(price !== undefined && { price: parseFloat(price) }),
                    ...(isAvailable !== undefined && { isAvailable }),
                    ...(isTodaysSpecial !== undefined && { isTodaysSpecial }),
                    ...(isFeatured !== undefined && { isFeatured }),
                    ...(sortOrder !== undefined && { sortOrder }),
                    ...(categoryId && { categoryId }),
                },
            });
            // Notify wholesalers (fire-and-forget)
            notifyWholesalersOfUpdate().catch(console.error);
            return NextResponse.json({ item });
        }

        return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
    } catch (err) {
        console.error('Update wholesale error:', err);
        return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        if (type === 'category') {
            await prisma.wholesaleCategory.delete({ where: { id } });
            return NextResponse.json({ message: 'Category deleted' });
        }

        // Default to item
        await prisma.wholesalePriceItem.delete({ where: { id } });
        return NextResponse.json({ message: 'Item deleted' });
    } catch (err) {
        console.error('Delete wholesale error:', err);
        return NextResponse.json({ message: 'Failed to delete' }, { status: 500 });
    }
}
