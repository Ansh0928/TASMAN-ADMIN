import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        const where: Record<string, unknown> = {};
        if (type && ['EMAIL', 'SMS', 'PUSH'].includes(type)) {
            where.type = type;
        }
        if (status && ['SENT', 'FAILED'].includes(status)) {
            where.status = status;
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { sentAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    order: { select: { id: true } },
                    user: { select: { name: true, email: true } },
                },
            }),
            prisma.notification.count({ where }),
        ]);

        return NextResponse.json({
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error('Admin notifications error:', err);
        return NextResponse.json({ message: 'Failed to fetch notifications' }, { status: 500 });
    }
}
