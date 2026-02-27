import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

// Simple test route — send a test email to verify Resend is working
// DELETE THIS FILE before going to production!
export async function POST(request: NextRequest) {
    try {
        const { to } = await request.json();

        if (!to) {
            return NextResponse.json(
                { message: 'Please provide a "to" email address' },
                { status: 400 }
            );
        }

        const result = await resend.emails.send({
            from: 'Tasman Star Seafoods <onboarding@resend.dev>',
            to,
            subject: 'Test Email - Tasman Star Seafoods',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                    <h1 style="color: #FF8543; margin: 0;">Tasman Star Seafoods</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #333;">Email Test Successful!</h2>
                    <p style="color: #555;">If you're reading this, your Resend email integration is working correctly.</p>
                    <p style="color: #999; font-size: 12px;">Sent at: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })}</p>
                </div>
            </div>
            `,
        });

        console.log('Test email result:', result);

        if (result.error) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Test email sent to ${to}`,
            emailId: result.data?.id,
        });
    } catch (error: any) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send test email' },
            { status: 500 }
        );
    }
}
