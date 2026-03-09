import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validatePassword } from '@/lib/password-validation';
import { rateLimit, authLimiter, getClientIp } from '@/lib/rate-limit';
import { sendPasswordChangedEmail } from '@/lib/resend';

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

        const { token, password } = await request.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ message: 'Invalid or expired reset link' }, { status: 400 });
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            return NextResponse.json({ message: passwordCheck.message }, { status: 400 });
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

        // Notify user that password was changed
        if (user.email) {
            sendPasswordChangedEmail({ email: user.email, name: user.name || 'Customer' })
                .catch((e) => console.error('Password changed notification error:', e));
        }

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
