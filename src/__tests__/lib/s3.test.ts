import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSend, mockGetSignedUrl } = vi.hoisted(() => ({
    mockSend: vi.fn(),
    mockGetSignedUrl: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => {
    return {
        S3Client: vi.fn().mockImplementation(function () {
            return { send: mockSend };
        }),
        PutObjectCommand: vi.fn().mockImplementation(function (this: any, input: any) { Object.assign(this, input); this._type = 'PutObjectCommand'; }),
        DeleteObjectCommand: vi.fn().mockImplementation(function (this: any, input: any) { Object.assign(this, input); this._type = 'DeleteObjectCommand'; }),
    };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: mockGetSignedUrl,
}));

import {
    generateImageKey,
    generatePresignedUploadUrl,
    deleteObject,
    getPublicUrl,
} from '@/lib/s3';

describe('S3 utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateImageKey', () => {
        it('generates a key with folder, timestamp, and sanitized filename', () => {
            const key = generateImageKey('products', 'my image (1).jpg');

            expect(key).toMatch(/^products\/\d+-my-image--1-.jpg$/);
        });

        it('preserves valid characters in filename', () => {
            const key = generateImageKey('categories', 'salmon-fillet.png');

            expect(key).toMatch(/^categories\/\d+-salmon-fillet.png$/);
        });

        it('uses the specified folder prefix', () => {
            const key = generateImageKey('banners', 'hero.webp');

            expect(key).toMatch(/^banners\//);
        });

        it('sanitizes special characters to hyphens', () => {
            const key = generateImageKey('products', 'fish & chips @special!.jpg');

            // All special chars like &, @, !, spaces should be replaced with hyphens
            expect(key).not.toContain('&');
            expect(key).not.toContain('@');
            expect(key).not.toContain('!');
            expect(key).not.toContain(' ');
        });
    });

    describe('getPublicUrl', () => {
        it('returns the correct S3 URL format', () => {
            const url = getPublicUrl('products/12345-salmon.jpg');

            expect(url).toBe(
                'https://test-bucket.s3.us-east-1.amazonaws.com/products/12345-salmon.jpg'
            );
        });

        it('includes the bucket name and region from env', () => {
            const url = getPublicUrl('some-key');

            expect(url).toContain('test-bucket');
            expect(url).toContain('us-east-1');
        });
    });

    describe('generatePresignedUploadUrl', () => {
        it('calls getSignedUrl with PutObjectCommand and correct parameters', async () => {
            mockGetSignedUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-url');

            const result = await generatePresignedUploadUrl(
                'products/test.jpg',
                'image/jpeg'
            );

            expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
            const [, command, options] = mockGetSignedUrl.mock.calls[0];
            expect(command).toMatchObject({
                Bucket: 'test-bucket',
                Key: 'products/test.jpg',
                ContentType: 'image/jpeg',
            });
            expect(options).toEqual({ expiresIn: 300 });
            expect(result).toBe('https://s3.amazonaws.com/presigned-url');
        });
    });

    describe('deleteObject', () => {
        it('sends a DeleteObjectCommand with correct bucket and key', async () => {
            mockSend.mockResolvedValue({});

            await deleteObject('products/old-image.jpg');

            expect(mockSend).toHaveBeenCalledTimes(1);
            const command = mockSend.mock.calls[0][0];
            expect(command).toMatchObject({
                Bucket: 'test-bucket',
                Key: 'products/old-image.jpg',
            });
        });
    });
});
