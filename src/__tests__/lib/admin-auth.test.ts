import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
    auth: mockAuth,
}));

import { requireAdmin } from '@/lib/admin-auth';

describe('requireAdmin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 error when session is null (not authenticated)', async () => {
        mockAuth.mockResolvedValue(null);

        const result = await requireAdmin();

        expect(result.error).not.toBeNull();
        expect(result.session).toBeNull();
        const body = await result.error!.json();
        expect(body.message).toBe('Unauthorized');
        expect(result.error!.status).toBe(401);
    });

    it('returns 401 error when session has no user', async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await requireAdmin();

        expect(result.error).not.toBeNull();
        expect(result.session).toBeNull();
        const body = await result.error!.json();
        expect(body.message).toBe('Unauthorized');
        expect(result.error!.status).toBe(401);
    });

    it('returns 403 error when user role is CUSTOMER', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-1', role: 'CUSTOMER', email: 'customer@test.com' },
        });

        const result = await requireAdmin();

        expect(result.error).not.toBeNull();
        expect(result.session).toBeNull();
        const body = await result.error!.json();
        expect(body.message).toBe('Forbidden - Admin access required');
        expect(result.error!.status).toBe(403);
    });

    it('returns 403 error when user role is WHOLESALE', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'user-2', role: 'WHOLESALE', email: 'wholesale@test.com' },
        });

        const result = await requireAdmin();

        expect(result.error).not.toBeNull();
        expect(result.session).toBeNull();
        const body = await result.error!.json();
        expect(body.message).toBe('Forbidden - Admin access required');
        expect(result.error!.status).toBe(403);
    });

    it('returns session with no error when user is ADMIN', async () => {
        const adminSession = {
            user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' },
        };
        mockAuth.mockResolvedValue(adminSession);

        const result = await requireAdmin();

        expect(result.error).toBeNull();
        expect(result.session).toEqual(adminSession);
        expect(result.session!.user.role).toBe('ADMIN');
    });

    it('calls auth() exactly once per invocation', async () => {
        mockAuth.mockResolvedValue({
            user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.com' },
        });

        await requireAdmin();

        expect(mockAuth).toHaveBeenCalledTimes(1);
    });
});
