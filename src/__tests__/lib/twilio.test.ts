import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('twilio', () => {
    return {
        default: vi.fn(() => ({
            messages: {
                create: mockCreate,
            },
        })),
    };
});

import {
    sendSMS,
    sendOrderStatusSMS,
    wholesaleApplicationReceivedSMS,
    wholesaleApprovedSMS,
    wholesaleRejectedSMS,
    wholesalePriceListUpdatedSMS,
} from '@/lib/twilio';

describe('Twilio SMS templates', () => {
    it('wholesaleApplicationReceivedSMS includes the user name', () => {
        const result = wholesaleApplicationReceivedSMS('John');
        expect(result).toContain('Hi John');
        expect(result).toContain('wholesale application');
        expect(result).toContain('1-2 business days');
    });

    it('wholesaleApprovedSMS includes the user name and approval message', () => {
        const result = wholesaleApprovedSMS('Jane');
        expect(result).toContain('Great news Jane');
        expect(result).toContain('approved');
        expect(result).toContain('wholesale portal');
    });

    it('wholesaleRejectedSMS includes the user name and rejection message', () => {
        const result = wholesaleRejectedSMS('Bob');
        expect(result).toContain('Hi Bob');
        expect(result).toContain("couldn't approve");
        expect(result).toContain('info@tasmanstar.com.au');
    });

    it('wholesalePriceListUpdatedSMS returns the update notification', () => {
        const result = wholesalePriceListUpdatedSMS();
        expect(result).toContain('price list has been updated');
        expect(result).toContain('Tasman Star Seafoods');
    });
});

describe('sendSMS', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls Twilio messages.create with correct parameters', async () => {
        mockCreate.mockResolvedValue({ sid: 'SM_test_123' });

        const result = await sendSMS('+61400000000', 'Test message');

        expect(mockCreate).toHaveBeenCalledWith({
            to: '+61400000000',
            from: process.env.TWILIO_PHONE_NUMBER,
            body: 'Test message',
        });
        expect(result).toEqual({ success: true, sid: 'SM_test_123' });
    });

    it('returns success false when Twilio throws an error', async () => {
        const error = new Error('Twilio API error');
        mockCreate.mockRejectedValue(error);

        const result = await sendSMS('+61400000000', 'Test message');

        expect(result.success).toBe(false);
        expect(result.error).toBe(error);
    });

    it('returns success false when TWILIO_PHONE_NUMBER is not set', async () => {
        const originalPhone = process.env.TWILIO_PHONE_NUMBER;
        delete process.env.TWILIO_PHONE_NUMBER;

        const result = await sendSMS('+61400000000', 'Test message');

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);

        process.env.TWILIO_PHONE_NUMBER = originalPhone;
    });
});

describe('sendOrderStatusSMS', () => {
    const orderId = 'order-abcd1234';

    it('returns correct message for PREPARING', () => {
        const result = sendOrderStatusSMS(orderId, 'PREPARING', 'DELIVERY');
        expect(result).toContain('ABCD1234');
        expect(result).toContain('being prepared');
    });

    it('returns pickup message for READY + PICKUP', () => {
        const result = sendOrderStatusSMS(orderId, 'READY', 'PICKUP');
        expect(result).toContain('ABCD1234');
        expect(result).toContain('ready for pickup');
        expect(result).toContain('213 Brisbane Rd');
    });

    it('returns delivery message for READY + DELIVERY', () => {
        const result = sendOrderStatusSMS(orderId, 'READY', 'DELIVERY');
        expect(result).toContain('ABCD1234');
        expect(result).toContain('out for delivery');
    });

    it('returns correct message for DELIVERED', () => {
        const result = sendOrderStatusSMS(orderId, 'DELIVERED', 'DELIVERY');
        expect(result).toContain('ABCD1234');
        expect(result).toContain('delivered');
        expect(result).toContain('Enjoy');
    });

    it('returns correct message for CANCELLED', () => {
        const result = sendOrderStatusSMS(orderId, 'CANCELLED', 'DELIVERY');
        expect(result).toContain('ABCD1234');
        expect(result).toContain('cancelled');
        expect(result).toContain('info@tasmanstar.com.au');
    });
});
