import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest } from 'next/server';
import { captureError } from '@/lib/error';

function escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export async function GET(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) where.role = role;

        const users = await prisma.user.findMany({
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
                authProvider: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const headers = [
            'ID', 'Name', 'Email', 'Phone', 'Role', 'Wholesale Status',
            'Company', 'ABN', 'Auth Provider', 'Created At',
        ];

        const rows = users.map((u) => [
            u.id,
            u.name,
            u.email,
            u.phone || '',
            u.role,
            u.wholesaleStatus || '',
            u.companyName || '',
            u.abn || '',
            u.authProvider || '',
            u.createdAt.toISOString(),
        ]);

        const csv = [
            headers.map(escapeCsv).join(','),
            ...rows.map((row) => row.map(escapeCsv).join(',')),
        ].join('\n');

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="customers-export.csv"',
            },
        });
    } catch (err) {
        captureError(err, 'Customers export error');
        return new Response('Failed to export customers', { status: 500 });
    }
}
