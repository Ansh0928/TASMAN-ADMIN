import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
            { message: 'New password must be at least 8 characters' },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
        return NextResponse.json(
            { message: 'Password change is not available for Google-only accounts' },
            { status: 400 }
        );
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
        return NextResponse.json(
            { message: 'Current password is incorrect' },
            { status: 400 }
        );
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: hashed },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
}
