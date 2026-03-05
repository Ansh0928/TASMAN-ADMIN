import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/twilio';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { to } = await req.json();
    if (!to) {
        return NextResponse.json({ error: 'Phone number (to) is required' }, { status: 400 });
    }

    const result = await sendSMS(to, 'Test SMS from Tasman Star Seafoods! If you received this, Twilio is working.');
    return NextResponse.json(result);
}
