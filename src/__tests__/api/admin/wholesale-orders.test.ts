import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { prismaMock, factories, createMockRequest } from '../../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());
const mockResendEmailsSend = vi.hoisted(() => vi.fn());
const mockSendSMS = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/resend', () => ({
    resend: {
        emails: {
            send: mockResendEmailsSend,
        },
    },
    EMAIL_FROM: 'Tasman Star Seafoods <onboarding@resend.dev>',
}));

vi.mock('@/lib/twilio', () => ({
    sendSMS: mockSendSMS,
}));

import { GET } from '@/app/api/admin/wholesale-orders/route';
import { PATCH } from '@/app/api/admin/wholesale-orders/[id]/route';

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

describe('Admin Wholesale Orders API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResendEmailsSend.mockResolvedValue({ data: { id: 'email-1' } });
        mockSendSMS.mockResolvedValue({ success: true, sid: 'SM_test' });
    });

    // ── Auth guard ──

    describe('auth guard', () => {
        it('GET /api/admin/wholesale-orders rejects non-admin', async () => {
            adminForbidden();
            const res = await GET();
            expect(res.status).toBe(403);
        });

        it('PATCH /api/admin/wholesale-orders/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });
            expect(res.status).toBe(403);
        });
    });

    // ── GET /api/admin/wholesale-orders ──

    describe('GET /api/admin/wholesale-orders', () => {
        it('lists all wholesale orders', async () => {
            adminOk();
            const orders = [
                factories.wholesaleOrder({
                    id: 'wo-1',
                    status: 'PENDING',
                    items: [
                        {
                            id: 'woi-1',
                            quantity: 5,
                            wholesalePriceItem: { id: 'wpi-1', name: 'Salmon', price: '19.99', unit: 'KG' },
                        },
                    ],
                }),
                factories.wholesaleOrder({
                    id: 'wo-2',
                    status: 'CONFIRMED',
                    items: [],
                }),
            ];
            prismaMock.wholesaleOrder.findMany.mockResolvedValue(orders);

            const res = await GET();
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.orders).toHaveLength(2);
            expect(prismaMock.wholesaleOrder.findMany).toHaveBeenCalledWith({
                include: {
                    user: { select: { name: true, email: true, phone: true, companyName: true } },
                    items: { include: { wholesalePriceItem: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.wholesaleOrder.findMany.mockRejectedValue(new Error('DB error'));

            const res = await GET();
            expect(res.status).toBe(500);
        });
    });

    // ── PATCH /api/admin/wholesale-orders/[id] ──

    describe('PATCH /api/admin/wholesale-orders/[id]', () => {
        const makeUpdatedOrder = (status: string, hasPhone = true) => ({
            ...factories.wholesaleOrder({
                id: 'wo-1',
                status,
                user: {
                    name: 'Test Wholesaler',
                    email: 'ws@test.com',
                    phone: hasPhone ? '+61400000000' : null,
                },
                items: [],
            }),
        });

        it('updates wholesale order status to CONFIRMED', async () => {
            adminOk();
            const order = makeUpdatedOrder('CONFIRMED');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.order).toBeDefined();
            expect(prismaMock.wholesaleOrder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'wo-1' },
                    data: expect.objectContaining({ status: 'CONFIRMED' }),
                })
            );
        });

        it('updates wholesale order status to REJECTED', async () => {
            adminOk();
            const order = makeUpdatedOrder('REJECTED');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'REJECTED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(res.status).toBe(200);
        });

        it('updates wholesale order status to COMPLETED', async () => {
            adminOk();
            const order = makeUpdatedOrder('COMPLETED');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'COMPLETED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(res.status).toBe(200);
        });

        it('updates adminNotes', async () => {
            adminOk();
            const order = makeUpdatedOrder('CONFIRMED');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'CONFIRMED', adminNotes: 'Ready by 3pm' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(res.status).toBe(200);
            expect(prismaMock.wholesaleOrder.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'CONFIRMED',
                        adminNotes: 'Ready by 3pm',
                    }),
                })
            );
        });

        it('returns 400 for invalid status', async () => {
            adminOk();
            const req = createMockRequest('PATCH', { status: 'INVALID' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe('Invalid status');
        });

        it('sends email notification on CONFIRMED status', async () => {
            adminOk();
            const order = makeUpdatedOrder('CONFIRMED');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(mockResendEmailsSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'ws@test.com',
                    subject: expect.stringContaining('Confirmed'),
                })
            );
        });

        it('sends email notification on REJECTED status', async () => {
            adminOk();
            const order = makeUpdatedOrder('REJECTED');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'REJECTED' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(mockResendEmailsSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'ws@test.com',
                    subject: expect.stringContaining('Declined'),
                })
            );
        });

        it('sends email notification on COMPLETED status', async () => {
            adminOk();
            const order = makeUpdatedOrder('COMPLETED');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'COMPLETED' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(mockResendEmailsSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'ws@test.com',
                    subject: expect.stringContaining('Completed'),
                })
            );
        });

        it('sends SMS notification when user has phone number', async () => {
            adminOk();
            const order = makeUpdatedOrder('CONFIRMED', true);
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(mockSendSMS).toHaveBeenCalledWith(
                '+61400000000',
                expect.stringContaining('confirmed')
            );
        });

        it('does not send SMS when user has no phone number', async () => {
            adminOk();
            const order = makeUpdatedOrder('CONFIRMED', false);
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(mockSendSMS).not.toHaveBeenCalled();
        });

        it('does not send notifications for PENDING status', async () => {
            adminOk();
            const order = makeUpdatedOrder('PENDING');
            prismaMock.wholesaleOrder.update.mockResolvedValue(order);

            const req = createMockRequest('PATCH', { status: 'PENDING' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });

            expect(mockResendEmailsSend).not.toHaveBeenCalled();
            expect(mockSendSMS).not.toHaveBeenCalled();
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.wholesaleOrder.update.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('PATCH', { status: 'CONFIRMED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'wo-1' }) });
            expect(res.status).toBe(500);
        });
    });
});
