import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const stripeSessionId = request.nextUrl.searchParams.get('session_id');

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

        const session = await auth();

        // Authorization: must be the order owner OR provide the matching Stripe session ID
        const isOwner = session?.user?.id && order.userId === session.user.id;
        const isAdmin = session?.user?.role === 'ADMIN';
        const hasValidStripeSession = stripeSessionId && order.stripeSessionId && stripeSessionId === order.stripeSessionId;

        if (!isOwner && !isAdmin && !hasValidStripeSession) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
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
