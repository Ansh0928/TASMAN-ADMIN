import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks (available before vi.mock factories run) ──
const { mockAuth, mockPrisma } = vi.hoisted(() => {
    return {
        mockAuth: vi.fn(),
        mockPrisma: {
            wholesaleOrder: {
                findMany: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
            },
            wholesalePriceItem: {
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

import { GET, POST } from '@/app/api/wholesale/orders/route';
import { GET as GET_BY_ID } from '@/app/api/wholesale/orders/[id]/route';
import { createMockRequest, factories } from '../helpers/mocks';

// ── Helpers ──

function approvedWholesaleSession(overrides = {}) {
    return {
        user: {
            id: 'ws-user-1',
            role: 'WHOLESALE',
            wholesaleStatus: 'APPROVED',
            email: 'wholesaler@test.com',
            ...overrides,
        },
    };
}

function adminSession() {
    return {
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' },
    };
}

const mockPriceItems = [
    {
        id: 'wpi-1',
        name: 'Salmon Fillet',
        price: { toString: () => '24.99' },
        isAvailable: true,
    },
    {
        id: 'wpi-2',
        name: 'Barramundi',
        price: { toString: () => '29.99' },
        isAvailable: true,
    },
];

const validOrderPayload = {
    items: [
        { wholesalePriceItemId: 'wpi-1', quantity: 10 },
        { wholesalePriceItemId: 'wpi-2', quantity: 5 },
    ],
    notes: 'Deliver before 8am',
};

// ─────────────────────────────────────────────
// GET /api/wholesale/orders
// ─────────────────────────────────────────────
describe('GET /api/wholesale/orders', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects unauthenticated users with 401', async () => {
        mockAuth.mockResolvedValue(null);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe('Unauthorized');
    });

    it('rejects non-wholesale users with 403', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'CUSTOMER', email: 'customer@test.com' },
        });

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toBe('Wholesale access required');
    });

    it('rejects WHOLESALE user with PENDING status with 403', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'PENDING', email: 'ws@test.com' },
        });

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toBe('Wholesale access required');
    });

    it('rejects WHOLESALE user with REJECTED status with 403', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'REJECTED', email: 'ws@test.com' },
        });

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toBe('Wholesale access required');
    });

    it('returns orders for approved wholesale user', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        const mockOrders = [
            factories.wholesaleOrder({ id: 'wo-1', userId: 'ws-user-1' }),
            factories.wholesaleOrder({ id: 'wo-2', userId: 'ws-user-1' }),
        ];
        mockPrisma.wholesaleOrder.findMany.mockResolvedValue(mockOrders);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toHaveLength(2);
    });

    it('queries orders filtered by user ID with correct includes and ordering', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesaleOrder.findMany.mockResolvedValue([]);

        await GET();

        expect(mockPrisma.wholesaleOrder.findMany).toHaveBeenCalledWith({
            where: { userId: 'ws-user-1' },
            include: {
                items: {
                    include: { wholesalePriceItem: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('returns empty array when user has no orders', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesaleOrder.findMany.mockResolvedValue([]);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual([]);
    });

    it('returns 500 when database query fails', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesaleOrder.findMany.mockRejectedValue(new Error('DB error'));

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to fetch orders');
    });
});

// ─────────────────────────────────────────────
// POST /api/wholesale/orders
// ─────────────────────────────────────────────
describe('POST /api/wholesale/orders', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects unauthenticated users with 401', async () => {
        mockAuth.mockResolvedValue(null);

        const req = createMockRequest('POST', validOrderPayload);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe('Unauthorized');
    });

    it('rejects non-wholesale users with 403', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'CUSTOMER', email: 'customer@test.com' },
        });

        const req = createMockRequest('POST', validOrderPayload);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toBe('Wholesale access required');
    });

    it('rejects WHOLESALE user with PENDING status', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'WHOLESALE', wholesaleStatus: 'PENDING', email: 'ws@test.com' },
        });

        const req = createMockRequest('POST', validOrderPayload);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toBe('Wholesale access required');
    });

    it('creates order successfully with valid items', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesalePriceItem.findMany.mockResolvedValue(mockPriceItems);

        const createdOrder = factories.wholesaleOrder({
            id: 'wo-new',
            userId: 'ws-user-1',
            notes: 'Deliver before 8am',
            items: [
                { wholesalePriceItemId: 'wpi-1', quantity: 10, unitPrice: 24.99, total: 249.9 },
                { wholesalePriceItemId: 'wpi-2', quantity: 5, unitPrice: 29.99, total: 149.95 },
            ],
        });
        mockPrisma.wholesaleOrder.create.mockResolvedValue(createdOrder);

        const req = createMockRequest('POST', validOrderPayload);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.id).toBe('wo-new');
        expect(body.items).toHaveLength(2);
    });

    it('creates order with correct data structure', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesalePriceItem.findMany.mockResolvedValue(mockPriceItems);
        mockPrisma.wholesaleOrder.create.mockResolvedValue(factories.wholesaleOrder({ id: 'wo-new' }));

        const req = createMockRequest('POST', validOrderPayload);
        await POST(req as any);

        expect(mockPrisma.wholesaleOrder.create).toHaveBeenCalledWith({
            data: {
                userId: 'ws-user-1',
                notes: 'Deliver before 8am',
                items: {
                    create: [
                        {
                            wholesalePriceItemId: 'wpi-1',
                            quantity: 10,
                            unitPrice: 24.99,
                            total: 249.9,
                        },
                        {
                            wholesalePriceItemId: 'wpi-2',
                            quantity: 5,
                            unitPrice: 29.99,
                            total: 149.95,
                        },
                    ],
                },
            },
            include: {
                items: { include: { wholesalePriceItem: true } },
            },
        });
    });

    it('sets notes to null when not provided', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesalePriceItem.findMany.mockResolvedValue([mockPriceItems[0]]);
        mockPrisma.wholesaleOrder.create.mockResolvedValue(factories.wholesaleOrder());

        const req = createMockRequest('POST', {
            items: [{ wholesalePriceItemId: 'wpi-1', quantity: 5 }],
        });
        await POST(req as any);

        expect(mockPrisma.wholesaleOrder.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    notes: null,
                }),
            })
        );
    });

    it('fetches price items filtered by IDs and availability', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesalePriceItem.findMany.mockResolvedValue(mockPriceItems);
        mockPrisma.wholesaleOrder.create.mockResolvedValue(factories.wholesaleOrder());

        const req = createMockRequest('POST', validOrderPayload);
        await POST(req as any);

        expect(mockPrisma.wholesalePriceItem.findMany).toHaveBeenCalledWith({
            where: { id: { in: ['wpi-1', 'wpi-2'] }, isAvailable: true },
        });
    });

    // ── Validation ──

    it('rejects when items is missing', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());

        const req = createMockRequest('POST', { notes: 'No items' });
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('Invalid items list');
    });

    it('rejects when items is an empty array', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());

        const req = createMockRequest('POST', { items: [] });
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('Invalid items list');
    });

    it('rejects when items is not an array', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());

        const req = createMockRequest('POST', { items: 'not-an-array' });
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('Invalid items list');
    });

    it('returns 500 when item ID is not found in available price items', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesalePriceItem.findMany.mockResolvedValue([]);

        const req = createMockRequest('POST', {
            items: [{ wholesalePriceItemId: 'nonexistent', quantity: 5 }],
        });
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to create order');
    });

    it('returns 500 when some items are unavailable', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        // Only return one of two requested items
        mockPrisma.wholesalePriceItem.findMany.mockResolvedValue([mockPriceItems[0]]);

        const req = createMockRequest('POST', validOrderPayload);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to create order');
    });

    // ── Error handling ──

    it('returns 500 when database create fails', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesalePriceItem.findMany.mockResolvedValue(mockPriceItems);
        mockPrisma.wholesaleOrder.create.mockRejectedValue(new Error('DB write error'));

        const req = createMockRequest('POST', validOrderPayload);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to create order');
    });

    it('returns 500 when price item lookup fails', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesalePriceItem.findMany.mockRejectedValue(new Error('DB read error'));

        const req = createMockRequest('POST', validOrderPayload);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to create order');
    });
});

