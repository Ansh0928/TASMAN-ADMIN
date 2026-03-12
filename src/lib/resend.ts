import { Resend } from 'resend';
import { escapeHtml } from '@/lib/security';
import { captureError } from '@/lib/error';

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

/** Centralized email sender */
export const EMAIL_FROM = 'Tasman Star Seafoods <orders@tasmanstarseafoodmarket.com.au>';

/** Logo URL for email templates */
const LOGO_URL = 'https://tasman-admin.vercel.app/assets/tasman-star-logo.png';

/** Shared email header with logo */
export function emailHeaderHtml(subtitle: string) { return emailHeader(subtitle); }
export function emailFooterHtml(isAdmin = false) { return emailFooter(isAdmin); }

function emailHeader(subtitle: string) {
    return `
        <div style="background-color: #0A192F; padding: 30px; text-align: center;">
            <img src="${LOGO_URL}" alt="Tasman Star Seafoods" width="120" height="120" style="display: block; margin: 0 auto 16px; border-radius: 50%;" />
            <h1 style="color: #FF8543; margin: 0; font-size: 24px;">Tasman Star Seafoods</h1>
            <p style="color: #ccc; margin: 8px 0 0;">${subtitle}</p>
        </div>`;
}

/** Shared email footer */
function emailFooter(isAdmin = false) {
    return `
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">Tasman Star Seafoods${isAdmin ? ' - Admin Notification' : ''}</p>
            ${isAdmin ? '' : '<p style="color: #999; font-size: 12px; margin: 4px 0;">213 Brisbane Rd, Labrador QLD</p>'}
            <p style="color: #bbb; font-size: 11px; margin: 8px 0 0;">
                <a href="https://tasmanstarseafoodmarket.com.au" style="color: #FF8543; text-decoration: none;">tasmanstarseafoodmarket.com.au</a>
            </p>
        </div>`;
}

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
    invoiceUrl?: string;
    deliveryNotes?: string | null;
    discountCode?: string | null;
    discountAmount?: string | null;
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
            ${emailHeader('Order Confirmation')}

            <!-- Content -->
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(data.customerName)},</p>
                <p style="color: #555;">Thank you for your order! Here's your order summary:</p>

                <div style="background: #f8f9fa; border-radius: 8px; padding: 4px; margin: 20px 0;">
                    <p style="padding: 0 12px; color: #666; font-size: 14px;">
                        <strong>Order #:</strong> ${escapeHtml(data.orderId.slice(-8).toUpperCase())}
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
                        ${(data.discountCode && data.discountAmount && parseFloat(data.discountAmount) > 0) ? `
<tr>
    <td style="padding: 4px 12px; color: #059669;">Discount (${escapeHtml(data.discountCode!)})</td>
    <td style="padding: 4px 12px; text-align: right; color: #059669;">-$${parseFloat(data.discountAmount).toFixed(2)}</td>
</tr>
` : ''}
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

                ${data.deliveryNotes ? `
                <div style="margin-top: 12px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
                    <p style="color: #92400e; font-size: 13px; margin: 0;"><strong>Delivery Notes:</strong> ${escapeHtml(data.deliveryNotes!)}</p>
                </div>
                ` : ''}

                ${data.invoiceUrl ? `
                <!-- Invoice Button -->
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${data.invoiceUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                        View Invoice
                    </a>
                </div>
                ` : ''}

                <p style="color: #555; margin-top: 24px;">If you have any questions about your order, please contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a> or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.</p>
            </div>

            <!-- Footer -->
            ${emailFooter()}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: data.customerEmail,
            subject: `Order Confirmation #${data.orderId.slice(-8).toUpperCase()} - Tasman Star Seafoods`,
            html,
        });

        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send order confirmation email');
        return { success: false, error };
    }
}

// ── Order Status Update Email ──

interface OrderStatusEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    status: 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    fulfillment: string;
    deliveryNotes?: string | null;
}

const ORDER_STATUS_CONTENT: Record<string, { emoji: string; heading: string; message: string; color: string; bgColor: string; borderColor: string }> = {
    PREPARING: {
        emoji: '👨‍🍳',
        heading: "We're preparing your order!",
        message: 'Our team is carefully selecting and packing your fresh seafood. We\'ll notify you when it\'s ready.',
        color: '#7c3aed', bgColor: '#f5f3ff', borderColor: '#c4b5fd',
    },
    READY: {
        emoji: '✅',
        heading: 'Your order is ready!',
        message: '',
        color: '#059669', bgColor: '#f0fdf4', borderColor: '#86efac',
    },
    DELIVERED: {
        emoji: '🎉',
        heading: 'Your order has been delivered!',
        message: 'Enjoy your fresh seafood! We hope you love it.',
        color: '#059669', bgColor: '#f0fdf4', borderColor: '#86efac',
    },
    CANCELLED: {
        emoji: '❌',
        heading: 'Your order has been cancelled',
        message: 'If you have any questions or believe this was a mistake, please contact us.',
        color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca',
    },
};

