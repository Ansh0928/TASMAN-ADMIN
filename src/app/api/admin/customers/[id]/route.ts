import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { sendWholesaleStatusEmail } from '@/lib/resend';
import { sendSMS, wholesaleApprovedSMS, wholesaleRejectedSMS } from '@/lib/twilio';
import { NextRequest, NextResponse, after } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { wholesaleStatus, role, name, email, phone, companyName, abn } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {};

        // Editable fields
        if (name !== undefined) {
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return NextResponse.json({ message: 'Name is required' }, { status: 400 });
            }
            data.name = name.trim();
        }

        if (email !== undefined) {
            if (!email || typeof email !== 'string' || !email.includes('@')) {
                return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
            }
            // Check email uniqueness
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing && existing.id !== id) {
                return NextResponse.json({ message: 'Email already in use by another customer' }, { status: 400 });
            }
            data.email = email.trim().toLowerCase();
        }

        if (phone !== undefined) {
            data.phone = phone ? phone.trim() : null;
        }

        if (companyName !== undefined) {
            data.companyName = companyName ? companyName.trim() : null;
        }

        if (abn !== undefined) {
            data.abn = abn ? abn.trim() : null;
        }

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

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                wholesaleStatus: true,
                companyName: true,
                abn: true,
            },
        });

        // Send notifications when wholesale status changes to APPROVED or REJECTED
        if (wholesaleStatus === 'APPROVED' || wholesaleStatus === 'REJECTED') {
            const userName = user.name;
            const userEmail = user.email;
            const userPhone = user.phone;
            const userId = user.id;
            const companyName = user.companyName;

            after(async () => {
                try {
                    await sendWholesaleStatusEmail({
                        name: userName,
                        email: userEmail,
                        status: wholesaleStatus,
                        companyName,
                    });

                    // SMS notification
                    if (userPhone) {
                        const smsBody = wholesaleStatus === 'APPROVED'
                            ? wholesaleApprovedSMS(userName)
                            : wholesaleRejectedSMS(userName);
                        const result = await sendSMS(userPhone, smsBody);
                        await prisma.notification.create({
                            data: {
                                userId,
                                type: 'SMS',
                                recipient: userPhone,
                                category: 'wholesale_status',
                                status: result.success ? 'SENT' : 'FAILED',
                            },
                        });
                    }
                } catch (err) {
                    console.error('Wholesale status notification error:', err);
                }
            });
        }

        return NextResponse.json({ user });
    } catch (err) {
        console.error('Update customer error:', err);
        return NextResponse.json({ message: 'Failed to update customer' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        // Prevent deleting yourself
        const { session } = await requireAdmin();
        if (session?.user?.id === id) {
            return NextResponse.json({ message: 'You cannot delete your own account' }, { status: 400 });
        }

        // Check if customer exists
        const customer = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, role: true, _count: { select: { orders: true } } },
        });

        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }

        // Delete the customer (cascade deletes addresses)
        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: `Customer "${customer.name}" deleted successfully` });
    } catch (err) {
        console.error('Delete customer error:', err);
        return NextResponse.json({ message: 'Failed to delete customer' }, { status: 500 });
    }
}
