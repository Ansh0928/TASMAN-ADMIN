import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { sendPushNotification } from '@/lib/web-push';
import { sendOrderStatusEmail } from '@/lib/resend';
import { sendSMS, sendOrderStatusSMS } from '@/lib/twilio';
import { NextRequest, NextResponse, after } from 'next/server';

const VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
};

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

        // Validate status transition
        const currentOrder = await prisma.order.findUnique({
            where: { id },
            select: { status: true },
        });

        if (!currentOrder) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        const allowedTransitions = VALID_TRANSITIONS[currentOrder.status] || [];
        if (!allowedTransitions.includes(status)) {
            return NextResponse.json(
                { message: `Cannot transition from ${currentOrder.status} to ${status}` },
                { status: 400 }
            );
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                user: { select: { name: true, email: true, phone: true } },
            },
        });

        const notifyStatuses = ['PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
        const statusLabel = status.charAt(0) + status.slice(1).toLowerCase();

        // Send push notifications to the user if they have subscriptions
        if (order.userId) {
            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId: order.userId },
            });

            for (const sub of subscriptions) {
                sendPushNotification(
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

        // Send email + SMS on meaningful status transitions
        if (notifyStatuses.includes(status)) {
            const customerEmail = order.user?.email || order.guestEmail;
            const customerName = order.user?.name || order.guestName || 'Customer';
            const customerPhone = order.user?.phone || order.guestPhone;
            const orderId = order.id;
            const userId = order.userId;
            const fulfillment = order.fulfillment;
            const notes = order.notes;

            after(async () => {
                try {
                    // Email notification
                    if (customerEmail) {
                        const result = await sendOrderStatusEmail({
                            orderId,
                            customerName,
                            customerEmail,
                            status: status as 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED',
                            fulfillment,
                            deliveryNotes: notes,
                        });
                        await prisma.notification.create({
                            data: {
                                orderId,
                                userId,
                                type: 'EMAIL',
                                recipient: customerEmail,
                                category: 'order_status',
                                status: result.success ? 'SENT' : 'FAILED',
                            },
                        });
                    }

                    // SMS notification
                    if (customerPhone) {
                        const smsBody = sendOrderStatusSMS(orderId, status, fulfillment);
                        const result = await sendSMS(customerPhone, smsBody);
                        await prisma.notification.create({
                            data: {
                                orderId,
                                userId,
                                type: 'SMS',
                                recipient: customerPhone,
                                category: 'order_status',
                                status: result.success ? 'SENT' : 'FAILED',
                            },
                        });
                    }
                } catch (err) {
                    console.error('Order status notification error:', err);
                }
            });
        }

        return NextResponse.json({ order });
    } catch (err) {
        console.error('Update order error:', err);
        return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
    }
}
