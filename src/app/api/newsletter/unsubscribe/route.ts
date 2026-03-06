import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Newsletter unsubscribe endpoint.
 * Supports both GET (for email link clicks) and POST (for API calls).
 * Required for Australian Spam Act compliance.
 */

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get('email');
    return handleUnsubscribe(email);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim() : '';
        return handleUnsubscribe(email);
    } catch {
        return NextResponse.json(
            { message: 'Invalid request body.' },
            { status: 400 }
        );
    }
}

async function handleUnsubscribe(email: string | null): Promise<NextResponse> {
    if (!email || !email.includes('@')) {
        return NextResponse.json(
            { message: 'Please provide a valid email address.' },
            { status: 400 }
        );
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const subscription = await prisma.newsletterSubscription.findUnique({
            where: { email: normalizedEmail },
        });

        if (!subscription) {
            // Don't reveal whether email exists — return success either way
            return NextResponse.json(
                { message: 'You have been unsubscribed successfully.' },
                { status: 200 }
            );
        }

        if (!subscription.active) {
            return NextResponse.json(
                { message: 'You are already unsubscribed.' },
                { status: 200 }
            );
        }

        await prisma.newsletterSubscription.update({
            where: { email: normalizedEmail },
            data: {
                active: false,
                unsubscribedAt: new Date(),
            },
        });

        return NextResponse.json(
            { message: 'You have been unsubscribed successfully.' },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { message: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}
