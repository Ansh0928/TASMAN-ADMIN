import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { prismaMock, stripeMock, factories, createMockRequest } from '../../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());
const mockSendRefundNotificationEmail = vi.hoisted(() =>
    vi.fn().mockResolvedValue({ success: true, id: 'email-refund-123' })
);

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/stripe', () => ({
    stripe: stripeMock,
}));

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/resend', () => ({
    sendRefundNotificationEmail: mockSendRefundNotificationEmail,
}));

const mockAfterCallbacks: Array<() => Promise<void>> = [];
vi.mock('next/server', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next/server')>();
    return {
        ...actual,
        after: vi.fn((cb: () => Promise<void>) => { mockAfterCallbacks.push(cb); }),
    };
});

import { POST } from '@/app/api/admin/orders/[id]/refund/route';

function adminOk() {
    mockRequireAdmin.mockResolvedValue({
        error: null,
        session: { user: { id: 'admin-1', role: 'ADMIN' } },
    });
}

function adminForbidden() {
    mockRequireAdmin.mockResolvedValue({
        error: NextResponse.json(
            { message: 'Forbidden - Admin access required' },
            { status: 403 }
        ),
    });
}

describe('POST /api/admin/orders/[id]/refund', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAfterCallbacks.length = 0;
        prismaMock.notification.create.mockResolvedValue({});
    });

    async function flushAfterCallbacks() {
        for (const cb of mockAfterCallbacks) {
            await cb();
        }
    }

    it('rejects non-admin', async () => {
        adminForbidden();
        const req = createMockRequest('POST', { amount: 10 });
        const res = await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        expect(res.status).toBe(403);
    });

    it('returns 404 when order not found', async () => {
        adminOk();
        prismaMock.order.findUnique.mockResolvedValue(null);

        const req = createMockRequest('POST', { amount: 10 });
        const res = await POST(req as any, { params: Promise.resolve({ id: 'nonexistent' }) });
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.message).toBe('Order not found');
    });

    it('returns 400 when no stripePaymentIntent', async () => {
        adminOk();
        const order = {
            ...factories.order({ stripePaymentIntent: null }),
            user: null,
        };
        prismaMock.order.findUnique.mockResolvedValue(order);

        const req = createMockRequest('POST', { amount: 10 });
        const res = await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe('No payment intent found for this order');
    });

    it('returns 400 when already fully refunded', async () => {
        adminOk();
        const order = {
            ...factories.order({ stripePaymentIntent: 'pi_test_123', refundStatus: 'FULL' }),
            user: null,
        };
        prismaMock.order.findUnique.mockResolvedValue(order);

        const req = createMockRequest('POST', { amount: 10 });
        const res = await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toBe('Order has already been fully refunded');
    });

    it('returns 400 when amount exceeds max refundable', async () => {
        adminOk();
        const order = {
            ...factories.order({
                stripePaymentIntent: 'pi_test_123',
                total: '100.00',
                refundedAmount: '50.00',
                refundStatus: 'PARTIAL',
            }),
            user: null,
        };
        prismaMock.order.findUnique.mockResolvedValue(order);

        const req = createMockRequest('POST', { amount: 60 }); // Only 50 refundable
        const res = await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toContain('$50.00');
    });

    it('processes partial refund successfully', async () => {
        adminOk();
        const order = {
            ...factories.order({
                stripePaymentIntent: 'pi_test_123',
                total: '100.00',
                refundedAmount: '0',
                refundStatus: 'NONE',
                guestEmail: 'test@example.com',
                guestName: 'Test User',
            }),
            user: null,
        };
        prismaMock.order.findUnique.mockResolvedValue(order);
        stripeMock.refunds.create.mockResolvedValue({ id: 're_test_123' });
        prismaMock.order.update.mockResolvedValue({
            ...order,
            refundedAmount: '25.00',
            refundStatus: 'PARTIAL',
        });

        const req = createMockRequest('POST', { amount: 25, reason: 'requested_by_customer' });
        const res = await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.refundAmount).toBe(25);
        expect(data.isFullRefund).toBe(false);

        expect(stripeMock.refunds.create).toHaveBeenCalledWith({
            payment_intent: 'pi_test_123',
            amount: 2500, // cents
            reason: 'requested_by_customer',
        });

        expect(prismaMock.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: {
                refundedAmount: 25,
                refundStatus: 'PARTIAL',
            },
        });
    });

    it('processes full refund and sets status to CANCELLED', async () => {
        adminOk();
        const order = {
            ...factories.order({
                stripePaymentIntent: 'pi_test_123',
                total: '100.00',
                refundedAmount: '0',
                refundStatus: 'NONE',
                guestEmail: 'test@example.com',
                guestName: 'Test User',
            }),
            user: null,
        };
        prismaMock.order.findUnique.mockResolvedValue(order);
        stripeMock.refunds.create.mockResolvedValue({ id: 're_test_456' });
        prismaMock.order.update.mockResolvedValue({
            ...order,
            refundedAmount: '100.00',
            refundStatus: 'FULL',
            status: 'CANCELLED',
        });

        const req = createMockRequest('POST', { amount: 100 });
        const res = await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.isFullRefund).toBe(true);

        expect(prismaMock.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: {
                refundedAmount: 100,
                refundStatus: 'FULL',
                status: 'CANCELLED',
            },
        });
    });

    it('sends refund notification email', async () => {
        adminOk();
        const order = {
            ...factories.order({
                stripePaymentIntent: 'pi_test_123',
                total: '100.00',
                refundedAmount: '0',
                refundStatus: 'NONE',
                guestEmail: 'customer@example.com',
                guestName: 'Jane Doe',
            }),
            user: null,
        };
        prismaMock.order.findUnique.mockResolvedValue(order);
        stripeMock.refunds.create.mockResolvedValue({ id: 're_test_789' });
        prismaMock.order.update.mockResolvedValue({});

        const req = createMockRequest('POST', { amount: 50 });
        await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        await flushAfterCallbacks();

        expect(mockSendRefundNotificationEmail).toHaveBeenCalledWith({
            orderId: 'order-1',
            customerName: 'Jane Doe',
            customerEmail: 'customer@example.com',
            refundAmount: '50.00',
            isFullRefund: false,
        });
    });

    it('returns 500 on Stripe refund error', async () => {
        adminOk();
        const order = {
            ...factories.order({
                stripePaymentIntent: 'pi_test_123',
                total: '100.00',
                refundedAmount: '0',
                refundStatus: 'NONE',
            }),
            user: null,
        };
        prismaMock.order.findUnique.mockResolvedValue(order);
        stripeMock.refunds.create.mockRejectedValue(new Error('Stripe refund failed'));

        const req = createMockRequest('POST', { amount: 50 });
        const res = await POST(req as any, { params: Promise.resolve({ id: 'order-1' }) });
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.message).toBe('Stripe refund failed');
    });
});
