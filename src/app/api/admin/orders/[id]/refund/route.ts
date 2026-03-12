import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { stripe } from '@/lib/stripe';
import { sendRefundNotificationEmail } from '@/lib/resend';
import { NextRequest, NextResponse, after } from 'next/server';
import { captureError } from '@/lib/error';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const { amount, reason } = await request.json();

        const order = await prisma.order.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } } },
        });

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        if (!order.stripePaymentIntent) {
            return NextResponse.json({ message: 'No payment intent found for this order' }, { status: 400 });
        }

        if (order.refundStatus === 'FULL') {
            return NextResponse.json({ message: 'Order has already been fully refunded' }, { status: 400 });
        }

        const totalAud = parseFloat(order.total.toString());
        const alreadyRefunded = parseFloat(order.refundedAmount.toString());
        const maxRefundable = totalAud - alreadyRefunded;

        // If amount specified, validate it; otherwise full refund of remaining
        const refundAmountAud = amount ? parseFloat(amount) : maxRefundable;

        if (refundAmountAud <= 0 || refundAmountAud > maxRefundable) {
            return NextResponse.json(
                { message: `Refund amount must be between $0.01 and $${maxRefundable.toFixed(2)}` },
                { status: 400 }
            );
        }

        const refundAmountCents = Math.round(refundAmountAud * 100);

        // Create refund in Stripe
        const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer'] as const;
        const stripeReason = reason && validReasons.includes(reason) ? reason : undefined;

        await stripe.refunds.create({
            payment_intent: order.stripePaymentIntent,
            amount: refundAmountCents,
            ...(stripeReason ? { reason: stripeReason } : {}),
        });

        const newRefundedTotal = alreadyRefunded + refundAmountAud;
        const isFullRefund = newRefundedTotal >= totalAud - 0.01; // Allow small rounding tolerance

        // Update order in database
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                refundedAmount: newRefundedTotal,
                refundStatus: isFullRefund ? 'FULL' : 'PARTIAL',
                ...(isFullRefund ? { status: 'CANCELLED' } : {}),
            },
        });

        // Send refund notification email
        const customerEmail = order.user?.email || order.guestEmail;
        const customerName = order.user?.name || order.guestName || 'Customer';
        const orderId = order.id;
        const refundAmountFormatted = refundAmountAud.toFixed(2);
        if (customerEmail) {
            after(async () => {
                try {
                    const result = await sendRefundNotificationEmail({
                        orderId,
                        customerName,
                        customerEmail,
                        refundAmount: refundAmountFormatted,
                        isFullRefund,
                    });
                    await prisma.notification.create({
                        data: {
                            orderId,
                            type: 'EMAIL',
                            recipient: customerEmail,
                            category: 'refund',
                            status: result.success ? 'SENT' : 'FAILED',
                        },
                    });
                } catch (err) {
                    captureError(err, 'Refund email error');
                }
            });
        }

        return NextResponse.json({
            order: updatedOrder,
            refundAmount: refundAmountAud,
            isFullRefund,
        });
    } catch (err: any) {
        captureError(err, 'Refund error');
        const message = err?.raw?.message || err?.message || 'Failed to process refund';
        return NextResponse.json({ message }, { status: 500 });
    }
}
