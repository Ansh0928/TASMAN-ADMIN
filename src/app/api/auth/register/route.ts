import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { name, email, passwordHash, phone } = await request.json();

        // Validation
        if (!name || !email || !passwordHash) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already in use' },
                { status: 400 }
            );
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                phone: phone || null,
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
