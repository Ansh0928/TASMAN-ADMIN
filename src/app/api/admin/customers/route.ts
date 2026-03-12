import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

export async function GET(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');
        const wholesaleStatus = searchParams.get('wholesaleStatus');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) where.role = role;
        if (wholesaleStatus) where.wholesaleStatus = wholesaleStatus;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    wholesaleStatus: true,
                    companyName: true,
                    abn: true,
                    createdAt: true,
                    _count: { select: { orders: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            customers: users.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                role: u.role,
                wholesaleStatus: u.wholesaleStatus,
                companyName: u.companyName,
                abn: u.abn,
                orderCount: u._count.orders,
                createdAt: u.createdAt,
            })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        captureError(err, 'Admin customers error');
        return NextResponse.json({ message: 'Failed to fetch customers' }, { status: 500 });
    }
}
