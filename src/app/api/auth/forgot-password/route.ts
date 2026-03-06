import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { escapeHtml } from '@/lib/security';
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

        const { email } = await request.json();
        const genericMessage = "If an account exists with this email, you'll receive a reset link.";

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ message: genericMessage });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

        if (user && user.passwordHash) {
            const token = crypto.randomUUID();
            const expiry = new Date(Date.now() + 60 * 60 * 1000);

            await prisma.user.update({
                where: { id: user.id },
                data: { passwordResetToken: token, passwordResetExpiry: expiry },
            });

            const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

            const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background-color: #0A192F; padding: 30px; text-align: center;">
            <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
            <p style="color: #ccc; margin: 8px 0 0;">Password Reset</p>
        </div>
        <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(user.name || '')},</p>
            <p style="color: #555;">We received a request to reset your password. Click the button below to choose a new password:</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
                    Reset Password
                </a>
            </div>

            <p style="color: #555; font-size: 14px;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>

            <p style="color: #999; font-size: 12px; margin-top: 24px; word-break: break-all;">
                Or copy this link: ${resetUrl}
            </p>

            <p style="color: #555; margin-top: 24px;">
                Questions? Contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a>
                or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.
            </p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">Tasman Star Seafoods</p>
            <p style="color: #999; font-size: 12px; margin: 4px 0;">213 Brisbane Rd, Labrador QLD</p>
        </div>
    </div>
</body>
</html>`;

            resend.emails
                .send({
                    from: EMAIL_FROM,
                    to: user.email,
                    subject: 'Reset Your Password - Tasman Star Seafoods',
                    html,
                })
                .then(() => console.log('Password reset email sent to', user.email))
                .catch((err: unknown) => console.error('Failed to send password reset email:', err));
        }

        return NextResponse.json({ message: genericMessage });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { message: "If an account exists with this email, you'll receive a reset link." }
        );
    }
}
