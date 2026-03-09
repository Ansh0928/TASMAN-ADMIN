import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// We need to import the component after setting up mocks
import PushNotificationPrompt from '@/components/PushNotificationPrompt';

const DISMISSED_KEY = 'push-notification-dismissed';

// Helper to set up browser APIs for push support
function setupPushSupport(options: {
    supported?: boolean;
    existingSubscription?: boolean;
    permissionResult?: NotificationPermission;
} = {}) {
    const {
        supported = true,
        existingSubscription = false,
        permissionResult = 'granted',
    } = options;

    const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/test',
        toJSON: () => ({
            endpoint: 'https://fcm.googleapis.com/test',
            keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
        }),
    };

    const mockPushManager = {
        getSubscription: vi.fn().mockResolvedValue(existingSubscription ? mockSubscription : null),
        subscribe: vi.fn().mockResolvedValue(mockSubscription),
    };

    const mockRegistration = {
        pushManager: mockPushManager,
    };

    if (supported) {
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                register: vi.fn().mockResolvedValue(mockRegistration),
                ready: Promise.resolve(mockRegistration),
            },
            writable: true,
            configurable: true,
        });

        Object.defineProperty(window, 'PushManager', {
            value: vi.fn(),
            writable: true,
            configurable: true,
        });

        Object.defineProperty(window, 'Notification', {
            value: {
                requestPermission: vi.fn().mockResolvedValue(permissionResult),
                permission: 'default',
            },
            writable: true,
            configurable: true,
        });
    } else {
        // Delete properties so 'in' operator returns false
        // @ts-expect-error - deleting browser API for test
        delete navigator.serviceWorker;
        delete (window as any).PushManager;
    }

    return { mockRegistration, mockPushManager, mockSubscription };
}

describe('PushNotificationPrompt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    });

    afterEach(() => {
        // Clean up global overrides
        vi.unstubAllGlobals();
    });

    it('renders nothing if push not supported (no serviceWorker)', async () => {
        setupPushSupport({ supported: false });

        const { container } = render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(container.innerHTML).toBe('');
        });
    });

    it('renders nothing if already dismissed', async () => {
        setupPushSupport({ supported: true });
        localStorage.setItem(DISMISSED_KEY, 'true');

        const { container } = render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(container.innerHTML).toBe('');
        });
    });

    it('renders nothing if already subscribed', async () => {
        setupPushSupport({ supported: true, existingSubscription: true });

        const { container } = render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(container.innerHTML).toBe('');
        });
    });

    it('shows enable notifications button', async () => {
        setupPushSupport({ supported: true });

        render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
        });

        expect(screen.getByText('Get order updates')).toBeInTheDocument();
        expect(screen.getByText('No thanks')).toBeInTheDocument();
    });

    it('dismiss button hides component and sets localStorage', async () => {
        setupPushSupport({ supported: true });
        const user = userEvent.setup();

        render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(screen.getByText('No thanks')).toBeInTheDocument();
        });

        await user.click(screen.getByText('No thanks'));

        expect(localStorage.getItem(DISMISSED_KEY)).toBe('true');

        await waitFor(() => {
            expect(screen.queryByText('Enable Notifications')).not.toBeInTheDocument();
        });
    });

    it('X dismiss button hides component and sets localStorage', async () => {
        setupPushSupport({ supported: true });
        const user = userEvent.setup();

        render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(screen.getByLabelText('Dismiss notification prompt')).toBeInTheDocument();
        });

        await user.click(screen.getByLabelText('Dismiss notification prompt'));

        expect(localStorage.getItem(DISMISSED_KEY)).toBe('true');

        await waitFor(() => {
            expect(screen.queryByText('Enable Notifications')).not.toBeInTheDocument();
        });
    });

    it('shows error when permission denied', async () => {
        setupPushSupport({ supported: true, permissionResult: 'denied' });
        const user = userEvent.setup();

        render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Enable Notifications'));

        await waitFor(() => {
            expect(screen.getByText('Notification permission was denied.')).toBeInTheDocument();
        });
    });

    it('shows success message after subscribing', async () => {
        setupPushSupport({ supported: true, permissionResult: 'granted' });
        const user = userEvent.setup();

        render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Enable Notifications'));

        await waitFor(() => {
            expect(
                screen.getByText('Push notifications enabled! We will notify you about order updates.')
            ).toBeInTheDocument();
        });
    });

    it('shows Enabling... text while subscribing', async () => {
        setupPushSupport({ supported: true, permissionResult: 'granted' });

        // Make the registration slow so we can observe the intermediate state
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                register: vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
                ready: new Promise(() => {}), // never resolves
            },
            writable: true,
            configurable: true,
        });

        const user = userEvent.setup();

        render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Enable Notifications'));

        expect(screen.getByText('Enabling...')).toBeInTheDocument();
    });

    it('sends subscription data to server', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal('fetch', mockFetch);

        setupPushSupport({ supported: true, permissionResult: 'granted' });
        const user = userEvent.setup();

        render(<PushNotificationPrompt />);

        await waitFor(() => {
            expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Enable Notifications'));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: 'https://fcm.googleapis.com/test',
                    keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
                }),
            });
        });
    });
});
