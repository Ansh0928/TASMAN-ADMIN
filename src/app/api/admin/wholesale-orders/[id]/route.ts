import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { resend } from '@/lib/resend';
import { sendSMS } from '@/lib/twilio';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const { status, adminNotes } = await req.json();

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
                user: { select: { name: true, email: true, phone: true } },
                items: { include: { wholesalePriceItem: true } },
            },
        });

        // Notify wholesaler on status change
        if (status && order.user) {
            const statusLabels: Record<string, string> = {
                CONFIRMED: 'confirmed',
                REJECTED: 'declined',
                COMPLETED: 'completed',
            };
            const label = statusLabels[status];
            if (label) {
                // Email notification
                resend.emails.send({
                    from: 'Tasman Star Seafoods <onboarding@resend.dev>',
                    to: order.user.email,
                    subject: `Wholesale Order ${label.charAt(0).toUpperCase() + label.slice(1)} - Tasman Star Seafoods`,
                    html: `<p>Hi ${order.user.name},</p><p>Your wholesale order #${id.slice(-8).toUpperCase()} has been <strong>${label}</strong>.</p>${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}<p>Contact us at info@tasmanstar.com.au with any questions.</p>`,
                }).catch(console.error);

                // SMS notification
                if (order.user.phone) {
                    sendSMS(order.user.phone, `Tasman Star Seafoods: Your wholesale order #${id.slice(-8).toUpperCase()} has been ${label}.`).catch(console.error);
                }
            }
        }

        return NextResponse.json({ order });
    } catch (err) {
        console.error('Update wholesale order error:', err);
        return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
    }
}
