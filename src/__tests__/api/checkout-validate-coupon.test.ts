import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stripeMock } from '../helpers/mocks';

vi.mock('@/lib/stripe', () => ({
    stripe: stripeMock,
}));

import { POST } from '@/app/api/checkout/validate-coupon/route';
import { NextRequest } from 'next/server';

function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/checkout/validate-coupon', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('POST /api/checkout/validate-coupon', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        stripeMock.promotionCodes.list.mockResolvedValue({ data: [] });
        stripeMock.coupons.retrieve.mockRejectedValue(new Error('No such coupon'));
    });

    it('returns 400 for empty code', async () => {
        const response = await POST(createRequest({ code: '' }));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.valid).toBe(false);
        expect(data.message).toBe('Please enter a discount code');
    });

    it('returns 400 for missing code', async () => {
        const response = await POST(createRequest({}));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.valid).toBe(false);
    });

    it('returns valid with details when promotion code found', async () => {
        stripeMock.promotionCodes.list.mockResolvedValue({
            data: [{
                id: 'promo_test_123',
                coupon: {
                    id: 'coupon_123',
                    name: 'Summer Sale',
                    percent_off: 15,
                    amount_off: null,
                    currency: null,
                },
            }],
        });

        const response = await POST(createRequest({ code: 'summer15' }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.valid).toBe(true);
        expect(data.couponId).toBe('coupon_123');
        expect(data.promotionCodeId).toBe('promo_test_123');
        expect(data.percentOff).toBe(15);
        expect(data.amountOff).toBeNull();
    });

    it('falls back to coupon ID lookup when no promotion code match', async () => {
        stripeMock.coupons.retrieve.mockResolvedValue({
            id: 'FLAT10',
            valid: true,
            name: '$10 Off',
            percent_off: null,
            amount_off: 1000, // $10 in cents
            currency: 'aud',
        });

        const response = await POST(createRequest({ code: 'FLAT10' }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.valid).toBe(true);
        expect(data.couponId).toBe('FLAT10');
        expect(data.promotionCodeId).toBeUndefined();
        expect(data.percentOff).toBeNull();
        expect(data.amountOff).toBe(10); // Converted from cents
        expect(data.currency).toBe('aud');
    });

    it('returns invalid when neither promotion code nor coupon found', async () => {
        const response = await POST(createRequest({ code: 'NONEXISTENT' }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.valid).toBe(false);
        expect(data.message).toBe('Invalid or expired discount code');
    });

    it('handles Stripe API errors gracefully', async () => {
        stripeMock.promotionCodes.list.mockRejectedValue(new Error('Stripe API error'));

        const response = await POST(createRequest({ code: 'TEST' }));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.valid).toBe(false);
        expect(data.message).toBe('Failed to validate code');
    });
});
