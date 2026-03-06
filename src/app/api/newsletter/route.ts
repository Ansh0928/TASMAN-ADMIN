import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, newsletterLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Feature flag: disable newsletter signups if NEWSLETTER_ENABLED is explicitly "false"
  if (process.env.NEWSLETTER_ENABLED === 'false') {
    return NextResponse.json(
      { message: 'Newsletter signups are currently unavailable.' },
      { status: 503 }
    );
  }

  try {
    // Rate limit check (5 req/min for newsletter)
    const ip = getClientIp(request);
    const { limited, headers: rateLimitHeaders } = await rateLimit(newsletterLimiter, ip);
    if (limited) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429, headers: rateLimitHeaders }
      );
    }

    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.active) {
        // Resubscribe if previously unsubscribed
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { active: true, unsubscribedAt: null },
        });
        return NextResponse.json(
          { message: "Welcome back! You've been resubscribed." },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { message: "You're already subscribed!" },
        { status: 200 }
      );
    }

    await prisma.newsletterSubscription.create({
      data: { email },
    });

    return NextResponse.json(
      { message: "Thanks for subscribing!" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
