import { requireAdmin } from '@/lib/admin-auth';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const promos = await stripe.promotionCodes.list({
            limit: 50,
            expand: ['data.coupon'],
        });

        const coupons = promos.data.map((p) => ({
            id: p.id,
            code: p.code,
            couponId: p.coupon && typeof p.coupon !== 'string' ? p.coupon.id : p.coupon,
            percentOff: p.coupon && typeof p.coupon !== 'string' ? p.coupon.percent_off : null,
            amountOff: p.coupon && typeof p.coupon !== 'string' ? p.coupon.amount_off : null,
            currency: p.coupon && typeof p.coupon !== 'string' ? p.coupon.currency : null,
            active: p.active,
            timesRedeemed: p.times_redeemed,
            maxRedemptions: p.max_redemptions,
            expiresAt: p.expires_at,
            created: p.created,
        }));

        return NextResponse.json({ coupons });
    } catch (err) {
        console.error('Admin coupons list error:', err);
        return NextResponse.json({ message: 'Failed to fetch coupons' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json();
        const { code, percentOff, amountOff, maxRedemptions, expiresAt } = body;

        if (!code) {
            return NextResponse.json({ message: 'Code is required' }, { status: 400 });
        }
        if (!percentOff && !amountOff) {
            return NextResponse.json({ message: 'Either percentOff or amountOff is required' }, { status: 400 });
        }
        if (percentOff && amountOff) {
            return NextResponse.json({ message: 'Provide either percentOff or amountOff, not both' }, { status: 400 });
        }

        const couponParams: Record<string, unknown> = { duration: 'once' as const };
        if (percentOff) {
            couponParams.percent_off = Number(percentOff);
        } else {
            couponParams.amount_off = Math.round(Number(amountOff) * 100);
            couponParams.currency = 'aud';
        }

        const coupon = await stripe.coupons.create(couponParams as any);

        const promoParams: Record<string, unknown> = {
            coupon: coupon.id,
            code: code.toUpperCase(),
        };
        if (maxRedemptions) promoParams.max_redemptions = Number(maxRedemptions);
        if (expiresAt) promoParams.expires_at = Math.floor(new Date(expiresAt).getTime() / 1000);

        const promo = await stripe.promotionCodes.create(promoParams as any);

        return NextResponse.json({ promo }, { status: 201 });
    } catch (err: any) {
        console.error('Admin coupon create error:', err);
        const msg = err?.raw?.message || err?.message || 'Failed to create coupon';
        return NextResponse.json({ message: msg }, { status: 500 });
    }
}
