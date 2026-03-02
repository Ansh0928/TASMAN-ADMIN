import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSetVapidDetails, mockSendNotification } = vi.hoisted(() => ({
    mockSetVapidDetails: vi.fn(),
    mockSendNotification: vi.fn(),
}));

vi.mock('web-push', () => ({
    default: {
        setVapidDetails: mockSetVapidDetails,
        sendNotification: mockSendNotification,
    },
}));

import { sendPushNotification } from '@/lib/web-push';

describe('sendPushNotification', () => {
    const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
        },
    };

    const mockPayload = {
        title: 'New Order',
        body: 'You have a new order to review',
        url: '/admin/orders',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls webpush.sendNotification with correct subscription and payload', async () => {
        mockSendNotification.mockResolvedValue({});

        await sendPushNotification(mockSubscription, mockPayload);

        expect(mockSendNotification).toHaveBeenCalledTimes(1);
        expect(mockSendNotification).toHaveBeenCalledWith(
            {
                endpoint: mockSubscription.endpoint,
                keys: {
                    p256dh: mockSubscription.keys.p256dh,
                    auth: mockSubscription.keys.auth,
                },
            },
            JSON.stringify(mockPayload)
        );
    });

    it('returns success true when notification is sent successfully', async () => {
        mockSendNotification.mockResolvedValue({});

        const result = await sendPushNotification(mockSubscription, mockPayload);

        expect(result).toEqual({ success: true });
    });

    it('returns success false with error message when sendNotification throws', async () => {
        mockSendNotification.mockRejectedValue(new Error('Push service unavailable'));

        const result = await sendPushNotification(mockSubscription, mockPayload);

        expect(result).toEqual({
            success: false,
            error: 'Push service unavailable',
        });
    });

    it('handles non-Error thrown values gracefully', async () => {
        mockSendNotification.mockRejectedValue('string error');

        const result = await sendPushNotification(mockSubscription, mockPayload);

        expect(result).toEqual({
            success: false,
            error: 'Unknown push error',
        });
    });

    it('sends payload as JSON string', async () => {
        mockSendNotification.mockResolvedValue({});

        const payload = { title: 'Test', body: 'Body text' };
        await sendPushNotification(mockSubscription, payload);

        const sentPayload = mockSendNotification.mock.calls[0][1];
        expect(JSON.parse(sentPayload)).toEqual(payload);
    });

    it('passes url in payload when provided', async () => {
        mockSendNotification.mockResolvedValue({});

        const payloadWithUrl = { title: 'Test', body: 'Body', url: '/some/path' };
        await sendPushNotification(mockSubscription, payloadWithUrl);

        const sentPayload = JSON.parse(mockSendNotification.mock.calls[0][1]);
        expect(sentPayload.url).toBe('/some/path');
    });
});