export async function sendOrderStatusEmail(data: OrderStatusEmailData) {
    const content = ORDER_STATUS_CONTENT[data.status];
    if (!content) return { success: false, error: 'Unknown status' };

    let statusMessage = content.message;
    if (data.status === 'READY') {
        statusMessage = data.fulfillment === 'PICKUP'
            ? 'Your order is ready for pickup at our store: 213 Brisbane Rd, Labrador QLD 4215.'
            : 'Your order is out for delivery! Keep an eye out for our driver.';
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${emailHeader('Order Update')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(data.customerName)},</p>

                <div style="background: ${content.bgColor}; border: 1px solid ${content.borderColor}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="font-size: 36px; margin: 0 0 8px;">${content.emoji}</p>
                    <p style="color: ${content.color}; font-size: 20px; font-weight: bold; margin: 0 0 8px;">${content.heading}</p>
                    <p style="color: #555; margin: 0;">${statusMessage}</p>
                </div>

                <div style="background: #f8f9fa; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        <strong>Order #:</strong> ${data.orderId.slice(-8).toUpperCase()}
                    </p>
                </div>

                ${data.deliveryNotes ? `
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
                    <p style="color: #92400e; font-size: 13px; margin: 0;">
                        <strong>Delivery Notes:</strong> ${escapeHtml(data.deliveryNotes!)}
                    </p>
                </div>
                ` : ''}

                <p style="color: #555; margin-top: 24px;">
                    Questions? Contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a>
                    or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.
                </p>
            </div>
            ${emailFooter()}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: data.customerEmail,
            subject: `Order Update #${data.orderId.slice(-8).toUpperCase()} - ${content.heading}`,
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send order status email');
        return { success: false, error };
    }
}

// ── Refund Notification Email ──

export async function sendRefundNotificationEmail(data: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    refundAmount: string;
    isFullRefund: boolean;
}) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${emailHeader('Refund Notification')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(data.customerName)},</p>

                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="font-size: 36px; margin: 0 0 8px;">💰</p>
                    <p style="color: #0369a1; font-size: 20px; font-weight: bold; margin: 0 0 8px;">
                        ${data.isFullRefund ? 'Full Refund Processed' : 'Partial Refund Processed'}
                    </p>
                    <p style="color: #555; margin: 0;">
                        A refund of <strong>$${parseFloat(data.refundAmount).toFixed(2)} AUD</strong> has been issued for your order.
                    </p>
                </div>

                <div style="background: #f8f9fa; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        <strong>Order #:</strong> ${data.orderId.slice(-8).toUpperCase()}
                    </p>
                </div>

                <p style="color: #555;">The refund will be credited to your original payment method within <strong>5-10 business days</strong>.</p>

                <p style="color: #555; margin-top: 24px;">
                    Questions? Contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a>
                    or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.
                </p>
            </div>
            ${emailFooter()}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: data.customerEmail,
            subject: `Refund Processed - Order #${data.orderId.slice(-8).toUpperCase()}`,
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send refund notification email');
        return { success: false, error };
    }
}

// ── Payment Failure Recovery Email ──

export async function sendPaymentFailureEmail(data: {
    orderId: string;
    customerName: string;
    customerEmail: string;
}) {
    const checkoutUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${emailHeader('Payment Issue')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(data.customerName)},</p>

                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="font-size: 36px; margin: 0 0 8px;">⚠️</p>
                    <p style="color: #dc2626; font-size: 20px; font-weight: bold; margin: 0 0 8px;">Payment didn't go through</p>
                    <p style="color: #555; margin: 0;">Unfortunately, we couldn't process your payment for order #${data.orderId.slice(-8).toUpperCase()}.</p>
                </div>

                <p style="color: #555;">This can happen for several reasons — expired card, insufficient funds, or a temporary bank issue. You can try again:</p>

                <div style="text-align: center; margin: 24px 0;">
                    <a href="${checkoutUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                        Try Again
                    </a>
                </div>

                <p style="color: #555; margin-top: 24px;">
                    Need help? Contact us at <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a>
                    or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.
                </p>
            </div>
            ${emailFooter()}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: data.customerEmail,
            subject: `Payment Issue - Order #${data.orderId.slice(-8).toUpperCase()}`,
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send payment failure email');
        return { success: false, error };
    }
}

