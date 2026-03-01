import { prisma } from './prisma';
import { resend } from './resend';
import { sendSMS, wholesalePriceListUpdatedSMS } from './twilio';

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
                    from: 'Tasman Star Seafoods <onboarding@resend.dev>',
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

        console.log(`Wholesale update notifications: ${emailsSent} emails, ${smsSent} SMS sent to ${wholesalers.length} users`);
    } catch (error) {
        console.error('Failed to send wholesale update notifications:', error);
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
            <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
                <p style="color: #ccc; margin: 8px 0 0;">Wholesale Price Update</p>
            </div>
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${name},</p>
                <p style="color: #555;">Our wholesale price list has been updated. Sign in to view the latest prices and today's specials.</p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${portalUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                        View Updated Prices
                    </a>
                </div>
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
}
