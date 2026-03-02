import { describe, it, expect, vi, beforeEach } from 'vitest';
import { s3Mock } from '../helpers/mocks';

const mockRequireAdmin = vi.hoisted(() => vi.fn());

vi.mock('@/lib/admin-auth', () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/s3', () => ({
    generateImageKey: s3Mock.generateImageKey,
    generatePresignedUploadUrl: s3Mock.generatePresignedUploadUrl,
    getPublicUrl: s3Mock.getPublicUrl,
}));

import { POST } from '@/app/api/upload/presign/route';
import { NextRequest } from 'next/server';

function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/upload/presign', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('POST /api/upload/presign', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireAdmin.mockResolvedValue({
            error: null,
            session: { user: { id: 'admin-1', role: 'ADMIN' } },
        });
    });

    it('returns presigned URL for valid request', async () => {
        s3Mock.generateImageKey.mockReturnValue('products/test-image.jpg');
        s3Mock.generatePresignedUploadUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-url');
        s3Mock.getPublicUrl.mockReturnValue('https://test-bucket.s3.us-east-1.amazonaws.com/products/test-image.jpg');

        const response = await POST(
            createRequest({
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
                folder: 'products',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.uploadUrl).toBe('https://s3.amazonaws.com/presigned-url');
        expect(data.publicUrl).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/products/test-image.jpg');
        expect(data.key).toBe('products/test-image.jpg');
        expect(s3Mock.generateImageKey).toHaveBeenCalledWith('products', 'test-image.jpg');
        expect(s3Mock.generatePresignedUploadUrl).toHaveBeenCalledWith('products/test-image.jpg', 'image/jpeg');
        expect(s3Mock.getPublicUrl).toHaveBeenCalledWith('products/test-image.jpg');
    });

    it('rejects non-admin users with 403', async () => {
        mockRequireAdmin.mockResolvedValue({
            error: new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 }),
        });

        const response = await POST(
            createRequest({
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
                folder: 'products',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.message).toBe('Forbidden');
    });

    it('returns 400 when filename is missing', async () => {
        const response = await POST(
            createRequest({
                contentType: 'image/jpeg',
                folder: 'products',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('filename, contentType, and folder are required');
    });

    it('returns 400 when contentType is missing', async () => {
        const response = await POST(
            createRequest({
                filename: 'test-image.jpg',
                folder: 'products',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('filename, contentType, and folder are required');
    });

    it('returns 400 when folder is missing', async () => {
        const response = await POST(
            createRequest({
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('filename, contentType, and folder are required');
    });

    it('rejects invalid file type', async () => {
        const response = await POST(
            createRequest({
                filename: 'document.pdf',
                contentType: 'application/pdf',
                folder: 'products',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('Invalid file type');
    });

    it('accepts all allowed image types', async () => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        for (const contentType of allowedTypes) {
            vi.clearAllMocks();
            mockRequireAdmin.mockResolvedValue({
                error: null,
                session: { user: { id: 'admin-1', role: 'ADMIN' } },
            });
            s3Mock.generateImageKey.mockReturnValue('products/test.jpg');
            s3Mock.generatePresignedUploadUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-url');
            s3Mock.getPublicUrl.mockReturnValue('https://test-bucket.s3.amazonaws.com/products/test.jpg');

            const response = await POST(
                createRequest({
                    filename: 'test.jpg',
                    contentType,
                    folder: 'products',
                })
            );

            expect(response.status).toBe(200);
        }
    });

    it('returns 500 when S3 throws an error', async () => {
        s3Mock.generateImageKey.mockReturnValue('products/test-image.jpg');
        s3Mock.generatePresignedUploadUrl.mockRejectedValue(new Error('S3 error'));

        const response = await POST(
            createRequest({
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
                folder: 'products',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Failed to generate upload URL');
    });
});