// ── New Order Admin Notification Email ──

export async function sendNewOrderAdminEmail(data: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: OrderItem[];
    total: string;
    fulfillment: string;
    deliveryStreet?: string | null;
    deliveryCity?: string | null;
    deliveryState?: string | null;
    deliveryPostcode?: string | null;
    pickupTime?: string | null;
}) {
    const adminUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/orders`;
    const orderRef = data.orderId.slice(-8).toUpperCase();

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
            ? `<p style="margin: 0;"><strong>Delivery Address:</strong><br/>${data.deliveryStreet}<br/>${data.deliveryCity}, ${data.deliveryState} ${data.deliveryPostcode}</p>`
            : `<p style="margin: 0;"><strong>Pickup</strong>${data.pickupTime ? `<br/>Requested time: ${new Date(data.pickupTime).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}</p>`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${emailHeader('Admin Notification')}
            <div style="padding: 30px;">
                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 0 0 20px; text-align: center;">
                    <p style="color: #059669; font-size: 20px; font-weight: bold; margin: 0;">New Order!</p>
                    <p style="color: #555; margin: 8px 0 0; font-size: 14px;">Order #${orderRef} &mdash; $${parseFloat(data.total).toFixed(2)}</p>
                </div>

                <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
                    <p style="color: #333; font-weight: bold; margin: 0 0 8px;">Customer Details</p>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr><td style="padding: 4px 0; font-weight: 600; width: 80px;">Name:</td><td>${escapeHtml(data.customerName)}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td><a href="mailto:${escapeHtml(data.customerEmail)}" style="color: #FF8543;">${escapeHtml(data.customerEmail)}</a></td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Phone:</td><td><a href="tel:${escapeHtml(data.customerPhone)}" style="color: #FF8543;">${escapeHtml(data.customerPhone)}</a></td></tr>
                    </table>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px;">
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

                <div style="border-top: 2px solid #eee; padding-top: 12px; margin-bottom: 20px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 8px 12px; color: #333; font-weight: bold; font-size: 18px;">Total</td>
                            <td style="padding: 8px 12px; text-align: right; color: #FF8543; font-weight: bold; font-size: 18px;">$${parseFloat(data.total).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin: 0 0 20px; color: #555;">
                    ${fulfillmentInfo}
                </div>

                <div style="text-align: center; margin: 24px 0;">
                    <a href="${adminUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                        View in Admin Panel
                    </a>
                </div>
            </div>
            ${emailFooter(true)}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: process.env.ADMIN_NOTIFICATION_EMAIL || 'techsupport@tasmanstarseafood.com',
            subject: `New Order #${orderRef} - $${parseFloat(data.total).toFixed(2)} - Tasman Star Seafoods`,
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send new order admin email');
        return { success: false, error };
    }
}

// ── Low Stock Alert Email (sent to admin) ──

export async function sendLowStockAlertEmail(data: {
    products: Array<{ name: string; stockQuantity: number }>;
}) {
    const adminUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/products`;

    const productRows = data.products
        .map(
            (p) =>
                `<tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #333;">${p.name}</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center; color: ${p.stockQuantity <= 2 ? '#dc2626' : '#d97706'}; font-weight: bold;">${p.stockQuantity} left</td>
                </tr>`
        )
        .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${emailHeader('Low Stock Alert')}
            <div style="padding: 30px;">
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 0 0 20px; text-align: center;">
                    <p style="font-size: 36px; margin: 0 0 8px;">⚠️</p>
                    <p style="color: #92400e; font-size: 20px; font-weight: bold; margin: 0;">Low Stock Warning</p>
                    <p style="color: #555; margin: 8px 0 0; font-size: 14px;">The following products are running low after a recent order.</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #666;">Product</th>
                            <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #666;">Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productRows}
                    </tbody>
                </table>

                <div style="text-align: center; margin: 24px 0;">
                    <a href="${adminUrl}" style="display: inline-block; background: #FF8543; color: white; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                        Manage Products
                    </a>
                </div>
            </div>
            ${emailFooter(true)}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: process.env.ADMIN_NOTIFICATION_EMAIL || 'techsupport@tasmanstarseafood.com',
            subject: `Low Stock Alert - Tasman Star Seafoods`,
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send low stock alert email');
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
            ${emailHeader('Wholesale Application')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(data.name)},</p>
                <p style="color: #555;">Thank you for applying for a wholesale account with Tasman Star Seafoods. We've received your application and it's now being reviewed by our team.</p>

                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #0369a1; font-weight: bold; margin: 0 0 8px;">Application Details</p>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr><td style="padding: 4px 0; font-weight: 600;">Company:</td><td>${escapeHtml(data.companyName)}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">ABN:</td><td>${escapeHtml(data.abn)}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td>${escapeHtml(data.email)}</td></tr>
                    </table>
                </div>

                <p style="color: #555;"><strong>What happens next?</strong></p>
                <ol style="color: #555; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Our team will review your application within <strong>1-2 business days</strong></li>
                    <li style="margin-bottom: 8px;">You'll receive an email once your application is approved</li>
                    <li>Once approved, sign in at our wholesale portal to view exclusive pricing</li>
                </ol>

                <p style="color: #555; margin-top: 24px;">
                    Questions? Contact us at <a href="mailto:wholesale@tasmanstarseafood.com" style="color: #FF8543;">wholesale@tasmanstarseafood.com</a>
                    or call <a href="tel:+61755076712" style="color: #FF8543;">+61 7 5507 6712</a>.
                </p>
            </div>
            ${emailFooter()}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: data.email,
            subject: 'Application Received - Tasman Star Seafoods',
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send wholesale application received email');
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
            ${emailHeader('New Wholesale Application')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">A new wholesale application has been submitted and needs your review.</p>

                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #92400e; font-weight: bold; margin: 0 0 12px;">Applicant Details</p>
                    <table style="width: 100%; font-size: 14px; color: #555;">
                        <tr><td style="padding: 4px 0; font-weight: 600; width: 120px;">Contact Name:</td><td>${escapeHtml(data.name)}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Company:</td><td>${escapeHtml(data.companyName)}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">ABN:</td><td>${escapeHtml(data.abn)}</td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td><a href="mailto:${escapeHtml(data.email)}" style="color: #FF8543;">${escapeHtml(data.email)}</a></td></tr>
                        <tr><td style="padding: 4px 0; font-weight: 600;">Phone:</td><td><a href="tel:${escapeHtml(data.phone)}" style="color: #FF8543;">${escapeHtml(data.phone)}</a></td></tr>
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
            ${emailFooter(true)}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: process.env.ADMIN_NOTIFICATION_EMAIL || 'techsupport@tasmanstarseafood.com',
            subject: `New Wholesale Application - ${data.companyName}`,
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send wholesale admin notification email');
        return { success: false, error };
    }
}

// ── Wholesale Approval/Rejection Email ──

export async function sendPasswordChangedEmail(data: {
    email: string;
    name: string;
}) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${emailHeader('Security Alert')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(data.name)},</p>
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0 0 8px;">Your password has been changed</p>
                    <p style="color: #a16207; margin: 0;">If you made this change, no further action is needed.</p>
                </div>
                <p style="color: #555;">If you did not change your password, please contact us immediately at
                    <a href="mailto:info@tasmanstar.com.au" style="color: #FF8543;">info@tasmanstar.com.au</a>
                    or call <a href="tel:+61755290844" style="color: #FF8543;">+61 7 5529 0844</a>.
                </p>
            </div>
            ${emailFooter()}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: data.email,
            subject: 'Password Changed - Tasman Star Seafoods',
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send password changed email');
        return { success: false, error };
    }
}

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
            ${emailHeader('Wholesale Application Update')}
            <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hi ${escapeHtml(data.name)},</p>
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
                    Questions? Contact us at <a href="mailto:wholesale@tasmanstarseafood.com" style="color: #FF8543;">wholesale@tasmanstarseafood.com</a>
                    or call <a href="tel:+61755076712" style="color: #FF8543;">+61 7 5507 6712</a>.
                </p>
            </div>
            ${emailFooter()}
        </div>
    </body>
    </html>
    `;

    try {
        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: data.email,
            subject: isApproved
                ? 'Wholesale Access Approved - Tasman Star Seafoods'
                : 'Wholesale Application Update - Tasman Star Seafoods',
            html,
        });
        return { success: true, id: result.data?.id };
    } catch (error) {
        captureError(error, 'Failed to send wholesale status email');
        return { success: false, error };
    }
}
