import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        dbUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@'),
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
    };

    try {
        const userCount = await prisma.user.count();
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, email: true, name: true, role: true },
        });
        const productCount = await prisma.product.count();
        results.db = { connected: true, userCount, admins, productCount };
    } catch (err: any) {
        results.db = { connected: false, error: err?.message, code: err?.code };
    }

    return NextResponse.json(results);
}
