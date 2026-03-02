import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { valid: false, message: 'Please enter a discount code' },
                { status: 400 }
            );
        }

        const trimmedCode = code.trim().toUpperCase();

        // Try promotion codes first (customer-facing codes)
        const promotionCodes = await stripe.promotionCodes.list({
            code: trimmedCode,
            active: true,
            limit: 1,
        });

        if (promotionCodes.data.length > 0) {
            const promo = promotionCodes.data[0] as any;
            const coupon = promo.coupon;

            return NextResponse.json({
                valid: true,
                couponId: coupon.id,
                promotionCodeId: promo.id,
                name: coupon.name || trimmedCode,
                percentOff: coupon.percent_off,
                amountOff: coupon.amount_off ? coupon.amount_off / 100 : null, // Convert from cents
                currency: coupon.currency,
            });
        }

        // Fall back to direct coupon ID lookup
        try {
            const coupon = await stripe.coupons.retrieve(trimmedCode);
            if (coupon.valid) {
                return NextResponse.json({
                    valid: true,
                    couponId: coupon.id,
                    name: coupon.name || trimmedCode,
                    percentOff: coupon.percent_off,
                    amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
                    currency: coupon.currency,
                });
            }
        } catch {
            // Coupon not found — fall through to invalid
        }

        return NextResponse.json(
            { valid: false, message: 'Invalid or expired discount code' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json(
            { valid: false, message: 'Failed to validate code' },
            { status: 500 }
        );
    }
}
