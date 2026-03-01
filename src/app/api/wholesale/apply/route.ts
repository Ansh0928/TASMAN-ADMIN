import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendWholesaleApplicationReceivedEmail, sendWholesaleNewApplicationAdminEmail } from '@/lib/resend';
import { sendSMS, wholesaleApplicationReceivedSMS } from '@/lib/twilio';

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

        // Send confirmation emails (fire-and-forget — don't block the response)
        const emailData = { name: contactName, email, companyName, abn, phone };

        sendWholesaleApplicationReceivedEmail(emailData)
            .then((r) => console.log(`Wholesale application received email to ${email}: ${r.success ? 'sent' : 'failed'}`))
            .catch((e) => console.error('Wholesale application email error:', e));

        sendWholesaleNewApplicationAdminEmail(emailData)
            .then((r) => console.log(`Wholesale admin notification for ${companyName}: ${r.success ? 'sent' : 'failed'}`))
            .catch((e) => console.error('Wholesale admin notification error:', e));

        // Send SMS to applicant (fire-and-forget)
        if (phone) {
            sendSMS(phone, wholesaleApplicationReceivedSMS(contactName))
                .then((r) => console.log(`Wholesale application SMS to ${phone}: ${r.success ? 'sent' : 'failed'}`))
                .catch((e) => console.error('Wholesale application SMS error:', e));
        }

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
