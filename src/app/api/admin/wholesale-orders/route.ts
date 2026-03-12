import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { captureError } from '@/lib/error';
import { NextResponse } from 'next/server';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const orders = await prisma.wholesaleOrder.findMany({
            include: {
                user: { select: { name: true, email: true, phone: true, companyName: true } },
                items: { include: { wholesalePriceItem: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ orders });
    } catch (err) {
        captureError(err, 'Admin wholesale orders error');
        return NextResponse.json({ message: 'Failed to fetch wholesale orders' }, { status: 500 });
    }
}
