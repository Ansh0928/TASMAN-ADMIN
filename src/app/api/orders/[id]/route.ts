import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: order.id,
            guestName: order.guestName,
            guestEmail: order.guestEmail,
            guestPhone: order.guestPhone,
            status: order.status,
            fulfillment: order.fulfillment,
            deliveryStreet: order.deliveryStreet,
            deliveryCity: order.deliveryCity,
            deliveryState: order.deliveryState,
            deliveryPostcode: order.deliveryPostcode,
            pickupTime: order.pickupTime,
            subtotal: order.subtotal.toString(),
            deliveryFee: order.deliveryFee.toString(),
            tax: order.tax.toString(),
            total: order.total.toString(),
            items: order.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toString(),
                total: item.total.toString(),
                product: item.product,
            })),
            stripeInvoiceUrl: order.stripeInvoiceUrl,
            createdAt: order.createdAt,
        });
    } catch (error) {
        console.error('Order fetch error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
