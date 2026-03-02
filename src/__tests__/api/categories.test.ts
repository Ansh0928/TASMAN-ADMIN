import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock, factories } from '../helpers/mocks';

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

import { GET } from '@/app/api/categories/route';

describe('GET /api/categories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns all categories with correct shape', async () => {
        const categories = [
            factories.category({
                id: 'cat-1',
                name: 'Fish',
                slug: 'fish',
                description: 'Fresh fish',
                imageUrl: 'https://example.com/fish.jpg',
                sortOrder: 1,
            }),
            factories.category({
                id: 'cat-2',
                name: 'Shellfish',
                slug: 'shellfish',
                description: 'Premium shellfish',
                imageUrl: 'https://example.com/shellfish.jpg',
                sortOrder: 2,
            }),
        ];

        prismaMock.category.findMany.mockResolvedValue(categories);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveLength(2);
        expect(data[0]).toEqual({
            id: 'cat-1',
            name: 'Fish',
            slug: 'fish',
            description: 'Fresh fish',
            imageUrl: 'https://example.com/fish.jpg',
            sortOrder: 1,
        });
        expect(data[1]).toEqual({
            id: 'cat-2',
            name: 'Shellfish',
            slug: 'shellfish',
            description: 'Premium shellfish',
            imageUrl: 'https://example.com/shellfish.jpg',
            sortOrder: 2,
        });
        expect(prismaMock.category.findMany).toHaveBeenCalledWith({
            orderBy: { sortOrder: 'asc' },
        });
    });

    it('returns empty array when no categories exist', async () => {
        prismaMock.category.findMany.mockResolvedValue([]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
    });

    it('returns 500 when database throws an error', async () => {
        prismaMock.category.findMany.mockRejectedValue(new Error('DB connection failed'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ message: 'Internal server error' });
    });
});
