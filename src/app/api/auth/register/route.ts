import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { rateLimit, authLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (5 req/min for auth endpoints)
        const ip = getClientIp(request);
        const { limited, headers: rateLimitHeaders } = await rateLimit(authLimiter, ip);
        if (limited) {
            return NextResponse.json(
                { message: 'Too many requests. Please try again later.' },
                { status: 429, headers: rateLimitHeaders }
            );
        }

        const { name, email, password, phone } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (typeof password !== 'string' || password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        if (!/[A-Z]/.test(password)) {
            return NextResponse.json(
                { message: 'Password must contain at least one uppercase letter' },
                { status: 400 }
            );
        }

        if (!/[a-z]/.test(password)) {
            return NextResponse.json(
                { message: 'Password must contain at least one lowercase letter' },
                { status: 400 }
            );
        }

        if (!/[0-9]/.test(password)) {
            return NextResponse.json(
                { message: 'Password must contain at least one number' },
                { status: 400 }
            );
        }

        if (typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json(
                { message: 'Invalid email address' },
                { status: 400 }
            );
        }

        if (typeof name !== 'string' || name.length > 100) {
            return NextResponse.json(
                { message: 'Name must be 100 characters or fewer' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already in use' },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                passwordHash,
                phone: (typeof phone === 'string' && phone.trim()) || null,
                role: 'CUSTOMER',
                authProvider: 'credentials',
            },
        });

        return NextResponse.json(
            { message: 'User created successfully', user: { id: user.id, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
