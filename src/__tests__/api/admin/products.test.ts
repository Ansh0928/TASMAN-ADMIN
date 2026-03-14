import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { prismaMock, factories, createMockRequest } from '../../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('next/cache', () => ({
    revalidateTag: vi.fn(),
    unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}));

import { GET, POST } from '@/app/api/admin/products/route';
import {
    GET as GET_BY_ID,
    PUT,
    DELETE,
} from '@/app/api/admin/products/[id]/route';

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

describe('Admin Products API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── Auth guard ──

    describe('auth guard', () => {
        it('GET /api/admin/products rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('GET');
            const res = await GET(req as any);
            expect(res.status).toBe(403);
        });

        it('POST /api/admin/products rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('POST', { name: 'Test', price: '10', categoryIds: ['cat-1'], primaryCategoryId: 'cat-1' });
            const res = await POST(req as any);
            expect(res.status).toBe(403);
        });

        it('GET /api/admin/products/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('GET');
            const res = await GET_BY_ID(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            expect(res.status).toBe(403);
        });

        it('PUT /api/admin/products/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('PUT', { name: 'Updated' });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            expect(res.status).toBe(403);
        });

        it('DELETE /api/admin/products/[id] rejects non-admin', async () => {
            adminForbidden();
            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            expect(res.status).toBe(403);
        });
    });

    // ── GET /api/admin/products ──

    describe('GET /api/admin/products', () => {
        it('lists products with pagination', async () => {
            adminOk();
            const product = factories.product({
                price: { toString: () => '29.99' },
            });
            prismaMock.product.findMany.mockResolvedValue([product]);
            prismaMock.product.count.mockResolvedValue(1);

            const req = createMockRequest('GET', undefined, { page: '1', limit: '20' });
            const res = await GET(req as any);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.products).toHaveLength(1);
            expect(data.products[0].name).toBe('Atlantic Salmon');
            expect(data.pagination).toEqual({
                page: 1,
                limit: 20,
                total: 1,
                pages: 1,
            });
        });

        it('supports search parameter', async () => {
            adminOk();
            prismaMock.product.findMany.mockResolvedValue([]);
            prismaMock.product.count.mockResolvedValue(0);

            const req = createMockRequest('GET', undefined, { search: 'salmon' });
            await GET(req as any);

            expect(prismaMock.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { name: { contains: 'salmon', mode: 'insensitive' } },
                            { slug: { contains: 'salmon', mode: 'insensitive' } },
                        ],
                    },
                })
            );
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.product.findMany.mockRejectedValue(new Error('DB error'));
            prismaMock.product.count.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('GET');
            const res = await GET(req as any);
            expect(res.status).toBe(500);
        });
    });

    // ── POST /api/admin/products ──

    describe('POST /api/admin/products', () => {
        it('creates a new product', async () => {
            adminOk();
            prismaMock.product.findUnique.mockResolvedValue(null); // slug not taken
            const created = factories.product();
            prismaMock.product.create.mockResolvedValue(created);
            prismaMock.productCategory.createMany.mockResolvedValue({ count: 1 });

            const req = createMockRequest('POST', {
                name: 'Atlantic Salmon',
                price: '29.99',
                categoryIds: ['cat-1'],
                primaryCategoryId: 'cat-1',
                description: 'Fresh Atlantic Salmon',
                imageUrls: ['https://example.com/salmon.jpg'],
                stockQuantity: 50,
                unit: 'KG',
                isAvailable: true,
                isFeatured: false,
                isTodaysSpecial: false,
                tags: ['fresh', 'popular'],
            });

            const res = await POST(req as any);
            const data = await res.json();

            expect(res.status).toBe(201);
            expect(data.product).toBeDefined();
            expect(prismaMock.product.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: 'Atlantic Salmon',
                        slug: 'atlantic-salmon',
                        price: 29.99,
                    }),
                })
            );
        });

        it('generates a unique slug when slug already exists', async () => {
            adminOk();
            prismaMock.product.findUnique.mockResolvedValue(factories.product()); // slug taken
            prismaMock.product.create.mockResolvedValue(factories.product());
            prismaMock.productCategory.createMany.mockResolvedValue({ count: 1 });

            const req = createMockRequest('POST', {
                name: 'Atlantic Salmon',
                price: '29.99',
                categoryIds: ['cat-1'],
                primaryCategoryId: 'cat-1',
            });

            await POST(req as any);

            expect(prismaMock.product.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        slug: expect.stringMatching(/^atlantic-salmon-\d+$/),
                    }),
                })
            );
        });

        it('returns 400 when name is missing', async () => {
            adminOk();
            const req = createMockRequest('POST', { price: '10', categoryIds: ['cat-1'], primaryCategoryId: 'cat-1' });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toMatch(/required/i);
        });

        it('returns 400 when price is missing', async () => {
            adminOk();
            const req = createMockRequest('POST', { name: 'Test', categoryIds: ['cat-1'], primaryCategoryId: 'cat-1' });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });

        it('returns 400 when categoryIds is missing', async () => {
            adminOk();
            const req = createMockRequest('POST', { name: 'Test', price: '10' });
            const res = await POST(req as any);
            expect(res.status).toBe(400);
        });
    });

    // ── GET /api/admin/products/[id] ──

    describe('GET /api/admin/products/[id]', () => {
        it('returns single product', async () => {
            adminOk();
            const product = factories.product({
                price: { toString: () => '29.99' },
            });
            prismaMock.product.findUnique.mockResolvedValue(product);

            const req = createMockRequest('GET');
            const res = await GET_BY_ID(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.id).toBe('prod-1');
            expect(data.name).toBe('Atlantic Salmon');
            expect(data.price).toBe('29.99');
            expect(data.relatedProductIds).toEqual([]);
        });

        it('returns 404 when product not found', async () => {
            adminOk();
            prismaMock.product.findUnique.mockResolvedValue(null);

            const req = createMockRequest('GET');
            const res = await GET_BY_ID(req as any, { params: Promise.resolve({ id: 'nonexistent' }) });
            expect(res.status).toBe(404);
        });
    });

    // ── PUT /api/admin/products/[id] ──

    describe('PUT /api/admin/products/[id]', () => {
        it('updates product fields', async () => {
            adminOk();
            const updated = factories.product({ name: 'Updated Salmon' });
            prismaMock.product.update.mockResolvedValue(updated);

            const req = createMockRequest('PUT', { name: 'Updated Salmon', price: '35.99' });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.product).toBeDefined();
            expect(prismaMock.product.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'prod-1' },
                    data: expect.objectContaining({
                        name: 'Updated Salmon',
                        price: 35.99,
                    }),
                })
            );
        });

        it('updates relatedProductIds', async () => {
            adminOk();
            const updated = factories.product({ relatedProductIds: ['prod-2', 'prod-3'] });
            prismaMock.product.update.mockResolvedValue(updated);

            const req = createMockRequest('PUT', { relatedProductIds: ['prod-2', 'prod-3'] });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'prod-1' }) });

            expect(res.status).toBe(200);
            expect(prismaMock.product.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        relatedProductIds: ['prod-2', 'prod-3'],
                    }),
                })
            );
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.product.update.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('PUT', { name: 'Fail' });
            const res = await PUT(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            expect(res.status).toBe(500);
        });
    });

    // ── DELETE /api/admin/products/[id] ──

    describe('DELETE /api/admin/products/[id]', () => {
        it('deletes a product', async () => {
            adminOk();
            prismaMock.product.delete.mockResolvedValue(factories.product());

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.message).toBe('Product deleted');
            expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
        });

        it('returns 500 on database error', async () => {
            adminOk();
            prismaMock.product.delete.mockRejectedValue(new Error('DB error'));

            const req = createMockRequest('DELETE');
            const res = await DELETE(req as any, { params: Promise.resolve({ id: 'prod-1' }) });
            expect(res.status).toBe(500);
        });
    });
});
