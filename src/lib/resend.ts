import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend {
    if (!_resend) {
        const key = process.env.RESEND_API_KEY;
        if (!key) {
            throw new Error('RESEND_API_KEY environment variable is not set');
        }
        _resend = new Resend(key);
    }
    return _resend;
}

export const resend = new Proxy({} as Resend, {
    get(_target, prop) {
        return (getResend() as any)[prop];
    },
});

interface OrderItem {
    product: { name: string };
    quantity: number;
    unitPrice: any;
    total: any;
}

interface OrderEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    subtotal: string;
    deliveryFee: string;
    tax: string;
    total: string;
    fulfillment: string;
    deliveryStreet?: string | null;
    deliveryCity?: string | null;
    deliveryState?: string | null;
    deliveryPostcode?: string | null;
    pickupTime?: string | null;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    const itemRows = data.items
        .map(
            (item) =>
                `<tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.product.name}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.unitPrice.toString()).toFixed(2)}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.total.toString()).toFixed(2)}</td>
                </tr>`
        )
        .join('');

    const fulfillmentInfo =
        data.fulfillment === 'DELIVERY'
            ? `<p><strong>Delivery Address:</strong><br/>${data.deliveryStreet}<br/>${data.deliveryCity}, ${data.deliveryState} ${data.deliveryPostcode}</p>`
            : `<p><strong>Pickup</strong><br/>We'll notify you when your order is ready for pickup at our store.</p>`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
                <p style="color: #ccc; margin: 8px 0 0;">Order Confirmation</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${data.customerName},</p>
                <p style="color: #555;">Thank you for your order! Here's your order summary:</p>

                <div style="background: #f8f9fa; border-radius: 8px; padding: 4px; margin: 20px 0;">
                    <p style="padding: 0 12px; color: #666; font-size: 14px;">
                        <strong>Order #:</strong> ${data.orderId.slice(-8).toUpperCase()}
                    </p>
                </div>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #666;">Item</th>
                            <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #666;">Qty</th>
                            <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #666;">Price</th>
                            <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #666;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                    </tbody>
                </table>

                <!-- Totals -->
                <div style="border-top: 2px solid #eee; padding-top: 12px; margin-top: 12px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 4px 12px; color: #666;">Subtotal</td>
                            <td style="padding: 4px 12px; text-align: right; color: #333;">$${parseFloat(data.subtotal).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 12px; color: #666;">Delivery Fee</td>
                            <td style="padding: 4px 12px; text-align: right; color: #333;">$${parseFloat(data.deliveryFee).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 12px; color: #666;">GST</td>
                            <td style="padding: 4px 12px; text-align: right; color: #333;">$${parseFloat(data.tax).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 12px; color: #333; font-weight: bold; font-size: 18px;">Total</td>
                            <td style="padding: 8px 12px; text-align: right; color: #FF8543; font-weight: bold; font-size: 18px;">$${parseFloat(data.total).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Fulfillment Info -->
                <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 8px; color: #555;">
                    ${fulfillmentInfo}
                </div>

                <p style="color: #555; margin-top: 24px;">If you have any questions about your order, please contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a> or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.</p>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">Tasman Star Seafoods</p>
                <p style="color: #999; font-size: 12px; margin: 4px 0;">213 Brisbane Rd, Labrador QLD</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: 'Tasman Star Seafoods <onboarding@resend.dev>',
            to: data.customerEmail,
            subject: `Order Confirmation #${data.orderId.slice(-8).toUpperCase()} - Tasman Star Seafoods`,
            html,
        });

        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        return { success: false, error };
    }
}

// ── Wholesale Application Received Email (sent to applicant) ──

