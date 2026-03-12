import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendWholesaleApplicationReceivedEmail, sendWholesaleNewApplicationAdminEmail } from '@/lib/resend';
import { sendSMS, wholesaleApplicationReceivedSMS } from '@/lib/twilio';
import { rateLimit, apiLimiter, getClientIp } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/password-validation';
import { after } from 'next/server';
import { captureError } from '@/lib/error';

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (10 req/min for API endpoints)
        const ip = getClientIp(request);
        const { limited, headers: rateLimitHeaders } = await rateLimit(apiLimiter, ip);
        if (limited) {
            return NextResponse.json(
                { message: 'Too many requests. Please try again later.' },
                { status: 429, headers: rateLimitHeaders }
            );
        }

        const { companyName, abn, contactName, email, phone, password } = await request.json();

        // Validation
        if (!companyName || !abn || !contactName || !email || !phone || !password) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            return NextResponse.json(
                { message: passwordCheck.message },
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
                authProvider: 'credentials',
            },
        });

        // Send notifications after response (non-blocking)
        const emailData = { name: contactName, email, companyName, abn, phone };
        const userId = user.id;

        after(async () => {
            try {
                await sendWholesaleApplicationReceivedEmail(emailData);
            } catch (e) {
                captureError(e, 'Wholesale application email error');
            }

            try {
                await sendWholesaleNewApplicationAdminEmail(emailData);
            } catch (e) {
                captureError(e, 'Wholesale admin notification error');
            }

            if (phone) {
                try {
                    const result = await sendSMS(phone, wholesaleApplicationReceivedSMS(contactName));
                    await prisma.notification.create({
                        data: {
                            userId,
                            type: 'SMS',
                            recipient: phone,
                            category: 'wholesale_application',
                            status: result.success ? 'SENT' : 'FAILED',
                        },
                    });
                } catch (e) {
                    captureError(e, 'Wholesale application SMS error');
                }
            }
        });

        return NextResponse.json(
            { message: 'Application submitted successfully', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        captureError(error, 'Wholesale apply error');
        return NextResponse.json(
            { message: 'Failed to submit application' },
            { status: 500 }
        );
    }
}
