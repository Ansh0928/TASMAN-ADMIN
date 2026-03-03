import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFindMany, mockNotificationCreate, mockEmailsSend, mockSendSMS } = vi.hoisted(() => ({
    mockFindMany: vi.fn(),
    mockNotificationCreate: vi.fn(),
    mockEmailsSend: vi.fn(),
    mockSendSMS: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findMany: mockFindMany,
        },
        notification: {
            create: mockNotificationCreate,
        },
    },
}));

vi.mock('@/lib/resend', () => ({
    resend: {
        emails: {
            send: mockEmailsSend,
        },
    },
    EMAIL_FROM: 'Tasman Star Seafoods <onboarding@resend.dev>',
}));

vi.mock('@/lib/twilio', () => ({
    sendSMS: mockSendSMS,
    wholesalePriceListUpdatedSMS: vi.fn(
        () => 'Tasman Star Seafoods: Our wholesale price list has been updated. Sign in to view the latest prices and today\'s specials.'
    ),
}));

import { notifyWholesalersOfUpdate } from '@/lib/wholesale-notifications';

describe('notifyWholesalersOfUpdate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' } });
        mockSendSMS.mockResolvedValue({ success: true, sid: 'SM_test' });
        mockNotificationCreate.mockResolvedValue({});
    });

    it('queries approved wholesale users with correct filter', async () => {
        mockFindMany.mockResolvedValue([]);

        await notifyWholesalersOfUpdate();

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { role: 'WHOLESALE', wholesaleStatus: 'APPROVED' },
            select: { id: true, name: true, email: true, phone: true },
        });
    });

    it('does nothing when no wholesalers are found', async () => {
        mockFindMany.mockResolvedValue([]);

        await notifyWholesalersOfUpdate();

        expect(mockEmailsSend).not.toHaveBeenCalled();
        expect(mockSendSMS).not.toHaveBeenCalled();
        expect(mockNotificationCreate).not.toHaveBeenCalled();
    });

    it('sends email to each wholesaler', async () => {
        mockFindMany.mockResolvedValue([
            { id: 'u1', name: 'Alice', email: 'alice@test.com', phone: null },
            { id: 'u2', name: 'Bob', email: 'bob@test.com', phone: null },
        ]);

        await notifyWholesalersOfUpdate();

        expect(mockEmailsSend).toHaveBeenCalledTimes(2);
        expect(mockEmailsSend).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'Tasman Star Seafoods <onboarding@resend.dev>',
                to: 'alice@test.com',
                subject: 'Wholesale Price List Updated - Tasman Star Seafoods',
            })
        );
        expect(mockEmailsSend).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'bob@test.com',
            })
        );
    });

    it('sends SMS only to wholesalers with phone numbers', async () => {
        mockFindMany.mockResolvedValue([
            { id: 'u1', name: 'Alice', email: 'alice@test.com', phone: '+61400111222' },
            { id: 'u2', name: 'Bob', email: 'bob@test.com', phone: null },
        ]);

        await notifyWholesalersOfUpdate();

        expect(mockSendSMS).toHaveBeenCalledTimes(1);
        expect(mockSendSMS).toHaveBeenCalledWith(
            '+61400111222',
            expect.stringContaining('price list has been updated')
        );
    });

    it('creates SENT notification records for successful emails', async () => {
        mockFindMany.mockResolvedValue([
            { id: 'u1', name: 'Alice', email: 'alice@test.com', phone: null },
        ]);

        await notifyWholesalersOfUpdate();

        expect(mockNotificationCreate).toHaveBeenCalledWith({
            data: {
                userId: 'u1',
                type: 'EMAIL',
                recipient: 'alice@test.com',
                category: 'wholesale_update',
                status: 'SENT',
            },
        });
    });

    it('creates SENT notification records for successful SMS', async () => {
        mockFindMany.mockResolvedValue([
            { id: 'u1', name: 'Alice', email: 'alice@test.com', phone: '+61400111222' },
        ]);

        await notifyWholesalersOfUpdate();

        expect(mockNotificationCreate).toHaveBeenCalledWith({
            data: {
                userId: 'u1',
                type: 'SMS',
                recipient: '+61400111222',
                category: 'wholesale_update',
                status: 'SENT',
            },
        });
    });

    it('creates FAILED notification record when email fails', async () => {
        mockFindMany.mockResolvedValue([
            { id: 'u1', name: 'Alice', email: 'alice@test.com', phone: null },
        ]);
        mockEmailsSend.mockRejectedValue(new Error('Email service down'));

        await notifyWholesalersOfUpdate();

        expect(mockNotificationCreate).toHaveBeenCalledWith({
            data: {
                userId: 'u1',
                type: 'EMAIL',
                recipient: 'alice@test.com',
                category: 'wholesale_update',
                status: 'FAILED',
            },
        });
    });

    it('creates FAILED notification record when SMS fails', async () => {
        mockFindMany.mockResolvedValue([
            { id: 'u1', name: 'Alice', email: 'alice@test.com', phone: '+61400111222' },
        ]);
        mockSendSMS.mockRejectedValue(new Error('SMS service down'));

        await notifyWholesalersOfUpdate();

        expect(mockNotificationCreate).toHaveBeenCalledWith({
            data: {
                userId: 'u1',
                type: 'SMS',
                recipient: '+61400111222',
                category: 'wholesale_update',
                status: 'FAILED',
            },
        });
    });
});
