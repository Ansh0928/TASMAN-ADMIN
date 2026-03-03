import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ message: 'Invalid or expired reset link' }, { status: 400 });
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { passwordResetToken: token },
        });

        if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
            return NextResponse.json({ message: 'Invalid or expired reset link' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpiry: null,
            },
        });

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
