import twilio from 'twilio';

let _client: twilio.Twilio | null = null;

function getTwilio(): twilio.Twilio {
    if (!_client) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        if (!sid || !token) {
            throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
        }
        _client = twilio(sid, token);
    }
    return _client;
}

export async function sendSMS(to: string, body: string) {
    try {
        const from = process.env.TWILIO_PHONE_NUMBER;
        if (!from) throw new Error('TWILIO_PHONE_NUMBER is not set');

        const message = await getTwilio().messages.create({ to, from, body });
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Failed to send SMS:', error);
        return { success: false, error };
    }
}

// ── Pre-built SMS templates ──

export function wholesaleApplicationReceivedSMS(name: string): string {
    return `Hi ${name}, we've received your wholesale application for Tasman Star Seafoods. Our team will review it within 1-2 business days. We'll notify you once a decision is made.`;
}

export function wholesaleApprovedSMS(name: string): string {
    return `Great news ${name}! Your wholesale account with Tasman Star Seafoods has been approved. Sign in at our wholesale portal to view exclusive pricing.`;
}

export function wholesaleRejectedSMS(name: string): string {
    return `Hi ${name}, unfortunately we couldn't approve your wholesale application with Tasman Star Seafoods at this time. Please contact us at info@tasmanstar.com.au for more info.`;
}

export function wholesalePriceListUpdatedSMS(): string {
    return `Tasman Star Seafoods: Our wholesale price list has been updated. Sign in to view the latest prices and today's specials.`;
}
