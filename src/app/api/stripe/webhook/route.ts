import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail, sendPaymentFailureEmail, sendRefundNotificationEmail, sendLowStockAlertEmail } from '@/lib/resend';
import { sendSMS } from '@/lib/twilio';
import { captureError } from '@/lib/error';

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

    console.log(`Processing Stripe event: ${event.id} (${event.type})`);

    // Idempotency: check if this event has already been processed
    try {
        const existing = await prisma.processedWebhookEvent.findUnique({
            where: { eventId: event.id },
        });
        if (existing) {
            console.log(`Duplicate Stripe event skipped: ${event.id}`);
            return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
        }
    } catch (lookupError) {
        console.error('Webhook dedup lookup error:', lookupError);
        // Continue processing if lookup fails — better to process twice than not at all
    }

    // Record the event ID before processing to prevent concurrent duplicates
    try {
        await prisma.processedWebhookEvent.create({
            data: { eventId: event.id, type: event.type },
        });
    } catch (insertError: any) {
        // Unique constraint violation means another request already recorded this event
        if (insertError?.code === 'P2002') {
            console.log(`Duplicate Stripe event skipped (race condition): ${event.id}`);
            return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
        }
        console.error('Webhook dedup insert error:', insertError);
        // Continue processing if insert fails for other reasons
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
                                captureError(invoiceError, `Order ${orderId}: Failed to retrieve invoice`);
                            }
                        }

                        // Atomically reduce stock with guard against overselling
                        try {
                            await prisma.$transaction(async (tx) => {
                                for (const item of order.items) {
                                    const result = await tx.$queryRaw<Array<{ id: string }>>`
                                        UPDATE products
                                        SET stock_quantity = stock_quantity - ${item.quantity}
                                        WHERE id = ${item.productId}
                                        AND stock_quantity >= ${item.quantity}
                                        RETURNING id
                                    `;
                                    if (result.length === 0) {
                                        throw new Error(`Insufficient stock for product ${item.productId}`);
                                    }
                                }
                            });
                        } catch (stockError: any) {
                            captureError(stockError, `Order ${order.id}: Stock decrement failed`);
                        }

                        // Check for low stock after decrement — use after() to avoid blocking response
                        const lowStockItems = await prisma.product.findMany({
                            where: {
                                id: { in: order.items.map(i => i.productId) },
                                stockQuantity: { gt: 0, lte: 5 },
                                isAvailable: true,
                            },
                            select: { name: true, stockQuantity: true },
                        });

                        if (lowStockItems.length > 0) {
                            after(async () => {
                                try {
                                    const result = await sendLowStockAlertEmail({ products: lowStockItems });
                                    await prisma.notification.create({
                                        data: {
                                            orderId: order.id,
                                            type: 'EMAIL',
                                            recipient: process.env.ADMIN_NOTIFICATION_EMAIL || 'techsupport@tasmanstarseafood.com',
                                            category: 'low_stock_alert',
                                            status: result.success ? 'SENT' : 'FAILED',
                                        },
                                    });
                                } catch (err) {
                                    captureError(err, 'Low stock alert email error');
                                }
                            });
                        }

                        // Send order confirmation email (critical — awaited before response)
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

                        // Send order confirmation SMS (non-critical — use after())
                        const customerPhone = order.user?.phone || order.guestPhone;
                        if (customerPhone) {
                            const orderRef = order.id.slice(-8).toUpperCase();
                            after(async () => {
                                try {
                                    const result = await sendSMS(customerPhone, `Tasman Star Seafoods: Payment confirmed! Your order #${orderRef} has been received. We'll notify you when it's being prepared.`);
                                    await prisma.notification.create({
                                        data: {
                                            orderId: order.id,
                                            type: 'SMS',
                                            recipient: customerPhone,
                                            category: 'order_confirmation',
                                            status: result.success ? 'SENT' : 'FAILED',
                                        },
                                    });
                                } catch (err) {
                                    captureError(err, 'Order confirmation SMS error');
                                }
                            });
                        }

                        // Send admin notification (non-critical — use after())
                        after(async () => {
                            try {
                                const result = await sendNewOrderAdminEmail({
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
                                });
                                await prisma.notification.create({
                                    data: {
                                        orderId: order.id,
                                        type: 'EMAIL',
                                        recipient: process.env.ADMIN_NOTIFICATION_EMAIL || 'techsupport@tasmanstarseafood.com',
                                        category: 'admin_new_order',
                                        status: result.success ? 'SENT' : 'FAILED',
                                    },
                                });
                            } catch (err) {
                                captureError(err, 'Admin new order email error');
                            }
                        });
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
                        include: { user: { select: { name: true, email: true, phone: true } } },
                    });

                    // Send payment failure notifications (use after() for reliability)
                    const failedPhone = failedOrder.user?.phone || failedOrder.guestPhone;
                    if (failedPhone) {
                        const orderRef = failedOrder.id.slice(-8).toUpperCase();
                        after(async () => {
                            try {
                                const result = await sendSMS(failedPhone, `Tasman Star Seafoods: Payment for order #${orderRef} could not be processed. Please try again or contact us at info@tasmanstar.com.au`);
                                await prisma.notification.create({
                                    data: {
                                        orderId: failedOrder.id,
                                        type: 'SMS',
                                        recipient: failedPhone,
                                        category: 'payment_failure',
                                        status: result.success ? 'SENT' : 'FAILED',
                                    },
                                });
                            } catch (err) {
                                captureError(err, 'Payment failure SMS error');
                            }
                        });
                    }

                    const failedEmail = failedOrder.user?.email || failedOrder.guestEmail;
                    const failedName = failedOrder.user?.name || failedOrder.guestName || 'Customer';

                    if (failedEmail) {
                        after(async () => {
                            try {
                                const result = await sendPaymentFailureEmail({
                                    orderId: failedOrder.id,
                                    customerName: failedName,
                                    customerEmail: failedEmail,
                                });
                                await prisma.notification.create({
                                    data: {
                                        orderId: failedOrder.id,
                                        type: 'EMAIL',
                                        recipient: failedEmail,
                                        category: 'payment_failure',
                                        status: result.success ? 'SENT' : 'FAILED',
                                    },
                                });
                            } catch (err) {
                                captureError(err, 'Payment failure email error');
                            }
                        });
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
                        include: { user: { select: { name: true, email: true, phone: true } } },
                    });

                    if (order) {
                        const refundedAmountAud = (charge.amount_refunded / 100);
                        const existingRefund = parseFloat(order.refundedAmount.toString());

                        // Idempotency: skip if already processed same or higher refund
                        if (existingRefund >= refundedAmountAud) {
                            console.log(`Order ${order.id}: Refund already processed (existing: $${existingRefund}, incoming: $${refundedAmountAud})`);
                            return NextResponse.json({ received: true }, { status: 200 });
                        }

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

                        // Send refund notifications (use after() for reliability)
                        const refundPhone = order.user?.phone || order.guestPhone;
                        if (refundPhone) {
                            const orderRef = order.id.slice(-8).toUpperCase();
                            after(async () => {
                                try {
                                    const result = await sendSMS(refundPhone, `Tasman Star Seafoods: A $${refundedAmountAud.toFixed(2)} refund for order #${orderRef} has been processed. It may take 5-10 business days to appear.`);
                                    await prisma.notification.create({
                                        data: {
                                            orderId: order.id,
                                            type: 'SMS',
                                            recipient: refundPhone,
                                            category: 'refund',
                                            status: result.success ? 'SENT' : 'FAILED',
                                        },
                                    });
                                } catch (err) {
                                    captureError(err, 'Refund SMS error');
                                }
                            });
                        }

                        // Send refund notification email
                        const refundEmail = order.user?.email || order.guestEmail;
                        const refundName = order.user?.name || order.guestName || 'Customer';
                        if (refundEmail) {
                            after(async () => {
                                try {
                                    const result = await sendRefundNotificationEmail({
                                        orderId: order.id,
                                        customerName: refundName,
                                        customerEmail: refundEmail,
                                        refundAmount: refundedAmountAud.toFixed(2),
                                        isFullRefund,
                                    });
                                    await prisma.notification.create({
                                        data: {
                                            orderId: order.id,
                                            type: 'EMAIL',
                                            recipient: refundEmail,
                                            category: 'refund',
                                            status: result.success ? 'SENT' : 'FAILED',
                                        },
                                    });
                                } catch (err) {
                                    captureError(err, 'Refund notification email error');
                                }
                            });
                        }

                    }
                }
                break;
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        captureError(error, 'Webhook error');
        return NextResponse.json(
            { message: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
