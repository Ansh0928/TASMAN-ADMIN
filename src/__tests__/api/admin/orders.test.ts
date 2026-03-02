import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { prismaMock, factories, createMockRequest } from '../../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());
const mockSendPushNotification = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/web-push', () => ({
    sendPushNotification: mockSendPushNotification,
}));

import { GET } from '@/app/api/admin/orders/route';
import {
    GET as GET_BY_ID,
    PATCH,
} from '@/app/api/admin/orders/[id]/route';

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

describe('Admin Orders API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSendPushNotification.mockResolvedValue(undefined);
    });

    // ── Auth guard ──

    describe('auth guard', () => {
        it('GET /api/admin/orders rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('GET');
            const res = await GET(req as any);
            expect(res.status).toBe(403);
        });

        it('GET /api/admin/orders/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('GET');
            const res = await GET_BY_ID(req as any, { params: Promise.resolve({ id: 'order-1' }) });
            expect(res.status).toBe(403);
        });

        it('PATCH /api/admin/orders/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'order-1' }) });
            expect(res.status).toBe(403);
        });
    });

    // ── GET /api/admin/orders ──

    describe('GET /api/admin/orders', () => {
        it('lists orders with pagination', async () => {
            adminOk();
            const order = {
                ...factories.order(),
                total: { toString: () => '109.89' },
                user: { name: 'Test User', email: 'test@example.com' },
                guestName: null,
                guestEmail: null,
                items: [
                    {
                        product: { name: 'Atlantic Salmon' },
                        quantity: 2,
                        unitPrice: { toString: () => '29.99' },
                        total: { toString: () => '59.98' },
                    },
                ],
            };
            prismaMock.order.findMany.mockResolvedValue([order]);
            prismaMock.order.count.mockResolvedValue(1);

            const req = createMockRequest('GET', undefined, { page: '1', limit: '20' });
            const res = await GET(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.orders).toHaveLength(1);
            expect(data.orders[0].customerName).toBe('Test User');
            expect(data.orders[0].total).toBe('109.89');
            expect(data.orders[0].itemCount).toBe(1);
            expect(data.pagination).toEqual({
                page: 1,
                limit: 20,
                total: 1,
                pages: 1,
            });
        });

        it('filters orders by status', async () => {
            adminOk();
            prismaMock.order.findMany.mockResolvedValue([]);
            prismaMock.order.count.mockResolvedValue(0);

            const req = createMockRequest('GET', undefined, { status: 'PENDING' });
            await GET(req as any);

            expect(prismaMock.order.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'PENDING' },
                })
            );
        });

        it('ignores status filter when set to ALL', async () => {
            adminOk();
            prismaMock.order.findMany.mockResolvedValue([]);
            prismaMock.order.count.mockResolvedValue(0);

            const req = createMockRequest('GET', undefined, { status: 'ALL' });
            await GET(req as any);

            expect(prismaMock.order.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                })
            );
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.order.findMany.mockRejectedValue(new Error('DB error'));
            prismaMock.order.count.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('GET');
            const res = await GET(req as any);
            expect(res.status).toBe(500);
        });
    });

    // ── GET /api/admin/orders/[id] ──

    describe('GET /api/admin/orders/[id]', () => {
        it('returns order details', async () => {
            adminOk();
            const order = {
                ...factories.order(),
                user: { name: 'Test User', email: 'test@example.com', phone: '+61400000000' },
                items: [
                    {
                        product: { name: 'Salmon', slug: 'salmon', imageUrls: [] },
                        quantity: 2,
                        unitPrice: '29.99',
                        total: '59.98',
                    },
                ],
                notifications: [],
            };
            prismaMock.order.findUnique.mockResolvedValue(order);

            const req = createMockRequest('GET');
            const res = await GET_BY_ID(req as any, { params: Promise.resolve({ id: 'order-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.order).toBeDefined();
            expect(data.order.id).toBe('order-1');
        });

        it('returns 404 when order not found', async () => {
            adminOk();
            prismaMock.order.findUnique.mockResolvedValue(null);

            const req = createMockRequest('GET');
            const res = await GET_BY_ID(req as any, { params: Promise.resolve({ id: 'nonexistent' }) });
            expect(res.status).toBe(404);
        });
    });

    // ── PATCH /api/admin/orders/[id] ──

    describe('PATCH /api/admin/orders/[id]', () => {
        it('updates order status', async () => {
            adminOk();
            const updatedOrder = factories.order({ status: 'CONFIRMED', userId: null });
            prismaMock.order.update.mockResolvedValue(updatedOrder);

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'order-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.order).toBeDefined();
            expect(prismaMock.order.update).toHaveBeenCalledWith({
                where: { id: 'order-1' },
                data: { status: 'CONFIRMED' },
            });
        });

        it('returns 400 for invalid status', async () => {
            adminOk();
            const req = createMockRequest('PATCH', { status: 'INVALID' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'order-1' }) });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe('Invalid status');
        });

        it('sends push notification on status change when user has subscriptions', async () => {
            adminOk();
            const updatedOrder = factories.order({ status: 'PREPARING', userId: 'user-1' });
            prismaMock.order.update.mockResolvedValue(updatedOrder);

            const subscription = {
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                p256dh: 'test-key',
                auth: 'test-auth',
                userId: 'user-1',
            };
            prismaMock.pushSubscription.findMany.mockResolvedValue([subscription]);

            const req = createMockRequest('PATCH', { status: 'PREPARING' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'order-1' }) });

            expect(res.status).toBe(200);
            expect(prismaMock.pushSubscription.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
            });
            expect(mockSendPushNotification).toHaveBeenCalledWith(
                {
                    endpoint: subscription.endpoint,
                    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
                },
                {
                    title: 'Order Update',
                    body: 'Your order is now Preparing',
                    url: `/order-confirmation?order_id=order-1`,
                }
            );
        });

        it('does not send push notification when order has no userId', async () => {
            adminOk();
            const updatedOrder = factories.order({ status: 'CONFIRMED', userId: null });
            prismaMock.order.update.mockResolvedValue(updatedOrder);

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'order-1' }) });

            expect(prismaMock.pushSubscription.findMany).not.toHaveBeenCalled();
            expect(mockSendPushNotification).not.toHaveBeenCalled();
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.order.update.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'order-1' }) });
            expect(res.status).toBe(500);
        });
    });
});
