import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { companyName, abn, contactName, email, phone, password } = await request.json();

        // Validation
        if (!companyName || !abn || !contactName || !email || !phone || !password) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered. Try signing in instead.' },
                { status: 400 }
            );
        }

        // Create wholesale user with their chosen password
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name: contactName,
                phone,
                role: 'WHOLESALE',
                wholesaleStatus: 'PENDING',
                companyName,
                abn,
            },
        });

        return NextResponse.json(
            { message: 'Application submitted successfully', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Wholesale apply error:', error);
        return NextResponse.json(
            { message: 'Failed to submit application' },
            { status: 500 }
        );
    }
}
