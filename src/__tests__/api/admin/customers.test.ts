import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { prismaMock, factories, createMockRequest } from '../../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());
const mockSendWholesaleStatusEmail = vi.hoisted(() => vi.fn());
const mockSendSMS = vi.hoisted(() => vi.fn());
const mockWholesaleApprovedSMS = vi.hoisted(() => vi.fn());
const mockWholesaleRejectedSMS = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/resend', () => ({
    sendWholesaleStatusEmail: mockSendWholesaleStatusEmail,
}));

vi.mock('@/lib/twilio', () => ({
    sendSMS: mockSendSMS,
    wholesaleApprovedSMS: mockWholesaleApprovedSMS,
    wholesaleRejectedSMS: mockWholesaleRejectedSMS,
}));

import { GET } from '@/app/api/admin/customers/route';
import { PATCH, DELETE } from '@/app/api/admin/customers/[id]/route';

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

describe('Admin Customers API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSendWholesaleStatusEmail.mockResolvedValue({ success: true });
        mockSendSMS.mockResolvedValue({ success: true, sid: 'SM_test' });
        mockWholesaleApprovedSMS.mockReturnValue('Approved SMS message');
        mockWholesaleRejectedSMS.mockReturnValue('Rejected SMS message');
    });

    // ── Auth guard ──

    describe('auth guard', () => {
        it('GET /api/admin/customers rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('GET');
            const res = await GET(req as any);
            expect(res.status).toBe(403);
        });

        it('PATCH /api/admin/customers/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('PATCH', { name: 'Updated' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(403);
        });

        it('DELETE /api/admin/customers/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(403);
        });
    });

    // ── GET /api/admin/customers ──

    describe('GET /api/admin/customers', () => {
        it('lists customers with pagination', async () => {
            adminOk();
            const user = {
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                phone: '+61400000000',
                role: 'CUSTOMER',
                wholesaleStatus: null,
                companyName: null,
                abn: null,
                createdAt: new Date(),
                _count: { orders: 3 },
            };
            prismaMock.user.findMany.mockResolvedValue([user]);
            prismaMock.user.count.mockResolvedValue(1);

            const req = createMockRequest('GET', undefined, { page: '1', limit: '20' });
            const res = await GET(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.customers).toHaveLength(1);
            expect(data.customers[0].name).toBe('Test User');
            expect(data.customers[0].orderCount).toBe(3);
            expect(data.pagination).toEqual({
                page: 1,
                limit: 20,
                total: 1,
                pages: 1,
            });
        });

        it('supports search filter', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue([]);
            prismaMock.user.count.mockResolvedValue(0);

            const req = createMockRequest('GET', undefined, { search: 'john' });
            await GET(req as any);

            expect(prismaMock.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { name: { contains: 'john', mode: 'insensitive' } },
                            { email: { contains: 'john', mode: 'insensitive' } },
                            { companyName: { contains: 'john', mode: 'insensitive' } },
                        ],
                    },
                })
            );
        });

        it('supports role filter', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue([]);
            prismaMock.user.count.mockResolvedValue(0);

            const req = createMockRequest('GET', undefined, { role: 'WHOLESALE' });
            await GET(req as any);

            expect(prismaMock.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { role: 'WHOLESALE' },
                })
            );
        });

        it('supports wholesaleStatus filter', async () => {
            adminOk();
            prismaMock.user.findMany.mockResolvedValue([]);
            prismaMock.user.count.mockResolvedValue(0);

            const req = createMockRequest('GET', undefined, { wholesaleStatus: 'PENDING' });
            await GET(req as any);

            expect(prismaMock.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { wholesaleStatus: 'PENDING' },
                })
            );
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.user.findMany.mockRejectedValue(new Error('DB error'));
            prismaMock.user.count.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('GET');
            const res = await GET(req as any);
            expect(res.status).toBe(500);
        });
    });

    // ── PATCH /api/admin/customers/[id] ──

    describe('PATCH /api/admin/customers/[id]', () => {
        it('updates user profile fields', async () => {
            adminOk();
            const updatedUser = {
                id: 'user-1',
                name: 'Updated Name',
                email: 'updated@example.com',
                phone: '+61400111222',
                role: 'CUSTOMER',
                wholesaleStatus: null,
                companyName: 'New Co',
                abn: '12345678901',
            };
            prismaMock.user.findUnique.mockResolvedValue(null); // email not taken
            prismaMock.user.update.mockResolvedValue(updatedUser);

            const req = createMockRequest('PATCH', {
                name: 'Updated Name',
                email: 'updated@example.com',
                phone: '+61400111222',
                companyName: 'New Co',
                abn: '12345678901',
            });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.user.name).toBe('Updated Name');
            expect(prismaMock.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'user-1' },
                    data: expect.objectContaining({
                        name: 'Updated Name',
                        email: 'updated@example.com',
                        phone: '+61400111222',
                        companyName: 'New Co',
                        abn: '12345678901',
                    }),
                })
            );
        });

        it('returns 400 when name is empty', async () => {
            adminOk();
            const req = createMockRequest('PATCH', { name: '' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toMatch(/name/i);
        });

        it('returns 400 when email is invalid', async () => {
            adminOk();
            const req = createMockRequest('PATCH', { email: 'notanemail' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toMatch(/email/i);
        });

        it('returns 400 when email is already in use by another user', async () => {
            adminOk();
            prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'taken@example.com' });

            const req = createMockRequest('PATCH', { email: 'taken@example.com' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toMatch(/already in use/i);
        });

        it('allows email update when same user owns it', async () => {
            adminOk();
            prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'same@example.com' });
            prismaMock.user.update.mockResolvedValue({
                id: 'user-1',
                name: 'Test',
                email: 'same@example.com',
                phone: null,
                role: 'CUSTOMER',
                wholesaleStatus: null,
                companyName: null,
                abn: null,
            });

            const req = createMockRequest('PATCH', { email: 'same@example.com' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(200);
        });

        it('returns 400 when no fields to update', async () => {
            adminOk();
            const req = createMockRequest('PATCH', {});
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toMatch(/no fields/i);
        });

        it('returns 400 for invalid wholesale status', async () => {
            adminOk();
            const req = createMockRequest('PATCH', { wholesaleStatus: 'INVALID' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(400);
        });

        it('returns 400 for invalid role', async () => {
            adminOk();
            const req = createMockRequest('PATCH', { role: 'SUPERADMIN' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(400);
        });

        it('sends email and SMS when wholesale status set to APPROVED', async () => {
            adminOk();
            const updatedUser = {
                id: 'user-1',
                name: 'Wholesaler',
                email: 'ws@example.com',
                phone: '+61400000000',
                role: 'WHOLESALE',
                wholesaleStatus: 'APPROVED',
                companyName: 'Test Business',
                abn: null,
            };
            prismaMock.user.update.mockResolvedValue(updatedUser);

            const req = createMockRequest('PATCH', { wholesaleStatus: 'APPROVED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });

            expect(res.status).toBe(200);
            expect(mockSendWholesaleStatusEmail).toHaveBeenCalledWith({
                name: 'Wholesaler',
                email: 'ws@example.com',
                status: 'APPROVED',
                companyName: 'Test Business',
            });
            expect(mockWholesaleApprovedSMS).toHaveBeenCalledWith('Wholesaler');
            expect(mockSendSMS).toHaveBeenCalledWith('+61400000000', 'Approved SMS message');
        });

        it('sends email and SMS when wholesale status set to REJECTED', async () => {
            adminOk();
            const updatedUser = {
                id: 'user-1',
                name: 'Wholesaler',
                email: 'ws@example.com',
                phone: '+61400000000',
                role: 'WHOLESALE',
                wholesaleStatus: 'REJECTED',
                companyName: null,
                abn: null,
            };
            prismaMock.user.update.mockResolvedValue(updatedUser);

            const req = createMockRequest('PATCH', { wholesaleStatus: 'REJECTED' });
            const res = await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });

            expect(res.status).toBe(200);
            expect(mockSendWholesaleStatusEmail).toHaveBeenCalledWith({
                name: 'Wholesaler',
                email: 'ws@example.com',
                status: 'REJECTED',
                companyName: null,
            });
            expect(mockWholesaleRejectedSMS).toHaveBeenCalledWith('Wholesaler');
            expect(mockSendSMS).toHaveBeenCalledWith('+61400000000', 'Rejected SMS message');
        });

        it('does not send SMS when user has no phone number', async () => {
            adminOk();
            const updatedUser = {
                id: 'user-1',
                name: 'Wholesaler',
                email: 'ws@example.com',
                phone: null,
                role: 'WHOLESALE',
                wholesaleStatus: 'APPROVED',
                companyName: null,
                abn: null,
            };
            prismaMock.user.update.mockResolvedValue(updatedUser);

            const req = createMockRequest('PATCH', { wholesaleStatus: 'APPROVED' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });

            expect(mockSendWholesaleStatusEmail).toHaveBeenCalled();
            expect(mockSendSMS).not.toHaveBeenCalled();
        });

        it('does not send notifications when wholesale status is PENDING', async () => {
            adminOk();
            const updatedUser = {
                id: 'user-1',
                name: 'Wholesaler',
                email: 'ws@example.com',
                phone: '+61400000000',
                role: 'WHOLESALE',
                wholesaleStatus: 'PENDING',
                companyName: null,
                abn: null,
            };
            prismaMock.user.update.mockResolvedValue(updatedUser);

            const req = createMockRequest('PATCH', { wholesaleStatus: 'PENDING' });
            await PATCH(req as any, { params: Promise.resolve({ id: 'user-1' }) });

            expect(mockSendWholesaleStatusEmail).not.toHaveBeenCalled();
            expect(mockSendSMS).not.toHaveBeenCalled();
        });
    });

    // ── DELETE /api/admin/customers/[id] ──

    describe('DELETE /api/admin/customers/[id]', () => {
        it('deletes a customer', async () => {
            adminOk();
            prismaMock.user.findUnique.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                role: 'CUSTOMER',
                _count: { orders: 0 },
            });
            prismaMock.user.delete.mockResolvedValue({ id: 'user-1' });

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.message).toContain('Test User');
            expect(data.message).toContain('deleted');
            expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
        });

        it('returns 400 when trying to delete yourself', async () => {
            // First call for the guard, second call inside the handler
            mockRequireAdmin
                .mockResolvedValueOnce({
                    error: null,
                    session: { user: { id: 'admin-1', role: 'ADMIN' } },
                })
                .mockResolvedValueOnce({
                    error: null,
                    session: { user: { id: 'admin-1', role: 'ADMIN' } },
                });

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'admin-1' }) });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toMatch(/cannot delete your own/i);
        });

        it('returns 404 when customer not found', async () => {
            // Two calls to requireAdmin in DELETE handler
            mockRequireAdmin
                .mockResolvedValueOnce({
                    error: null,
                    session: { user: { id: 'admin-1', role: 'ADMIN' } },
                })
                .mockResolvedValueOnce({
                    error: null,
                    session: { user: { id: 'admin-1', role: 'ADMIN' } },
                });
            prismaMock.user.findUnique.mockResolvedValue(null);

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'nonexistent' }) });
            expect(res.status).toBe(404);
        });

        it('returns 500 on database error', async () => {
            mockRequireAdmin
                .mockResolvedValueOnce({
                    error: null,
                    session: { user: { id: 'admin-1', role: 'ADMIN' } },
                })
                .mockResolvedValueOnce({
                    error: null,
                    session: { user: { id: 'admin-1', role: 'ADMIN' } },
                });
            prismaMock.user.findUnique.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                role: 'CUSTOMER',
                _count: { orders: 0 },
            });
            prismaMock.user.delete.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'user-1' }) });
            expect(res.status).toBe(500);
        });
    });
});
