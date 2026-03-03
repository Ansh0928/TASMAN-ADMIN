import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const [totalOrders, confirmedOrders, totalProducts, pendingWholesaleUsers, totalCustomers] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
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
            select: { total: true, refundedAmount: true, createdAt: true, status: true },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
        const totalRefunded = orders.reduce((sum, order) => sum + parseFloat(order.refundedAmount.toString()), 0);
        const netRevenue = totalRevenue - totalRefunded;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyRevenueMap: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dailyRevenueMap[date.toISOString().slice(0, 10)] = 0;
        }

        for (const order of orders) {
            if (order.status === 'CANCELLED') continue;
            const dateKey = order.createdAt.toISOString().slice(0, 10);
            if (dailyRevenueMap[dateKey] !== undefined) {
                dailyRevenueMap[dateKey] += parseFloat(order.total.toString()) - parseFloat(order.refundedAmount.toString());
            }
        }

        const dailyRevenue = Object.entries(dailyRevenueMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, revenue]) => ({ date, revenue: Math.max(0, revenue) }));

        return NextResponse.json({
            totalOrders,
            confirmedOrders,
            totalRevenue,
            totalRefunded,
            netRevenue,
            totalProducts,
            totalCustomers,
            pendingWholesaleApplications: pendingWholesaleUsers,
            dailyRevenue,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
    }
}
