import { requireAdmin } from '@/lib/admin-auth';
import { notifyWholesalersOfUpdate } from '@/lib/wholesale-notifications';
import { NextResponse } from 'next/server';

export async function POST() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const result = await notifyWholesalersOfUpdate();
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        console.error('Notify wholesalers error:', err);
        return NextResponse.json({ message: 'Failed to send notifications' }, { status: 500 });
    }
}
