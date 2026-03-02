import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock, factories } from '../helpers/mocks';

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

import { POST } from '@/app/api/products/recommendations/route';
import { NextRequest } from 'next/server';

function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/products/recommendations', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('POST /api/products/recommendations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns empty recommendations when productIds is empty', async () => {
        const response = await POST(createRequest({ productIds: [] }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.recommendations).toEqual([]);
    });

    it('returns empty recommendations when productIds is missing', async () => {
        const response = await POST(createRequest({}));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.recommendations).toEqual([]);
    });

    it('returns empty recommendations when productIds is not an array', async () => {
        const response = await POST(createRequest({ productIds: 'not-an-array' }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.recommendations).toEqual([]);
    });

    it('returns co-occurrence products when orders exist', async () => {
        const cartProduct = factories.product({ id: 'prod-1', categoryId: 'cat-1' });
        const recommendedProduct = factories.product({
            id: 'prod-2',
            name: 'Barramundi',
            slug: 'barramundi',
            categoryId: 'cat-2',
            category: { id: 'cat-2', name: 'Premium Fish', slug: 'premium-fish' },
        });

        // Cart products with their categories
        prismaMock.product.findMany
            // First call: get cart products categories
            .mockResolvedValueOnce([{ categoryId: cartProduct.categoryId }])
            // Second call: featured fallback (different categories)
            .mockResolvedValueOnce([])
            // Third call: co-occurrence products
            .mockResolvedValueOnce([recommendedProduct])
            // Fourth call: featured from same categories
            .mockResolvedValueOnce([]);

        // Order items containing the cart product
        prismaMock.orderItem.findMany
            // First call: find orders containing given products
            .mockResolvedValueOnce([{ orderId: 'order-1' }, { orderId: 'order-2' }])
            // Second call: co-occurring items in those orders
            .mockResolvedValueOnce([
                { productId: 'prod-2' },
                { productId: 'prod-2' },
            ]);

        const response = await POST(createRequest({ productIds: ['prod-1'] }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.recommendations).toHaveLength(1);
        expect(data.recommendations[0].id).toBe('prod-2');
        expect(data.recommendations[0].name).toBe('Barramundi');
    });

    it('falls back to featured products when no co-occurrence data exists', async () => {
        const featuredProduct = factories.product({
            id: 'prod-3',
            name: 'King Prawns',
            slug: 'king-prawns',
            isFeatured: true,
            categoryId: 'cat-2',
            category: { id: 'cat-2', name: 'Shellfish', slug: 'shellfish' },
        });

        // Cart products categories
        prismaMock.product.findMany
            .mockResolvedValueOnce([{ categoryId: 'cat-1' }])
            // Featured fallback (different categories)
            .mockResolvedValueOnce([featuredProduct])
            // Featured from same categories
            .mockResolvedValueOnce([]);

        // No order items found (no co-occurrence data)
        prismaMock.orderItem.findMany.mockResolvedValueOnce([]);

        const response = await POST(createRequest({ productIds: ['prod-1'] }));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.recommendations).toHaveLength(1);
        expect(data.recommendations[0].id).toBe('prod-3');
        expect(data.recommendations[0].name).toBe('King Prawns');
        expect(data.recommendations[0].isFeatured).toBe(true);
    });

    it('serializes product fields correctly', async () => {
        const product = factories.product({
            id: 'prod-4',
            name: 'Tuna Steak',
            slug: 'tuna-steak',
            description: 'Premium tuna steak',
            price: '45.50',
            imageUrls: ['https://example.com/tuna.jpg'],
            unit: 'KG',
            stockQuantity: 20,
            isAvailable: true,
            isFeatured: true,
            isTodaysSpecial: false,
            tags: ['fresh', 'premium'],
            categoryId: 'cat-2',
            category: { id: 'cat-2', name: 'Premium', slug: 'premium' },
        });

        prismaMock.product.findMany
            .mockResolvedValueOnce([{ categoryId: 'cat-1' }])
            .mockResolvedValueOnce([product])
            .mockResolvedValueOnce([]);

        prismaMock.orderItem.findMany.mockResolvedValueOnce([]);

        const response = await POST(createRequest({ productIds: ['prod-1'] }));
        const data = await response.json();

        expect(data.recommendations[0]).toEqual({
            id: 'prod-4',
            name: 'Tuna Steak',
            slug: 'tuna-steak',
            description: 'Premium tuna steak',
            price: '45.5',
            imageUrls: ['https://example.com/tuna.jpg'],
            category: { id: 'cat-2', name: 'Premium', slug: 'premium' },
            unit: 'KG',
            stockQuantity: 20,
            isAvailable: true,
            isFeatured: true,
            isTodaysSpecial: false,
            tags: ['fresh', 'premium'],
        });
    });

    it('returns 500 when an error occurs', async () => {
        prismaMock.product.findMany.mockRejectedValue(new Error('DB error'));

        const response = await POST(createRequest({ productIds: ['prod-1'] }));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ message: 'Failed to fetch recommendations' });
    });
});
