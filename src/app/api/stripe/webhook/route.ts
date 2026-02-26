import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json(
            { message: 'Missing signature or secret' },
            { status: 400 }
        );
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json(
            { message: 'Webhook signature verification failed' },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as any;

                if (session.payment_status === 'paid') {
                    const orderId = session.metadata?.orderId;
                    if (orderId) {
                        const order = await prisma.order.update({
                            where: { id: orderId },
                            data: {
                                status: 'CONFIRMED',
                                stripePaymentIntent: session.payment_intent,
                            },
                            include: {
                                items: {
                                    include: { product: true },
                                },
                                user: true,
                            },
                        });

                        // Send order confirmation email
                        const customerEmail = order.user?.email || order.guestEmail;
                        const customerName = order.user?.name || order.guestName || 'Customer';

                        if (customerEmail) {
                            const emailResult = await sendOrderConfirmationEmail({
                                orderId: order.id,
                                customerName,
                                customerEmail,
                                items: order.items,
                                subtotal: order.subtotal.toString(),
                                deliveryFee: order.deliveryFee.toString(),
                                tax: order.tax.toString(),
                                total: order.total.toString(),
                                fulfillment: order.fulfillment,
                                deliveryStreet: order.deliveryStreet,
                                deliveryCity: order.deliveryCity,
                                deliveryState: order.deliveryState,
                                deliveryPostcode: order.deliveryPostcode,
                                pickupTime: order.pickupTime?.toISOString(),
                            });

                            // Log notification
                            await prisma.notification.create({
                                data: {
                                    orderId: order.id,
                                    type: 'EMAIL',
                                    recipient: customerEmail,
                                    status: emailResult.success ? 'SENT' : 'FAILED',
                                },
                            });

                            console.log(`Order ${orderId}: Email ${emailResult.success ? 'sent' : 'failed'} to ${customerEmail}`);
                        }

                        console.log(`Order ${orderId} confirmed`);
                    }
                }
                break;

            case 'checkout.session.async_payment_failed':
                const failedSession = event.data.object as any;
                const failedOrderId = failedSession.metadata?.orderId;
                if (failedOrderId) {
                    await prisma.order.update({
                        where: { id: failedOrderId },
                        data: { status: 'CANCELLED' },
                    });
                    console.log(`Order ${failedOrderId} payment failed`);
                }
                break;
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { message: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
