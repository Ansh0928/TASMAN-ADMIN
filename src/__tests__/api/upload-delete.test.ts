import { describe, it, expect, vi, beforeEach } from 'vitest';
import { s3Mock } from '../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/s3', () => ({
    deleteObject: s3Mock.deleteObject,
}));

import { POST } from '@/app/api/upload/delete/route';
import { NextRequest } from 'next/server';

function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/upload/delete', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('POST /api/upload/delete', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireAdmin.mockResolvedValue({
            error: null,
            session: { user: { id: 'admin-1', role: 'ADMIN' } },
        });
    });

    it('deletes image from S3 successfully', async () => {
        s3Mock.deleteObject.mockResolvedValue(undefined);

        const response = await POST(
            createRequest({ key: 'products/test-image.jpg' })
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(s3Mock.deleteObject).toHaveBeenCalledWith('products/test-image.jpg');
    });

    it('rejects non-admin users with 403', async () => {
        mockRequireAdmin.mockResolvedValue({
            error: new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 }),
        });

        const response = await POST(
            createRequest({ key: 'products/test-image.jpg' })
        );
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.message).toBe('Forbidden');
        expect(s3Mock.deleteObject).not.toHaveBeenCalled();
    });

    it('returns 400 when key is missing', async () => {
        const response = await POST(createRequest({}));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('key is required');
    });

    it('returns 400 when key is empty string', async () => {
        const response = await POST(createRequest({ key: '' }));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('key is required');
    });

    it('returns 500 when S3 delete fails', async () => {
        s3Mock.deleteObject.mockRejectedValue(new Error('S3 delete error'));

        const response = await POST(
            createRequest({ key: 'products/test-image.jpg' })
        );
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Failed to delete image');
    });
});
