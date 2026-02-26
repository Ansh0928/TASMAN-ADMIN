import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { sendWholesaleStatusEmail } from '@/lib/resend';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { wholesaleStatus, role } = body;

        const data: any = {};

        if (wholesaleStatus) {
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            if (!validStatuses.includes(wholesaleStatus)) {
                return NextResponse.json({ message: 'Invalid wholesale status' }, { status: 400 });
            }
            data.wholesaleStatus = wholesaleStatus;
        }

        if (role) {
            const validRoles = ['CUSTOMER', 'WHOLESALE', 'ADMIN'];
            if (!validRoles.includes(role)) {
                return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
            }
            data.role = role;
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                wholesaleStatus: true,
                companyName: true,
            },
        });

        // Send email notification when wholesale status changes to APPROVED or REJECTED
        if (wholesaleStatus === 'APPROVED' || wholesaleStatus === 'REJECTED') {
            const emailResult = await sendWholesaleStatusEmail({
                name: user.name,
                email: user.email,
                status: wholesaleStatus,
                companyName: user.companyName,
            });
            console.log(`Wholesale ${wholesaleStatus} email to ${user.email}: ${emailResult.success ? 'sent' : 'failed'}`);
        }

        return NextResponse.json({ user });
    } catch (err) {
        console.error('Update customer error:', err);
        return NextResponse.json({ message: 'Failed to update customer' }, { status: 500 });
    }
}
