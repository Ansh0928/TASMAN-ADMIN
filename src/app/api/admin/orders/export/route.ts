import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest } from 'next/server';
import { captureError } from '@/lib/error';

function escapeCsv(value: string): string {
    // Prevent CSV formula injection (M-4): prefix dangerous chars with single quote
    let safe = value;
    if (/^[=+\-@\t\r]/.test(safe)) {
        safe = `'${safe}`;
    }
    if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
        return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
}

export async function GET(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        const where: any = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { guestName: { contains: search, mode: 'insensitive' } },
                { guestEmail: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const headers = [
            'Order ID', 'Date', 'Customer', 'Email', 'Status', 'Fulfillment',
            'Items', 'Subtotal', 'Delivery', 'Discount', 'Tax', 'Total',
            'Refund Status', 'Refunded Amount', 'Payment Intent',
        ];

        const rows = orders.map((o) => [
            o.id,
            o.createdAt.toISOString(),
            o.user?.name || o.guestName || 'Guest',
            o.user?.email || o.guestEmail || '',
            o.status,
            o.fulfillment,
            o.items.map((i) => `${i.quantity}x ${i.product.name}`).join('; '),
            o.subtotal.toString(),
            o.deliveryFee.toString(),
            o.discountAmount.toString(),
            o.tax.toString(),
            o.total.toString(),
            o.refundStatus,
            o.refundedAmount.toString(),
            o.stripePaymentIntent || '',
        ]);

        const csv = [
            headers.map(escapeCsv).join(','),
            ...rows.map((row) => row.map(escapeCsv).join(',')),
        ].join('\n');

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="orders-export.csv"',
            },
        });
    } catch (err) {
        captureError(err, 'Orders export error');
        return new Response('Failed to export orders', { status: 500 });
    }
}