export async function sendWholesaleApplicationReceivedEmail(data: {
    name: string;
    email: string;
    companyName: string;
    abn: string;
}) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
                <p style="color: #ccc; margin: 8px 0 0;">Wholesale Application</p>
            </div>
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${data.name},</p>
                <p style="color: #555;">Thank you for applying for a wholesale account with Tasman Star Seafoods. We've received your application and it's now being reviewed by our team.</p>

                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #0369a1; font-weight: bold; margin: 0 0 8px;">Application Details</p>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr><td style="padding: 4px 0; font-weight: 600;">Company:</td><td>${data.companyName}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">ABN:</td><td>${data.abn}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td>${data.email}</td></tr>
                    </table>
                </div>

                <p style="color: #555;"><strong>What happens next?</strong></p>
                <ol style="color: #555; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Our team will review your application within <strong>1-2 business days</strong></li>
                    <li style="margin-bottom: 8px;">You'll receive an email once your application is approved</li>
                    <li>Once approved, sign in at our wholesale portal to view exclusive pricing</li>
                </ol>

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
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: 'Tasman Star Seafoods <onboarding@resend.dev>',
            to: data.email,
            subject: 'Application Received - Tasman Star Seafoods',
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Failed to send wholesale application received email:', error);
        return { success: false, error };
    }
}

// ── Wholesale New Application Admin Notification ──

export async function sendWholesaleNewApplicationAdminEmail(data: {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    abn: string;
}) {
    const adminUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/customers`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
                <p style="color: #ccc; margin: 8px 0 0;">New Wholesale Application</p>
            </div>
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">A new wholesale application has been submitted and needs your review.</p>

                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #92400e; font-weight: bold; margin: 0 0 12px;">Applicant Details</p>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr><td style="padding: 4px 0; font-weight: 600; width: 120px;">Contact Name:</td><td>${data.name}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Company:</td><td>${data.companyName}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">ABN:</td><td>${data.abn}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td><a href="mailto:${data.email}" style="color: #FF8543;">${data.email}</a></td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Phone:</td><td><a href="tel:${data.phone}" style="color: #FF8543;">${data.phone}</a></td></tr>
                    </table>
                </div>

                <div style="text-align: center; margin: 24px 0;">
                    <a href="${adminUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                        Review in Admin Panel
                    </a>
                </div>

                <p style="color: #999; font-size: 12px; text-align: center;">
                    Go to Admin Panel &rarr; Customers to approve or reject this application.
                </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">Tasman Star Seafoods - Admin Notification</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: 'Tasman Star Seafoods <onboarding@resend.dev>',
            to: 'anshumaansaraf24@gmail.com',
            subject: `New Wholesale Application - ${data.companyName}`,
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Failed to send wholesale admin notification email:', error);
        return { success: false, error };
    }
}

// ── Wholesale Approval/Rejection Email ──

export async function sendWholesaleStatusEmail(data: {
    name: string;
    email: string;
    status: 'APPROVED' | 'REJECTED';
    companyName?: string | null;
}) {
    const isApproved = data.status === 'APPROVED';

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #0A192F; padding: 30px; text-align: center;">
                <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
                <p style="color: #ccc; margin: 8px 0 0;">Wholesale Application Update</p>
            </div>
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${data.name},</p>
                ${isApproved ? `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0 0 8px;">Your wholesale application has been approved!</p>
                        <p style="color: #15803d; margin: 0;">You can now sign in to view our wholesale price list.</p>
                    </div>
                    <p style="color: #555;">You can access wholesale prices by:</p>
                    <ol style="color: #555;">
                        <li>Go to <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/wholesale/login" style="color: #FF8543;">our wholesale sign-in page</a></li>
                        <li>Sign in with your email and password</li>
                        <li>Navigate to <strong>Wholesale Prices</strong> from the menu</li>
                    </ol>
                ` : `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="color: #991b1b; font-size: 18px; font-weight: bold; margin: 0 0 8px;">Wholesale application update</p>
                        <p style="color: #dc2626; margin: 0;">Unfortunately, we are unable to approve your wholesale application at this time.</p>
                    </div>
                    <p style="color: #555;">If you believe this was an error or have additional information to provide, please contact us.</p>
                `}
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
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: 'Tasman Star Seafoods <onboarding@resend.dev>',
            to: data.email,
            subject: isApproved
                ? 'Wholesale Access Approved - Tasman Star Seafoods'
                : 'Wholesale Application Update - Tasman Star Seafoods',
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Failed to send wholesale status email:', error);
        return { success: false, error };
    }
}
