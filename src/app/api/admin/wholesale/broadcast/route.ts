import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { resend } from '@/lib/resend';
import { sendSMS } from '@/lib/twilio';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { subject, message, channels } = await req.json();

        if (!subject || !message || !channels || channels.length === 0) {
            return NextResponse.json({ message: 'subject, message, and channels are required' }, { status: 400 });
        }

        const wholesalers = await prisma.user.findMany({
            where: { role: 'WHOLESALE', wholesaleStatus: 'APPROVED' },
            select: { id: true, name: true, email: true, phone: true },
        });

        let emailsSent = 0;
        let smsSent = 0;
        const failures: string[] = [];

        for (const user of wholesalers) {
            if (channels.includes('email')) {
                try {
                    await resend.emails.send({
                        from: 'Tasman Star Seafoods <onboarding@resend.dev>',
                        to: user.email,
                        subject: `${subject} - Tasman Star Seafoods`,
                        html: buildBroadcastEmail(user.name, subject, message),
                    });
                    emailsSent++;
                    await prisma.notification.create({
                        data: { userId: user.id, type: 'EMAIL', recipient: user.email, category: 'broadcast', status: 'SENT' },
                    });
                } catch {
                    failures.push(`Email to ${user.email} failed`);
                    await prisma.notification.create({
                        data: { userId: user.id, type: 'EMAIL', recipient: user.email, category: 'broadcast', status: 'FAILED' },
                    });
                }
            }

            if (channels.includes('sms') && user.phone) {
                try {
                    await sendSMS(user.phone, `Tasman Star Seafoods: ${message}`);
                    smsSent++;
                    await prisma.notification.create({
                        data: { userId: user.id, type: 'SMS', recipient: user.phone, category: 'broadcast', status: 'SENT' },
                    });
                } catch {
                    failures.push(`SMS to ${user.phone} failed`);
                    await prisma.notification.create({
                        data: { userId: user.id, type: 'SMS', recipient: user.phone, category: 'broadcast', status: 'FAILED' },
                    });
                }
            }
        }

        return NextResponse.json({ emailsSent, smsSent, failures, totalRecipients: wholesalers.length });
    } catch (err) {
        console.error('Broadcast error:', err);
        return NextResponse.json({ message: 'Failed to send broadcast' }, { status: 500 });
    }
}

function buildBroadcastEmail(name: string, subject: string, message: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
                <p style="color: #ccc; margin: 8px 0 0;">${subject}</p>
            </div>
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${name},</p>
                <p style="color: #555; white-space: pre-wrap;">${message}</p>
                <p style="color: #555; margin-top: 24px;">
                    Questions? Contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a>
                    or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.
                </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">Tasman Star Seafoods</p>
            </div>
        </div>
    </body>
    </html>`;
}
