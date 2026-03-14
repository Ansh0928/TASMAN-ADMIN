import { NextResponse } from 'next/server';

export async function GET() {
    const checks: Record<string, string> = {
        status: 'ok',
        timestamp: new Date().toISOString(),
    };

    // Test Prisma import
    try {
        const { prisma } = await import('@/lib/prisma');
        const count = await prisma.category.count();
        checks.prisma = `ok (${count} categories)`;
    } catch (err: any) {
        checks.prisma = `error: ${err.message}`;
    }

    // Test captureError import
    try {
        const { captureError } = await import('@/lib/error');
        checks.sentry = `ok (${typeof captureError})`;
    } catch (err: any) {
        checks.sentry = `error: ${err.message}`;
    }

    // Test redis-cache import
    try {
        const { getCached } = await import('@/lib/redis-cache');
        checks.redis = `ok (${typeof getCached})`;
    } catch (err: any) {
        checks.redis = `error: ${err.message}`;
    }

    // Test getCached actual usage (like categories route does)
    try {
        const { prisma } = await import('@/lib/prisma');
        const { getCached } = await import('@/lib/redis-cache');
        const categories = await getCached('debug-test', 10, () =>
            prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
        );
        checks.cached_query = `ok (${categories.length} categories)`;
    } catch (err: any) {
        checks.cached_query = `error: ${err.message}\n${err.stack}`;
    }

    return NextResponse.json(checks);
}
