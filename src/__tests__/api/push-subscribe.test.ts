import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock, factories } from '../helpers/mocks';

const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/auth', () => ({
    auth: mockAuth,
}));

import { POST } from '@/app/api/push/subscribe/route';
import { NextRequest } from 'next/server';

function createRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

const authenticatedSession = {
    user: { id: 'user-1', email: 'test@test.com', role: 'CUSTOMER' },
};

describe('POST /api/push/subscribe', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default: authenticated (M-7: auth required)
        mockAuth.mockResolvedValue(authenticatedSession);
    });

    it('returns 401 for unauthenticated users', async () => {
        mockAuth.mockResolvedValue(null);

        const response = await POST(
            createRequest({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                keys: {
                    p256dh: 'test-p256dh-key',
                    auth: 'test-auth-key',
                },
            })
        );
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.message).toBe('Authentication required for push notifications');
    });

    it('saves push subscription for authenticated user', async () => {
        const subscription = factories.pushSubscription({ userId: 'user-1' });
        prismaMock.pushSubscription.upsert.mockResolvedValue(subscription);

        const response = await POST(
            createRequest({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                keys: {
                    p256dh: 'test-p256dh-key',
                    auth: 'test-auth-key',
                },
            })
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.id).toBe(subscription.id);
        expect(prismaMock.pushSubscription.upsert).toHaveBeenCalledWith({
            where: { endpoint: 'https://fcm.googleapis.com/fcm/send/test' },
            update: {
                p256dh: 'test-p256dh-key',
                auth: 'test-auth-key',
                userId: 'user-1',
            },
            create: {
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                p256dh: 'test-p256dh-key',
                auth: 'test-auth-key',
                userId: 'user-1',
            },
        });
    });

    it('returns 400 when endpoint is missing', async () => {
        const response = await POST(
            createRequest({
                keys: { p256dh: 'test-p256dh-key', auth: 'test-auth-key' },
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('Missing required subscription fields');
    });

    it('returns 400 when keys.p256dh is missing', async () => {
        const response = await POST(
            createRequest({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                keys: { auth: 'test-auth-key' },
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('Missing required subscription fields');
    });

    it('returns 400 when keys.auth is missing', async () => {
        const response = await POST(
            createRequest({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                keys: { p256dh: 'test-p256dh-key' },
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('Missing required subscription fields');
    });

    it('returns 400 when keys object is missing entirely', async () => {
        const response = await POST(
            createRequest({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('Missing required subscription fields');
    });

    it('returns 500 when database throws an error', async () => {
        prismaMock.pushSubscription.upsert.mockRejectedValue(new Error('DB error'));

        const response = await POST(
            createRequest({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                keys: {
                    p256dh: 'test-p256dh-key',
                    auth: 'test-auth-key',
                },
            })
        );
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Failed to save push subscription');
    });
});
