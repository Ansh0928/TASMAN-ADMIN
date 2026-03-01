import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const { id } = await params;

    try {
        const order = await prisma.wholesaleOrder.findUnique({
            where: { id },
            include: {
                items: { include: { wholesalePriceItem: true } },
                user: { select: { name: true, email: true, companyName: true } },
            },
        });

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Users can only view their own orders (admins can view any)
        if (user.role !== 'ADMIN' && order.userId !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (err) {
        console.error('Fetch wholesale order error:', err);
        return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
    }
}
