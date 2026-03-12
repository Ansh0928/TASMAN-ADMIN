import { prisma } from './prisma';
import { resend, EMAIL_FROM, emailHeaderHtml, emailFooterHtml } from './resend';
import { sendSMS, wholesalePriceListUpdatedSMS } from './twilio';
import { captureError } from '@/lib/error';

export async function notifyWholesalersOfUpdate() {
    try {
        const wholesalers = await prisma.user.findMany({
            where: { role: 'WHOLESALE', wholesaleStatus: 'APPROVED' },
            select: { id: true, name: true, email: true, phone: true },
        });

        if (wholesalers.length === 0) return;

        let emailsSent = 0;
        let smsSent = 0;

        for (const user of wholesalers) {
            // Send email
            try {
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: user.email,
                    subject: 'Wholesale Price List Updated - Tasman Star Seafoods',
                    html: buildPriceListUpdatedEmail(user.name),
                });
                emailsSent++;
                await prisma.notification.create({
                    data: { userId: user.id, type: 'EMAIL', recipient: user.email, category: 'wholesale_update', status: 'SENT' },
                });
            } catch {
                await prisma.notification.create({
                    data: { userId: user.id, type: 'EMAIL', recipient: user.email, category: 'wholesale_update', status: 'FAILED' },
                });
            }

            // Send SMS
            if (user.phone) {
                try {
                    await sendSMS(user.phone, wholesalePriceListUpdatedSMS());
                    smsSent++;
                    await prisma.notification.create({
                        data: { userId: user.id, type: 'SMS', recipient: user.phone, category: 'wholesale_update', status: 'SENT' },
                    });
                } catch {
                    await prisma.notification.create({
                        data: { userId: user.id, type: 'SMS', recipient: user.phone, category: 'wholesale_update', status: 'FAILED' },
                    });
                }
            }
        }

        return { emailsSent, smsSent };
    } catch (error) {
        captureError(error, 'Failed to send wholesale update notifications');
        return { emailsSent: 0, smsSent: 0 };
    }
}

function buildPriceListUpdatedEmail(name: string): string {
    const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/wholesale/prices`;
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${emailHeaderHtml('Wholesale Price Update')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${name},</p>
                <p style="color: #555;">Our wholesale price list has been updated. Sign in to view the latest prices and today's specials.</p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${portalUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                        View Updated Prices
                    </a>
                </div>
                <p style="color: #555; margin-top: 24px;">
                    Questions? Contact us at <a href="mailto:wholesale@tasmanstarseafood.com" style="color: #FF8543;">wholesale@tasmanstarseafood.com</a>
                    or call <a href="tel:+61755076712" style="color: #FF8543;">+61 7 5507 6712</a>.
                </p>
            </div>
            ${emailFooterHtml()}
        </div>
    </body>
    </html>`;
}
