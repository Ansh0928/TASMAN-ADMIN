import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Cancel PENDING orders older than 1 hour (abandoned checkouts)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await prisma.order.updateMany({
        where: {
            status: 'PENDING',
            createdAt: { lt: oneHourAgo },
        },
        data: { status: 'CANCELLED' },
    });

    console.log(`Cleanup: cancelled ${result.count} abandoned orders`);

    return NextResponse.json({
        cancelled: result.count,
        message: `Cleaned up ${result.count} abandoned orders`,
    });
}
