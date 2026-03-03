import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { prismaMock, createMockRequest } from '../../helpers/mocks';

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

import { POST } from '@/app/api/admin/wholesale/broadcast/route';

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

const wholesalers = [
    { id: 'w-1', name: 'Wholesaler A', email: 'a@wholesale.com', phone: '+61400000001' },
    { id: 'w-2', name: 'Wholesaler B', email: 'b@wholesale.com', phone: '+61400000002' },
    { id: 'w-3', name: 'Wholesaler C', email: 'c@wholesale.com', phone: null },
];

describe('Admin Wholesale Broadcast API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResendEmailsSend.mockResolvedValue({ data: { id: 'email-1' } });
        mockSendSMS.mockResolvedValue({ success: true, sid: 'SM_test' });
        prismaMock.notification.create.mockResolvedValue({ id: 'notif-1' });
    });

    // ── Auth guard ──

    describe('auth guard', () => {
        it('POST /api/admin/wholesale/broadcast rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
                channels: ['email'],
            });
            const res = await POST(req as any);
            expect(res.status).toBe(403);
        });
    });

    // ── POST /api/admin/wholesale/broadcast ──

    describe('POST /api/admin/wholesale/broadcast', () => {
        it('returns 400 when subject is missing', async () => {
            adminOk();
            const req = createMockRequest('POST', {
                message: 'Hello',
                channels: ['email'],
            });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });

        it('returns 400 when message is missing', async () => {
            adminOk();
            const req = createMockRequest('POST', {
                subject: 'Test',
                channels: ['email'],
            });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });

        it('returns 400 when channels is missing', async () => {
            adminOk();
            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
            });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });

        it('returns 400 when channels is empty', async () => {
            adminOk();
            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
                channels: [],
            });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });

        it('sends email broadcast to all approved wholesalers', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue(wholesalers);

            const req = createMockRequest('POST', {
                subject: 'Weekly Update',
                message: 'New specials available!',
                channels: ['email'],
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.emailsSent).toBe(3);
            expect(data.smsSent).toBe(0);
            expect(data.totalRecipients).toBe(3);
            expect(data.failures).toEqual([]);

            expect(prismaMock.user.findMany).toHaveBeenCalledWith({
                where: { role: 'WHOLESALE', wholesaleStatus: 'APPROVED' },
                select: { id: true, name: true, email: true, phone: true },
            });

            expect(mockResendEmailsSend).toHaveBeenCalledTimes(3);
            expect(mockResendEmailsSend).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'a@wholesale.com',
                    subject: 'Weekly Update - Tasman Star Seafoods',
                })
            );
        });

        it('sends SMS broadcast to wholesalers with phone numbers', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue(wholesalers);

            const req = createMockRequest('POST', {
                subject: 'Weekly Update',
                message: 'New specials available!',
                channels: ['sms'],
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.emailsSent).toBe(0);
            expect(data.smsSent).toBe(2); // Only 2 have phone numbers
            expect(data.totalRecipients).toBe(3);

            expect(mockSendSMS).toHaveBeenCalledTimes(2);
            expect(mockSendSMS).toHaveBeenCalledWith(
                '+61400000001',
                'Tasman Star Seafoods: New specials available!'
            );
            expect(mockSendSMS).toHaveBeenCalledWith(
                '+61400000002',
                'Tasman Star Seafoods: New specials available!'
            );
        });

        it('sends both email and SMS when both channels selected', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue(wholesalers);

            const req = createMockRequest('POST', {
                subject: 'Dual Broadcast',
                message: 'Important update!',
                channels: ['email', 'sms'],
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.emailsSent).toBe(3);
            expect(data.smsSent).toBe(2);
            expect(data.totalRecipients).toBe(3);

            expect(mockResendEmailsSend).toHaveBeenCalledTimes(3);
            expect(mockSendSMS).toHaveBeenCalledTimes(2);
        });

        it('creates notification records for successful sends', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue([wholesalers[0]]);

            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
                channels: ['email', 'sms'],
            });
            await POST(req as any);

            // email SENT + sms SENT = 2 notification records
            expect(prismaMock.notification.create).toHaveBeenCalledTimes(2);
            expect(prismaMock.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: 'w-1',
                    type: 'EMAIL',
                    recipient: 'a@wholesale.com',
                    category: 'broadcast',
                    status: 'SENT',
                },
            });
            expect(prismaMock.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: 'w-1',
                    type: 'SMS',
                    recipient: '+61400000001',
                    category: 'broadcast',
                    status: 'SENT',
                },
            });
        });

        it('reports failures and creates FAILED notification records', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue([wholesalers[0]]);
            mockResendEmailsSend.mockRejectedValue(new Error('Email service down'));

            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
                channels: ['email'],
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.emailsSent).toBe(0);
            expect(data.failures).toHaveLength(1);
            expect(data.failures[0]).toContain('a@wholesale.com');

            expect(prismaMock.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: 'w-1',
                    type: 'EMAIL',
                    recipient: 'a@wholesale.com',
                    category: 'broadcast',
                    status: 'FAILED',
                },
            });
        });

        it('reports SMS failures', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue([wholesalers[0]]);
            mockSendSMS.mockRejectedValue(new Error('SMS service down'));

            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
                channels: ['sms'],
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.smsSent).toBe(0);
            expect(data.failures).toHaveLength(1);
            expect(data.failures[0]).toContain('+61400000001');

            expect(prismaMock.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: 'w-1',
                    type: 'SMS',
                    recipient: '+61400000001',
                    category: 'broadcast',
                    status: 'FAILED',
                },
            });
        });

        it('handles zero approved wholesalers', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue([]);

            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
                channels: ['email'],
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.emailsSent).toBe(0);
            expect(data.smsSent).toBe(0);
            expect(data.totalRecipients).toBe(0);
            expect(data.failures).toEqual([]);
        });

        it('returns 500 on unexpected error', async () => {
            adminOk();
            prismaMock.user.findMany.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('POST', {
                subject: 'Test',
                message: 'Hello',
                channels: ['email'],
            });
            const res = await POST(req as any);
            expect(res.status).toBe(500);
        });
    });
});
