import { NextResponse } from 'next/server';

export async function GET() {
    const checks: Record<string, string> = {
        status: 'ok',
        timestamp: new Date().toISOString(),
    };

    // Test Prisma connection
    try {
        const { prisma } = await import('@/lib/prisma');
        const count = await prisma.category.count();
        checks.db = `connected (${count} categories)`;
    } catch (err: any) {
        checks.db = `error: ${err.message}`;
    }

    return NextResponse.json(checks);
}
