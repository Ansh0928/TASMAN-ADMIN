import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock, stripeMock, factories } from '../helpers/mocks';

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/stripe', () => ({
    stripe: stripeMock,
}));

import { POST } from '@/app/api/checkout/route';
import { NextRequest } from 'next/server';

function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

const validCheckoutBody = {
    items: [
        { productId: 'prod-1', name: 'Atlantic Salmon', quantity: 2 },
    ],
    fulfillment: 'DELIVERY',
    guestEmail: 'customer@example.com',
    guestName: 'John Doe',
    guestPhone: '+61400000000',
    deliveryStreet: '123 Ocean Rd',
    deliveryCity: 'Gold Coast',
    deliveryState: 'QLD',
    deliveryPostcode: '4217',
};

describe('POST /api/checkout', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock for product lookup
        prismaMock.product.findMany.mockResolvedValue([
            factories.product({
                id: 'prod-1',
                name: 'Atlantic Salmon',
                price: '29.99',
                stockQuantity: 50,
                isAvailable: true,
            }),
        ]);

        // Default mock for order creation
        prismaMock.order.create.mockResolvedValue(
            factories.order({ id: 'order-1' })
        );

        // Default mock for order update
        prismaMock.order.update.mockResolvedValue(
            factories.order({ id: 'order-1', stripeSessionId: 'cs_test_123' })
        );

        // Stripe customer lookup
        stripeMock.customers.list.mockResolvedValue({ data: [] });

        // Stripe customer creation
        stripeMock.customers.create.mockResolvedValue({ id: 'cus_test_123' });

        // Stripe session creation
        stripeMock.checkout.sessions.create.mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/cs_test_123',
        });
    });

    it('creates a Stripe checkout session for valid delivery order', async () => {
        const response = await POST(createRequest(validCheckoutBody));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
        expect(prismaMock.order.create).toHaveBeenCalledTimes(1);
        expect(stripeMock.checkout.sessions.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.order.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'order-1' },
                data: { stripeSessionId: 'cs_test_123' },
            })
        );
    });

    it('creates checkout session for pickup order', async () => {
        const pickupBody = {
            items: [{ productId: 'prod-1', name: 'Atlantic Salmon', quantity: 1 }],
            fulfillment: 'PICKUP',
            guestEmail: 'customer@example.com',
            guestName: 'John Doe',
            guestPhone: '+61400000000',
            pickupTime: '2026-03-05T10:00:00Z',
        };

        const response = await POST(createRequest(pickupBody));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
    });

    it('uses existing Stripe customer if found', async () => {
        stripeMock.customers.list.mockResolvedValue({
            data: [{ id: 'cus_existing_123' }],
        });

        const response = await POST(createRequest(validCheckoutBody));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(stripeMock.customers.create).not.toHaveBeenCalled();
        expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                customer: 'cus_existing_123',
            })
        );
    });

    it('returns 400 when cart is empty', async () => {
        const response = await POST(
            createRequest({
                ...validCheckoutBody,
                items: [],
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Cart is empty');
    });

    it('returns 400 when items is missing', async () => {
        const { items, ...noItems } = validCheckoutBody;
        const response = await POST(createRequest(noItems));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Cart is empty');
    });

    it('returns 400 when guestEmail is missing', async () => {
        const response = await POST(
            createRequest({
                ...validCheckoutBody,
                guestEmail: '',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Name, email, and phone are required');
    });

    it('returns 400 when guestName is missing', async () => {
        const response = await POST(
            createRequest({
                ...validCheckoutBody,
                guestName: '',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Name, email, and phone are required');
    });

    it('returns 400 when guestPhone is missing', async () => {
        const response = await POST(
            createRequest({
                ...validCheckoutBody,
                guestPhone: '',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Name, email, and phone are required');
    });

    it('returns 400 for invalid fulfillment type', async () => {
        const response = await POST(
            createRequest({
                ...validCheckoutBody,
                fulfillment: 'DRONE',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Invalid fulfillment type');
    });

    it('returns 400 when delivery address is missing for DELIVERY', async () => {
        const response = await POST(
            createRequest({
                ...validCheckoutBody,
                deliveryStreet: '',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Delivery address is required');
    });

    it('returns 400 when pickup time is missing for PICKUP', async () => {
        const response = await POST(
            createRequest({
                items: [{ productId: 'prod-1', name: 'Atlantic Salmon', quantity: 1 }],
                fulfillment: 'PICKUP',
                guestEmail: 'customer@example.com',
                guestName: 'John Doe',
                guestPhone: '+61400000000',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Pickup time is required');
    });

    it('returns 400 when product is not found', async () => {
        prismaMock.product.findMany.mockResolvedValue([]);

        const response = await POST(createRequest(validCheckoutBody));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('is no longer available');
    });

    it('returns 400 when product is unavailable', async () => {
        prismaMock.product.findMany.mockResolvedValue([
            factories.product({ id: 'prod-1', isAvailable: false }),
        ]);

        const response = await POST(createRequest(validCheckoutBody));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('currently unavailable');
    });

    it('returns 400 when product is out of stock', async () => {
        prismaMock.product.findMany.mockResolvedValue([
            factories.product({ id: 'prod-1', stockQuantity: 0, isAvailable: true }),
        ]);

        const response = await POST(createRequest(validCheckoutBody));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('out of stock');
    });

    it('returns 400 when requested quantity exceeds stock', async () => {
        prismaMock.product.findMany.mockResolvedValue([
            factories.product({ id: 'prod-1', stockQuantity: 1, isAvailable: true }),
        ]);

        const response = await POST(
            createRequest({
                ...validCheckoutBody,
                items: [{ productId: 'prod-1', name: 'Atlantic Salmon', quantity: 5 }],
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('Only 1');
        expect(data.message).toContain('you requested 5');
    });

    it('recalculates prices server-side and creates order with correct totals', async () => {
        const response = await POST(createRequest(validCheckoutBody));

        expect(response.status).toBe(200);

        // The order.create call should use server-side calculated prices
        const createCall = prismaMock.order.create.mock.calls[0][0];
        expect(createCall.data.guestEmail).toBe('customer@example.com');
        expect(createCall.data.fulfillment).toBe('DELIVERY');
        // Subtotal: 29.99 * 2 = 59.98
        // Delivery fee: 10
        // Tax: (59.98 + 10) * 0.1 = 6.998
        // Total: 59.98 + 10 + 6.998 = 76.978
        expect(createCall.data.subtotal.toNumber()).toBeCloseTo(59.98, 2);
        expect(createCall.data.deliveryFee.toNumber()).toBe(10);
    });

    it('includes delivery fee line item for delivery orders', async () => {
        const response = await POST(createRequest(validCheckoutBody));
        expect(response.status).toBe(200);

        const createSessionCall = stripeMock.checkout.sessions.create.mock.calls[0][0];
        const lineItemNames = createSessionCall.line_items.map((li: any) => li.price_data.product_data.name);
        expect(lineItemNames).toContain('Delivery Fee');
        expect(lineItemNames).toContain('GST (10%)');
    });

    it('returns 500 when Stripe session creation fails', async () => {
        stripeMock.checkout.sessions.create.mockRejectedValue(new Error('Stripe error'));

        const response = await POST(createRequest(validCheckoutBody));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Failed to create checkout session');
    });
});
