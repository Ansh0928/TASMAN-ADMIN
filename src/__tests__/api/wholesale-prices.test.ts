import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks (available before vi.mock factories run) ──
const { mockAuth, mockPrisma } = vi.hoisted(() => {
    return {
        mockAuth: vi.fn(),
        mockPrisma: {
            wholesaleCategory: {
                findMany: vi.fn(),
            },
        },
    };
});

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma,
}));

vi.mock('@/lib/auth', () => ({
    auth: mockAuth,
}));

import { GET } from '@/app/api/wholesale/prices/route';

const mockCategories = [
    {
        id: 'wcat-1',
        name: 'Fresh Fish',
        sortOrder: 1,
        items: [
            {
                id: 'wpi-1',
                name: 'Salmon Fillet',
                description: 'Fresh Atlantic Salmon',
                unit: 'KG',
                price: { toString: () => '24.99' },
                isAvailable: true,
                isTodaysSpecial: true,
                isFeatured: false,
                sortOrder: 1,
            },
            {
                id: 'wpi-2',
                name: 'Barramundi',
                description: 'Wild Barramundi',
                unit: 'KG',
                price: { toString: () => '29.99' },
                isAvailable: true,
                isTodaysSpecial: false,
                isFeatured: true,
                sortOrder: 2,
            },
        ],
    },
    {
        id: 'wcat-2',
        name: 'Shellfish',
        sortOrder: 2,
        items: [
            {
                id: 'wpi-3',
                name: 'Tiger Prawns',
                description: 'Large Tiger Prawns',
                unit: 'KG',
                price: { toString: () => '39.99' },
                isAvailable: true,
                isTodaysSpecial: false,
                isFeatured: false,
                sortOrder: 1,
            },
        ],
    },
];

describe('GET /api/wholesale/prices', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── Auth: unauthenticated ──

    it('rejects unauthenticated users with 401', async () => {
        mockAuth.mockResolvedValue(null);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe('Please sign in to view wholesale prices');
    });

    it('rejects when session has no user', async () => {
        mockAuth.mockResolvedValue({ user: null });

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe('Please sign in to view wholesale prices');
    });

    // ── Auth: non-wholesale users ──

    it('rejects CUSTOMER role users with 403', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'CUSTOMER', email: 'customer@test.com' },
        });

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toBe('Wholesale pricing is only available to approved wholesale partners.');
    });

    // ── Auth: wholesale with non-approved statuses ──

    it('rejects WHOLESALE user with PENDING status with 403', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'PENDING', email: 'ws@test.com' },
        });

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toContain('still being reviewed');
    });

    it('rejects WHOLESALE user with REJECTED status with 403', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'REJECTED', email: 'ws@test.com' },
        });

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toContain('not approved');
    });

    // ── Successful responses ──

    it('returns categories with items for APPROVED wholesale user', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'APPROVED', email: 'ws@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockResolvedValue(mockCategories);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toHaveLength(2);
        expect(body[0].name).toBe('Fresh Fish');
        expect(body[0].items).toHaveLength(2);
        expect(body[1].name).toBe('Shellfish');
        expect(body[1].items).toHaveLength(1);
    });

    it('returns categories with items for ADMIN user', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockResolvedValue(mockCategories);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toHaveLength(2);
    });

    it('returns correctly mapped item fields', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'APPROVED', email: 'ws@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockResolvedValue(mockCategories);

        const res = await GET();
        const body = await res.json();

        const firstItem = body[0].items[0];
        expect(firstItem).toEqual({
            id: 'wpi-1',
            name: 'Salmon Fillet',
            description: 'Fresh Atlantic Salmon',
            unit: 'KG',
            price: '24.99',
            isAvailable: true,
        });
    });

    it('returns price as string', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'APPROVED', email: 'ws@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockResolvedValue(mockCategories);

        const res = await GET();
        const body = await res.json();

        expect(typeof body[0].items[0].price).toBe('string');
        expect(body[0].items[0].price).toBe('24.99');
    });

    it('returns category id and name at top level', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'APPROVED', email: 'ws@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockResolvedValue(mockCategories);

        const res = await GET();
        const body = await res.json();

        expect(body[0]).toHaveProperty('id', 'wcat-1');
        expect(body[0]).toHaveProperty('name', 'Fresh Fish');
        expect(body[0]).toHaveProperty('items');
    });

    it('returns empty array when no categories exist', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'APPROVED', email: 'ws@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockResolvedValue([]);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual([]);
    });

    it('queries categories with correct include and orderBy', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockResolvedValue([]);

        await GET();

        expect(mockPrisma.wholesaleCategory.findMany).toHaveBeenCalledWith({
            include: {
                items: {
                    where: { isAvailable: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });
    });

    // ── Error handling ──

    it('returns 500 when database query fails', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'APPROVED', email: 'ws@test.com' },
        });
        mockPrisma.wholesaleCategory.findMany.mockRejectedValue(new Error('DB error'));

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to fetch prices');
    });
});
