import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { captureError } from '@/lib/error';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { endpoint, keys } = body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json(
                { message: 'Missing required subscription fields: endpoint, keys.p256dh, keys.auth' },
                { status: 400 }
            );
        }

        // Require authentication for push subscriptions (M-7)
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Authentication required for push notifications' },
                { status: 401 }
            );
        }
        const userId = session.user.id;

        // Upsert by endpoint — update if exists, create if new
        const subscription = await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                p256dh: keys.p256dh,
                auth: keys.auth,
                userId,
            },
            create: {
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userId,
            },
        });

        return NextResponse.json({ success: true, id: subscription.id });
    } catch (err) {
        captureError(err, 'Push subscribe error');
        return NextResponse.json(
            { message: 'Failed to save push subscription' },
            { status: 500 }
        );
    }
}
