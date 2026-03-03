import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail, sendPaymentFailureEmail, sendRefundNotificationEmail } from '@/lib/resend';

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
                        const existing = await prisma.order.findUnique({ where: { id: orderId } });
                        if (!existing || existing.status !== 'PENDING') {
                            return NextResponse.json({ received: true }, { status: 200 });
                        }

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

                        // Retrieve invoice URL if an invoice was created
                        let invoiceUrl: string | undefined;
                        if (session.invoice) {
                            try {
                                const invoice = await stripe.invoices.retrieve(
                                    typeof session.invoice === 'string'
                                        ? session.invoice
                                        : session.invoice.id
                                );
                                const invoiceId = typeof session.invoice === 'string'
                                    ? session.invoice
                                    : session.invoice.id;
                                invoiceUrl = invoice.hosted_invoice_url ?? undefined;

                                await prisma.order.update({
                                    where: { id: orderId },
                                    data: {
                                        stripeInvoiceId: invoiceId,
                                        stripeInvoiceUrl: invoiceUrl ?? null,
                                    },
                                });

                            } catch (invoiceError) {
                                console.error(`Order ${orderId}: Failed to retrieve invoice:`, invoiceError);
                            }
                        }

                        // Reduce stock for each ordered item
                        for (const item of order.items) {
                            await prisma.product.update({
                                where: { id: item.productId },
                                data: {
                                    stockQuantity: {
                                        decrement: item.quantity,
                                    },
                                },
                            });
                        }

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
                                invoiceUrl,
                                deliveryNotes: order.notes,
                                discountCode: order.discountCode,
                                discountAmount: order.discountAmount.toString(),
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

                        }

                        // Send admin notification (fire-and-forget)
                        sendNewOrderAdminEmail({
                            orderId: order.id,
                            customerName,
                            customerEmail: customerEmail!,
                            customerPhone: order.guestPhone || '',
                            items: order.items,
                            total: order.total.toString(),
                            fulfillment: order.fulfillment,
                            deliveryStreet: order.deliveryStreet,
                            deliveryCity: order.deliveryCity,
                            deliveryState: order.deliveryState,
                            deliveryPostcode: order.deliveryPostcode,
                            pickupTime: order.pickupTime?.toISOString(),
                        }).then(async (result) => {
                            await prisma.notification.create({
                                data: {
                                    orderId: order.id,
                                    type: 'EMAIL',
                                    recipient: process.env.ADMIN_NOTIFICATION_EMAIL || 'anshumaansaraf24@gmail.com',
                                    category: 'admin_new_order',
                                    status: result.success ? 'SENT' : 'FAILED',
                                },
                            });
                        }).catch((err) => console.error('Admin new order email error:', err));
                    }
                }
                break;

            case 'checkout.session.async_payment_failed': {
                const failedSession = event.data.object as any;
                const failedOrderId = failedSession.metadata?.orderId;
                if (failedOrderId) {
                    const failedOrder = await prisma.order.update({
                        where: { id: failedOrderId },
                        data: { status: 'CANCELLED' },
                        include: { user: { select: { name: true, email: true } } },
                    });

                    const failedEmail = failedOrder.user?.email || failedOrder.guestEmail;
                    const failedName = failedOrder.user?.name || failedOrder.guestName || 'Customer';

                    if (failedEmail) {
                        sendPaymentFailureEmail({
                            orderId: failedOrder.id,
                            customerName: failedName,
                            customerEmail: failedEmail,
                        }).then(async (result) => {
                            await prisma.notification.create({
                                data: {
                                    orderId: failedOrder.id,
                                    type: 'EMAIL',
                                    recipient: failedEmail,
                                    category: 'payment_failure',
                                    status: result.success ? 'SENT' : 'FAILED',
                                },
                            });
                        }).catch((err) => console.error('Payment failure email error:', err));
                    }

                }
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as any;
                const paymentIntent = charge.payment_intent;
                if (paymentIntent) {
                    const order = await prisma.order.findFirst({
                        where: { stripePaymentIntent: paymentIntent },
                        include: { user: { select: { name: true, email: true } } },
                    });

                    if (order) {
                        const refundedAmountAud = (charge.amount_refunded / 100);
                        const totalAud = parseFloat(order.total.toString());
                        const isFullRefund = refundedAmountAud >= totalAud;

                        await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                refundedAmount: refundedAmountAud,
                                refundStatus: isFullRefund ? 'FULL' : 'PARTIAL',
                                ...(isFullRefund ? { status: 'CANCELLED' } : {}),
                            },
                        });

                        // Send refund notification email
                        const refundEmail = order.user?.email || order.guestEmail;
                        const refundName = order.user?.name || order.guestName || 'Customer';
                        if (refundEmail) {
                            sendRefundNotificationEmail({
                                orderId: order.id,
                                customerName: refundName,
                                customerEmail: refundEmail,
                                refundAmount: refundedAmountAud.toFixed(2),
                                isFullRefund,
                            }).then(async (result) => {
                                await prisma.notification.create({
                                    data: {
                                        orderId: order.id,
                                        type: 'EMAIL',
                                        recipient: refundEmail,
                                        category: 'refund',
                                        status: result.success ? 'SENT' : 'FAILED',
                                    },
                                });
                            }).catch((err) => console.error('Refund notification email error:', err));
                        }

                    }
                }
                break;
            }
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
