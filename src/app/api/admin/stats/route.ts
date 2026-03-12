import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { captureError } from '@/lib/error';
import { NextResponse } from 'next/server';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday start
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalOrders, confirmedOrders, totalProducts, pendingWholesaleUsers, totalCustomers, newCustomersThisMonth, lowStockProducts, lowStockList] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
            prisma.product.count(),
            prisma.user.count({
                where: {
                    role: 'WHOLESALE',
                    wholesaleStatus: 'PENDING',
                },
            }),
            prisma.user.count(),
            prisma.user.count({
                where: { createdAt: { gte: monthStart } },
            }),
            prisma.product.count({
                where: { stockQuantity: { gt: 0, lte: 5 }, isAvailable: true },
            }),
            prisma.product.findMany({
                where: { stockQuantity: { gt: 0, lte: 5 }, isAvailable: true },
                select: { id: true, name: true, stockQuantity: true, slug: true },
                orderBy: { stockQuantity: 'asc' },
                take: 10,
            }),
        ]);

        const orders = await prisma.order.findMany({
            select: { total: true, refundedAmount: true, createdAt: true, status: true },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
        const totalRefunded = orders.reduce((sum, order) => sum + parseFloat(order.refundedAmount.toString()), 0);
        const netRevenue = totalRevenue - totalRefunded;

        // Revenue breakdowns (today, this week, this month)
        let revenueToday = 0;
        let revenueThisWeek = 0;
        let revenueThisMonth = 0;

        for (const order of orders) {
            if (order.status === 'CANCELLED') continue;
            const orderNet = parseFloat(order.total.toString()) - parseFloat(order.refundedAmount.toString());
            if (order.createdAt >= todayStart) revenueToday += orderNet;
            if (order.createdAt >= weekStart) revenueThisWeek += orderNet;
            if (order.createdAt >= monthStart) revenueThisMonth += orderNet;
        }

        // Daily revenue chart (30 days)
        const dailyRevenueMap: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dailyRevenueMap[date.toISOString().slice(0, 10)] = 0;
        }

        // Daily order count (7 days)
        const dailyOrderCountMap: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dailyOrderCountMap[date.toISOString().slice(0, 10)] = 0;
        }

        for (const order of orders) {
            if (order.status === 'CANCELLED') continue;
            const dateKey = order.createdAt.toISOString().slice(0, 10);
            if (dailyRevenueMap[dateKey] !== undefined) {
                dailyRevenueMap[dateKey] += parseFloat(order.total.toString()) - parseFloat(order.refundedAmount.toString());
            }
            if (dailyOrderCountMap[dateKey] !== undefined) {
                dailyOrderCountMap[dateKey] += 1;
            }
        }

        const dailyRevenue = Object.entries(dailyRevenueMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, revenue]) => ({ date, revenue: Math.max(0, revenue) }));

        const orderTrend = Object.entries(dailyOrderCountMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        // Top-selling products (top 5 by quantity)
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });

        const topProductDetails = topProducts.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: topProducts.map(p => p.productId) } },
                select: { id: true, name: true, slug: true },
            })
            : [];

        const topSellingProducts = topProducts.map(tp => {
            const product = topProductDetails.find(p => p.id === tp.productId);
            return {
                id: tp.productId,
                name: product?.name || 'Unknown',
                slug: product?.slug || '',
                totalQuantity: tp._sum.quantity || 0,
            };
        });

        return NextResponse.json({
            totalOrders,
            confirmedOrders,
            totalRevenue,
            totalRefunded,
            netRevenue,
            revenueToday,
            revenueThisWeek,
            revenueThisMonth,
            totalProducts,
            totalCustomers,
            newCustomersThisMonth,
            pendingWholesaleApplications: pendingWholesaleUsers,
            dailyRevenue,
            orderTrend,
            topSellingProducts,
            lowStockProducts,
            lowStockList,
        });
    } catch (error) {
        captureError(error, 'Admin stats error');
        return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
    }
}
