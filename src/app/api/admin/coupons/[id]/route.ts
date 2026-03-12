import { requireAdmin } from '@/lib/admin-auth';
import { stripe } from '@/lib/stripe';
import { captureError } from '@/lib/error';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { id } = await params;
        const body = await request.json();
        const { active } = body;

        const promo = await stripe.promotionCodes.update(id, { active });

        return NextResponse.json({ promo });
    } catch (err: any) {
        captureError(err, 'Admin coupon update error');
        const msg = err?.raw?.message || err?.message || 'Failed to update coupon';
        return NextResponse.json({ message: msg }, { status: 500 });
    }
}
