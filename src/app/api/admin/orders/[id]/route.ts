import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { sendPushNotification } from '@/lib/web-push';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                items: {
                    include: { product: { select: { name: true, slug: true, imageUrls: true } } },
                },
                notifications: true,
            },
        });

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (err) {
        console.error('Get order error:', err);
        return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { status } = body;

        const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
        });

        // Send push notifications to the user if they have subscriptions
        if (order.userId) {
            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId: order.userId },
            });

            const statusLabel = status.charAt(0) + status.slice(1).toLowerCase();

            for (const sub of subscriptions) {
                await sendPushNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    {
                        title: 'Order Update',
                        body: `Your order is now ${statusLabel}`,
                        url: `/order-confirmation?order_id=${order.id}`,
                    }
                ).catch((err) => {
                    console.error('Push notification send error:', err);
                });
            }
        }

        return NextResponse.json({ order });
    } catch (err) {
        console.error('Update order error:', err);
        return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
    }
}
