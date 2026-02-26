import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const [totalOrders, totalProducts, pendingWholesaleUsers, totalCustomers] = await Promise.all([
            prisma.order.count(),
            prisma.product.count(),
            prisma.user.count({
                where: {
                    role: 'WHOLESALE',
                    wholesaleStatus: 'PENDING',
                },
            }),
            prisma.user.count({
                where: { role: 'CUSTOMER' },
            }),
        ]);

        const orders = await prisma.order.findMany({
            select: { total: true },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

        return NextResponse.json({
            totalOrders,
            totalRevenue,
            totalProducts,
            totalCustomers,
            pendingWholesaleApplications: pendingWholesaleUsers,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
    }
}
