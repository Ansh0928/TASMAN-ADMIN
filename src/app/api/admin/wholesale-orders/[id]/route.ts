import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { sendSMS } from '@/lib/twilio';
import { captureError } from '@/lib/error';
import { NextRequest, NextResponse, after } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const { status, adminNotes, sendNotification } = await req.json();

        const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const order = await prisma.wholesaleOrder.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(adminNotes !== undefined && { adminNotes }),
            },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                items: { include: { wholesalePriceItem: true } },
            },
        });

        // Notify wholesaler only when explicitly requested by admin
        if (sendNotification && status && order.user) {
            const statusLabels: Record<string, string> = {
                CONFIRMED: 'confirmed',
                REJECTED: 'declined',
                COMPLETED: 'completed',
            };
            const label = statusLabels[status];
            if (label) {
                const userEmail = order.user.email;
                const userName = order.user.name;
                const userPhone = order.user.phone;
                const userId = order.user.id;
                const shortId = id.slice(-8).toUpperCase();

                after(async () => {
                    try {
                        // Email notification
                        await resend.emails.send({
                            from: EMAIL_FROM,
                            to: userEmail,
                            subject: `Wholesale Order ${label.charAt(0).toUpperCase() + label.slice(1)} - Tasman Star Seafoods`,
                            html: `<p>Hi ${userName},</p><p>Your wholesale order #${shortId} has been <strong>${label}</strong>.</p>${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}<p>Contact us at info@tasmanstar.com.au with any questions.</p>`,
                        });

                        // SMS notification
                        if (userPhone) {
                            const result = await sendSMS(userPhone, `Tasman Star Seafoods: Your wholesale order #${shortId} has been ${label}.`);
                            await prisma.notification.create({
                                data: {
                                    userId,
                                    type: 'SMS',
                                    recipient: userPhone,
                                    category: 'wholesale_order_status',
                                    status: result.success ? 'SENT' : 'FAILED',
                                },
                            });
                        }
                    } catch (err) {
                        captureError(err, 'Wholesale order notification error');
                    }
                });
            }
        }

        return NextResponse.json({ order });
    } catch (err) {
        captureError(err, 'Update wholesale order error');
        return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
    }
}
