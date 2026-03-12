import { NextResponse } from 'next/server';
import { captureError } from '@/lib/error';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/password-validation';
import { sendPasswordChangedEmail } from '@/lib/resend';
import { after } from 'next/server';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
        return NextResponse.json(
            { message: passwordCheck.message },
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

    const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: hashed },
        select: { email: true, name: true },
    });

    // Notify user that their password was changed
    after(async () => {
        if (updatedUser.email) {
            try {
                await sendPasswordChangedEmail({ email: updatedUser.email, name: updatedUser.name || 'Customer' });
            } catch (e) {
                captureError(e, 'Password changed notification error');
            }
        }
    });

    return NextResponse.json({ message: 'Password updated successfully' });
}
