import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { prismaMock, createMockRequest } from '../../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());
const mockNotifyWholesalersOfUpdate = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/wholesale-notifications', () => ({
    notifyWholesalersOfUpdate: mockNotifyWholesalersOfUpdate,
}));

const mockAfterCallbacks: Array<() => Promise<void>> = [];
vi.mock('next/server', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next/server')>();
    return {
        ...actual,
        after: vi.fn((cb: () => Promise<void>) => { mockAfterCallbacks.push(cb); }),
    };
});

import { GET, POST } from '@/app/api/admin/wholesale/route';
import { PUT, DELETE } from '@/app/api/admin/wholesale/[id]/route';

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

describe('Admin Wholesale API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAfterCallbacks.length = 0;
        mockNotifyWholesalersOfUpdate.mockResolvedValue(undefined);
    });

    async function flushAfterCallbacks() {
        for (const cb of mockAfterCallbacks) {
            await cb();
        }
    }

    // ── Auth guard ──

    describe('auth guard', () => {
        it('GET /api/admin/wholesale rejects non-admin', async () => {
            adminForbidden();
            const res = await GET();
            expect(res.status).toBe(403);
        });

        it('POST /api/admin/wholesale rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('POST', { type: 'category', name: 'Fish' });
            const res = await POST(req as any);
            expect(res.status).toBe(403);
        });

        it('PUT /api/admin/wholesale/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('PUT', { type: 'category', name: 'Updated' });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'wcat-1' }) });
            expect(res.status).toBe(403);
        });

        it('DELETE /api/admin/wholesale/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('DELETE', undefined, { type: 'category' });
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'wcat-1' }) });
            expect(res.status).toBe(403);
        });
    });

    // ── GET /api/admin/wholesale ──

    describe('GET /api/admin/wholesale', () => {
        it('lists wholesale categories with items', async () => {
            adminOk();
            const categories = [
                {
                    id: 'wcat-1',
                    name: 'Fresh Fish',
                    sortOrder: 0,
                    items: [
                        {
                            id: 'wpi-1',
                            name: 'Salmon Fillet',
                            unit: 'KG',
                            price: '19.99',
                            isAvailable: true,
                            isTodaysSpecial: false,
                            isFeatured: false,
                            sortOrder: 0,
                            categoryId: 'wcat-1',
                        },
                    ],
                },
            ];
            prismaMock.wholesaleCategory.findMany.mockResolvedValue(categories);

            const res = await GET();
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.categories).toHaveLength(1);
            expect(data.categories[0].name).toBe('Fresh Fish');
            expect(data.categories[0].items).toHaveLength(1);
            expect(prismaMock.wholesaleCategory.findMany).toHaveBeenCalledWith({
                include: {
                    items: { orderBy: { sortOrder: 'asc' } },
                },
                orderBy: { sortOrder: 'asc' },
            });
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.wholesaleCategory.findMany.mockRejectedValue(new Error('DB error'));

            const res = await GET();
            expect(res.status).toBe(500);
        });
    });

    // ── POST /api/admin/wholesale ──

    describe('POST /api/admin/wholesale', () => {
        it('creates a category', async () => {
            adminOk();
            const category = { id: 'wcat-new', name: 'Shellfish', sortOrder: 1 };
            prismaMock.wholesaleCategory.create.mockResolvedValue(category);

            const req = createMockRequest('POST', {
                type: 'category',
                name: 'Shellfish',
                sortOrder: 1,
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(201);
            expect(data.category).toEqual(category);
            expect(prismaMock.wholesaleCategory.create).toHaveBeenCalledWith({
                data: { name: 'Shellfish', sortOrder: 1 },
            });
        });

        it('returns 400 when category name is missing', async () => {
            adminOk();
            const req = createMockRequest('POST', { type: 'category' });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });

        it('creates an item', async () => {
            adminOk();
            const item = {
                id: 'wpi-new',
                name: 'Bulk Prawns',
                unit: 'KG',
                price: 25.0,
                categoryId: 'wcat-1',
                description: null,
                isAvailable: true,
                sortOrder: 0,
            };
            prismaMock.wholesalePriceItem.create.mockResolvedValue(item);

            const req = createMockRequest('POST', {
                type: 'item',
                categoryId: 'wcat-1',
                name: 'Bulk Prawns',
                unit: 'KG',
                price: '25.00',
            });
            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(201);
            expect(data.item).toBeDefined();
            expect(prismaMock.wholesalePriceItem.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    categoryId: 'wcat-1',
                    name: 'Bulk Prawns',
                    unit: 'KG',
                    price: 25.0,
                }),
            });
        });

        it('triggers wholesaler notifications when creating an item', async () => {
            adminOk();
            prismaMock.wholesalePriceItem.create.mockResolvedValue({
                id: 'wpi-new',
                name: 'New Item',
                unit: 'KG',
                price: 10,
                categoryId: 'wcat-1',
            });

            const req = createMockRequest('POST', {
                type: 'item',
                categoryId: 'wcat-1',
                name: 'New Item',
                unit: 'KG',
                price: '10',
            });
            await POST(req as any);
            await flushAfterCallbacks();

            expect(mockNotifyWholesalersOfUpdate).toHaveBeenCalled();
        });

        it('does not trigger notifications when creating a category', async () => {
            adminOk();
            prismaMock.wholesaleCategory.create.mockResolvedValue({
                id: 'wcat-new',
                name: 'New Cat',
                sortOrder: 0,
            });

            const req = createMockRequest('POST', { type: 'category', name: 'New Cat' });
            await POST(req as any);
            await flushAfterCallbacks();

            expect(mockNotifyWholesalersOfUpdate).not.toHaveBeenCalled();
        });

        it('returns 400 when item fields are missing', async () => {
            adminOk();
            const req = createMockRequest('POST', { type: 'item', name: 'Missing Fields' });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });

        it('returns 400 for invalid type', async () => {
            adminOk();
            const req = createMockRequest('POST', { type: 'unknown' });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });
    });

    // ── PUT /api/admin/wholesale/[id] ──

    describe('PUT /api/admin/wholesale/[id]', () => {
        it('updates a category', async () => {
            adminOk();
            const category = { id: 'wcat-1', name: 'Updated Fish', sortOrder: 2 };
            prismaMock.wholesaleCategory.update.mockResolvedValue(category);

            const req = createMockRequest('PUT', {
                type: 'category',
                name: 'Updated Fish',
                sortOrder: 2,
            });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'wcat-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.category.name).toBe('Updated Fish');
            expect(prismaMock.wholesaleCategory.update).toHaveBeenCalledWith({
                where: { id: 'wcat-1' },
                data: { name: 'Updated Fish', sortOrder: 2 },
            });
        });

        it('updates an item including isTodaysSpecial and isFeatured', async () => {
            adminOk();
            const item = {
                id: 'wpi-1',
                name: 'Updated Salmon',
                isTodaysSpecial: true,
                isFeatured: true,
                price: 22.0,
            };
            prismaMock.wholesalePriceItem.update.mockResolvedValue(item);

            const req = createMockRequest('PUT', {
                type: 'item',
                name: 'Updated Salmon',
                price: '22',
                isTodaysSpecial: true,
                isFeatured: true,
            });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'wpi-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.item.isTodaysSpecial).toBe(true);
            expect(data.item.isFeatured).toBe(true);
            expect(prismaMock.wholesalePriceItem.update).toHaveBeenCalledWith({
                where: { id: 'wpi-1' },
                data: expect.objectContaining({
                    name: 'Updated Salmon',
                    price: 22,
                    isTodaysSpecial: true,
                    isFeatured: true,
                }),
            });
        });

        it('triggers wholesaler notifications when updating an item', async () => {
            adminOk();
            prismaMock.wholesalePriceItem.update.mockResolvedValue({ id: 'wpi-1', name: 'X' });

            const req = createMockRequest('PUT', { type: 'item', name: 'X' });
            await PUT(req as any, { params: Promise.resolve({ id: 'wpi-1' }) });
            await flushAfterCallbacks();

            expect(mockNotifyWholesalersOfUpdate).toHaveBeenCalled();
        });

        it('returns 400 for invalid type', async () => {
            adminOk();
            const req = createMockRequest('PUT', { type: 'unknown' });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'wcat-1' }) });
            expect(res.status).toBe(400);
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.wholesaleCategory.update.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('PUT', { type: 'category', name: 'Fail' });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'wcat-1' }) });
            expect(res.status).toBe(500);
        });
    });

    // ── DELETE /api/admin/wholesale/[id] ──

    describe('DELETE /api/admin/wholesale/[id]', () => {
        it('deletes a category', async () => {
            adminOk();
            prismaMock.wholesaleCategory.delete.mockResolvedValue({ id: 'wcat-1' });

            const req = createMockRequest('DELETE', undefined, { type: 'category' });
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'wcat-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.message).toBe('Category deleted');
            expect(prismaMock.wholesaleCategory.delete).toHaveBeenCalledWith({ where: { id: 'wcat-1' } });
        });

        it('deletes an item (default when no type param)', async () => {
            adminOk();
            prismaMock.wholesalePriceItem.delete.mockResolvedValue({ id: 'wpi-1' });

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'wpi-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.message).toBe('Item deleted');
            expect(prismaMock.wholesalePriceItem.delete).toHaveBeenCalledWith({ where: { id: 'wpi-1' } });
        });

        it('deletes an item when type=item', async () => {
            adminOk();
            prismaMock.wholesalePriceItem.delete.mockResolvedValue({ id: 'wpi-1' });

            const req = createMockRequest('DELETE', undefined, { type: 'item' });
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'wpi-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.message).toBe('Item deleted');
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.wholesalePriceItem.delete.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'wpi-1' }) });
            expect(res.status).toBe(500);
        });
    });
});
