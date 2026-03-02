import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true } },
                    items: {
                        include: { product: { select: { name: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            orders: orders.map((o) => ({
                id: o.id,
                customerName: o.user?.name || o.guestName || 'Guest',
                customerEmail: o.user?.email || o.guestEmail || '',
                status: o.status,
                fulfillment: o.fulfillment,
                total: o.total.toString(),
                subtotal: o.subtotal.toString(),
                deliveryFee: o.deliveryFee.toString(),
                tax: o.tax.toString(),
                discountCode: o.discountCode,
                discountAmount: o.discountAmount.toString(),
                notes: o.notes,
                stripePaymentIntent: o.stripePaymentIntent,
                stripeInvoiceUrl: o.stripeInvoiceUrl,
                refundStatus: o.refundStatus,
                refundedAmount: o.refundedAmount.toString(),
                itemCount: o.items.length,
                items: o.items.map((i) => ({
                    productName: i.product.name,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice.toString(),
                    total: i.total.toString(),
                })),
                createdAt: o.createdAt,
            })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('Admin orders error:', err);
        return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
    }
}