// ─────────────────────────────────────────────
// GET /api/wholesale/orders/[id]
// ─────────────────────────────────────────────
describe('GET /api/wholesale/orders/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function callGetById(id: string) {
        const req = createMockRequest('GET');
        return GET_BY_ID(req as any, { params: Promise.resolve({ id }) });
    }

    it('rejects unauthenticated users with 401', async () => {
        mockAuth.mockResolvedValue(null);

        const res = await callGetById('wo-1');
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe('Unauthorized');
    });

    it('returns order details for the order owner', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        const mockOrder = factories.wholesaleOrder({
            id: 'wo-1',
            userId: 'ws-user-1',
            user: { name: 'Test Wholesaler', email: 'ws@test.com', companyName: 'Test Co' },
            items: [
                {
                    id: 'woi-1',
                    wholesalePriceItemId: 'wpi-1',
                    quantity: 10,
                    unitPrice: 24.99,
                    total: 249.9,
                    wholesalePriceItem: { id: 'wpi-1', name: 'Salmon' },
                },
            ],
        });
        mockPrisma.wholesaleOrder.findUnique.mockResolvedValue(mockOrder);

        const res = await callGetById('wo-1');
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.id).toBe('wo-1');
        expect(body.items).toHaveLength(1);
    });

    it('queries the order with correct includes', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesaleOrder.findUnique.mockResolvedValue(
            factories.wholesaleOrder({ id: 'wo-1', userId: 'ws-user-1' })
        );

        await callGetById('wo-1');

        expect(mockPrisma.wholesaleOrder.findUnique).toHaveBeenCalledWith({
            where: { id: 'wo-1' },
            include: {
                items: { include: { wholesalePriceItem: true } },
                user: { select: { name: true, email: true, companyName: true } },
            },
        });
    });

    it('returns 404 when order does not exist', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesaleOrder.findUnique.mockResolvedValue(null);

        const res = await callGetById('nonexistent');
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toBe('Order not found');
    });

    it('returns 403 when non-admin user tries to view another users order', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesaleOrder.findUnique.mockResolvedValue(
            factories.wholesaleOrder({ id: 'wo-other', userId: 'other-user' })
        );

        const res = await callGetById('wo-other');
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toBe('Forbidden');
    });

    it('allows ADMIN to view any users order', async () => {
        mockAuth.mockResolvedValue(adminSession());
        const mockOrder = factories.wholesaleOrder({ id: 'wo-1', userId: 'other-user' });
        mockPrisma.wholesaleOrder.findUnique.mockResolvedValue(mockOrder);

        const res = await callGetById('wo-1');
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.id).toBe('wo-1');
    });

    it('returns 500 when database query fails', async () => {
        mockAuth.mockResolvedValue(approvedWholesaleSession());
        mockPrisma.wholesaleOrder.findUnique.mockRejectedValue(new Error('DB error'));

        const res = await callGetById('wo-1');
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to fetch order');
    });
});
