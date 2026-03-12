import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { captureError } from '@/lib/error';

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Cancel PENDING orders older than 24 hours (matches Stripe session expiry)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await prisma.order.updateMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: twentyFourHoursAgo },
            },
            data: { status: 'CANCELLED' },
        });

        console.log(`Cleanup: cancelled ${result.count} abandoned orders`);

        return NextResponse.json({
            cancelled: result.count,
            message: `Cleaned up ${result.count} abandoned orders`,
        });
    } catch (error) {
        captureError(error, 'Cleanup orders error');
        return NextResponse.json({ message: 'Failed to clean up orders' }, { status: 500 });
    }
}
