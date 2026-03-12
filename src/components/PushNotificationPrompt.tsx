'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

type PromptState = 'idle' | 'subscribing' | 'success' | 'error' | 'dismissed' | 'unsupported';

const DISMISSED_KEY = 'push-notification-dismissed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationPrompt() {
    const [state, setState] = useState<PromptState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Check if push is supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setState('unsupported');
            return;
        }

        // Check if already dismissed
        if (localStorage.getItem(DISMISSED_KEY) === 'true') {
            setState('dismissed');
            return;
        }

        // Check if already subscribed
        navigator.serviceWorker.ready.then((registration) => {
            registration.pushManager.getSubscription().then((subscription) => {
                if (subscription) {
                    setState('dismissed');
                }
            });
        });
    }, []);

    const handleSubscribe = async () => {
        setState('subscribing');
        setErrorMessage('');

        try {
            // 1. Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // 2. Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setState('error');
                setErrorMessage('Notification permission was denied.');
                return;
            }

            // 3. Subscribe to push
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                setState('error');
                setErrorMessage('Push notification configuration is missing.');
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
            });

            const subscriptionJSON = subscription.toJSON();

            // 4. Send subscription to server
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: subscriptionJSON.endpoint,
                    keys: {
                        p256dh: subscriptionJSON.keys?.p256dh,
                        auth: subscriptionJSON.keys?.auth,
                    },
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to save subscription on server');
            }

            // 5. Success
            setState('success');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setState('error');
            setErrorMessage(message);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, 'true');
        setState('dismissed');
    };

    // Don't render if unsupported, dismissed, or already subscribed
    if (state === 'unsupported' || state === 'dismissed') {
        return null;
    }

    // Success state — show briefly then hide
    if (state === 'success') {
        return (
            <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <p className="text-green-400 text-sm font-medium">
                    Push notifications enabled! We will notify you about order updates.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 bg-theme-secondary border border-theme-border rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <Bell size={20} className="text-theme-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-text">
                        Get order updates
                    </p>
                    <p className="text-xs text-theme-text-muted mt-1">
                        Enable push notifications to receive real-time updates on your order status.
                    </p>

                    {state === 'error' && errorMessage && (
                        <p className="text-xs text-red-400 mt-2">{errorMessage}</p>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                        <button
                            onClick={handleSubscribe}
                            disabled={state === 'subscribing'}
                            className="px-4 py-1.5 bg-theme-accent text-white text-sm rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {state === 'subscribing' ? 'Enabling...' : 'Enable Notifications'}
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="text-xs text-theme-text-muted hover:text-theme-text transition-colors"
                        >
                            No thanks
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-theme-text-muted hover:text-theme-text transition-colors"
                    aria-label="Dismiss notification prompt"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
