import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { message: 'Authentication required' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
        const skip = (page - 1) * limit;

        const where = { userId: session.user.id };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    slug: true,
                                    imageUrls: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            orders: orders.map((order) => ({
                id: order.id,
                status: order.status,
                fulfillment: order.fulfillment,
                subtotal: order.subtotal.toString(),
                deliveryFee: order.deliveryFee.toString(),
                tax: order.tax.toString(),
                total: order.total.toString(),
                itemCount: order.items.length,
                items: order.items.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice.toString(),
                    total: item.total.toString(),
                    product: {
                        name: item.product.name,
                        slug: item.product.slug,
                        imageUrls: item.product.imageUrls,
                    },
                })),
                stripeInvoiceUrl: order.stripeInvoiceUrl,
                createdAt: order.createdAt,
            })),
            total,
            page,
            totalPages,
        });
    } catch (error) {
        captureError(error, 'Customer orders fetch error');
        return NextResponse.json(
            { message: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
