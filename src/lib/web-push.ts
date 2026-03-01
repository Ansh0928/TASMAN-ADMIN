import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:info@tasmanstar.com.au',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

interface PushPayload {
    title: string;
    body: string;
    url?: string;
}

export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn('VAPID keys not configured — skipping push notification');
        return { success: false, error: 'VAPID keys not configured' };
    }

    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
            },
            JSON.stringify(payload)
        );
        return { success: true };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown push error';
        console.error('Push notification failed:', message);
        return { success: false, error: message };
    }
}
