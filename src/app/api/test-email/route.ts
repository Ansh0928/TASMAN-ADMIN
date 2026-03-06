import { NextResponse } from 'next/server';
import { resend, EMAIL_FROM } from '@/lib/resend';

const LOGO_URL = 'https://tasman-admin.vercel.app/assets/tasman-star-logo.png';

export async function GET() {
    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: 'anshumaansaraf24@gmail.com',
            subject: 'Test Email - Tasman Star Seafoods',
            html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
            <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                        <img src="${LOGO_URL}" alt="Tasman Star Seafoods" width="120" height="120" style="display: block; margin: 0 auto 16px; border-radius: 50%;" />
                        <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
                        <p style="color: #ccc; margin: 8px 0 0;">Email System Test</p>
                    </div>
                    <div style="padding: 30px;">
                        <p style="color: #333; font-size: 16px;">Hi there,</p>
                        <p style="color: #555;">This is a test email from <strong>Tasman Star Seafoods</strong> to verify that the email system is working correctly with the new domain.</p>

                        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                            <p style="color: #059669; font-size: 20px; font-weight: bold; margin: 0;">Email System Working!</p>
                            <p style="color: #555; margin: 8px 0 0;">Sent from: <strong>orders@tasmanstarseafoodmarket.com.au</strong></p>
                        </div>

                        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
                            <p style="color: #333; font-weight: bold; margin: 0 0 8px;">What this confirms:</p>
                            <ul style="color: #555; margin: 0; padding-left: 20px;">
                                <li>DNS verification is active</li>
                                <li>Resend is sending from your custom domain</li>
                                <li>Logo and branding render correctly</li>
                                <li>Email template styling works</li>
                            </ul>
                        </div>

                        <p style="color: #555; margin-top: 24px;">
                            Questions? Contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a>
                            or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.
                        </p>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">Tasman Star Seafoods</p>
                        <p style="color: #999; font-size: 12px; margin: 4px 0;">213 Brisbane Rd, Labrador QLD</p>
                        <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">
                            <a href="https://tasmanstarseafoodmarket.com.au" style="color: #FF8543; text-decoration: none;">tasmanstarseafoodmarket.com.au</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>`,
        });

        return NextResponse.json({ success: true, id: result.data?.id });
    } catch (error: any) {
        console.error('Test email failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
