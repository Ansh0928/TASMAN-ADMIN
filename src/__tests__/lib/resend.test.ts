import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockEmailsSend } = vi.hoisted(() => ({
    mockEmailsSend: vi.fn(),
}));

vi.mock('resend', () => ({
    Resend: vi.fn().mockImplementation(function () {
        return {
            emails: {
                send: mockEmailsSend,
            },
        };
    }),
}));

import {
    sendOrderConfirmationEmail,
    sendOrderStatusEmail,
    sendRefundNotificationEmail,
    sendPaymentFailureEmail,
    sendWholesaleApplicationReceivedEmail,
    sendWholesaleNewApplicationAdminEmail,
    sendWholesaleStatusEmail,
} from '@/lib/resend';

describe('Resend email functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockEmailsSend.mockResolvedValue({ data: { id: 'email-test-123' } });
    });

    describe('sendOrderConfirmationEmail', () => {
        const orderData = {
            orderId: 'order-abc12345',
            customerName: 'John Doe',
            customerEmail: 'john@test.com',
            items: [
                {
                    product: { name: 'Atlantic Salmon' },
                    quantity: 2,
                    unitPrice: '29.99',
                    total: '59.98',
                },
            ],
            subtotal: '59.98',
            deliveryFee: '10.00',
            tax: '7.00',
            total: '76.98',
            fulfillment: 'DELIVERY',
            deliveryStreet: '123 Test St',
            deliveryCity: 'Gold Coast',
            deliveryState: 'QLD',
            deliveryPostcode: '4217',
        };

        it('sends email with correct from, to, and subject', async () => {
            await sendOrderConfirmationEmail(orderData);

            expect(mockEmailsSend).toHaveBeenCalledTimes(1);
            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.from).toBe('Tasman Star Seafoods <onboarding@resend.dev>');
            expect(call.to).toBe('john@test.com');
            expect(call.subject).toContain('Order Confirmation');
            expect(call.subject).toContain('ABC12345');
        });

        it('includes order items in the HTML body', async () => {
            await sendOrderConfirmationEmail(orderData);

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.html).toContain('Atlantic Salmon');
            expect(call.html).toContain('$59.98');
        });

        it('includes delivery address for DELIVERY fulfillment', async () => {
            await sendOrderConfirmationEmail(orderData);

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.html).toContain('123 Test St');
            expect(call.html).toContain('Gold Coast');
        });

        it('includes pickup info for PICKUP fulfillment', async () => {
            await sendOrderConfirmationEmail({ ...orderData, fulfillment: 'PICKUP' });

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.html).toContain('Pickup');
            expect(call.html).toContain('ready for pickup');
        });

        it('returns success true with email id on success', async () => {
            const result = await sendOrderConfirmationEmail(orderData);

            expect(result).toEqual({ success: true, id: 'email-test-123' });
        });

        it('returns success false on error', async () => {
            mockEmailsSend.mockRejectedValue(new Error('Send failed'));

            const result = await sendOrderConfirmationEmail(orderData);

            expect(result.success).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
        });
    });

    describe('sendWholesaleApplicationReceivedEmail', () => {
        const appData = {
            name: 'Jane Smith',
            email: 'jane@business.com',
            companyName: 'Fish Co.',
            abn: '12345678901',
        };

        it('sends email with correct subject and recipient', async () => {
            await sendWholesaleApplicationReceivedEmail(appData);

            expect(mockEmailsSend).toHaveBeenCalledTimes(1);
            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.from).toBe('Tasman Star Seafoods <onboarding@resend.dev>');
            expect(call.to).toBe('jane@business.com');
            expect(call.subject).toBe('Application Received - Tasman Star Seafoods');
        });

        it('includes applicant details in HTML', async () => {
            await sendWholesaleApplicationReceivedEmail(appData);

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.html).toContain('Jane Smith');
            expect(call.html).toContain('Fish Co.');
            expect(call.html).toContain('12345678901');
        });

        it('returns success true on success', async () => {
            const result = await sendWholesaleApplicationReceivedEmail(appData);

            expect(result).toEqual({ success: true, id: 'email-test-123' });
        });
    });

    describe('sendWholesaleNewApplicationAdminEmail', () => {
        const adminData = {
            name: 'Jane Smith',
            email: 'jane@business.com',
            phone: '+61400000000',
            companyName: 'Fish Co.',
            abn: '12345678901',
        };

        it('sends email to the admin address', async () => {
            await sendWholesaleNewApplicationAdminEmail(adminData);

            expect(mockEmailsSend).toHaveBeenCalledTimes(1);
            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.to).toBe('techsupport@tasmanstarseafood.com');
            expect(call.subject).toContain('New Wholesale Application');
            expect(call.subject).toContain('Fish Co.');
        });

        it('includes all applicant details in the HTML body', async () => {
            await sendWholesaleNewApplicationAdminEmail(adminData);

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.html).toContain('Jane Smith');
            expect(call.html).toContain('Fish Co.');
            expect(call.html).toContain('12345678901');
            expect(call.html).toContain('+61400000000');
        });
    });

    describe('sendWholesaleStatusEmail', () => {
        it('sends approval email with correct subject', async () => {
            await sendWholesaleStatusEmail({
                name: 'Alice',
                email: 'alice@test.com',
                status: 'APPROVED',
                companyName: 'Alice Seafood',
            });

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.to).toBe('alice@test.com');
            expect(call.subject).toBe('Wholesale Access Approved - Tasman Star Seafoods');
            expect(call.html).toContain('approved');
        });

        it('sends rejection email with correct subject', async () => {
            await sendWholesaleStatusEmail({
                name: 'Bob',
                email: 'bob@test.com',
                status: 'REJECTED',
                companyName: 'Bob Fish',
            });

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.to).toBe('bob@test.com');
            expect(call.subject).toBe('Wholesale Application Update - Tasman Star Seafoods');
            expect(call.html).toContain('unable to approve');
        });

        it('returns success false on error', async () => {
            mockEmailsSend.mockRejectedValue(new Error('Send failed'));

            const result = await sendWholesaleStatusEmail({
                name: 'Alice',
                email: 'alice@test.com',
                status: 'APPROVED',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
        });
    });

    describe('sendOrderStatusEmail', () => {
        it('sends PREPARING email with correct subject and recipient', async () => {
            await sendOrderStatusEmail({
                orderId: 'order-abcd1234',
                customerName: 'John',
                customerEmail: 'john@test.com',
                status: 'PREPARING',
                fulfillment: 'DELIVERY',
            });

            expect(mockEmailsSend).toHaveBeenCalledTimes(1);
            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.to).toBe('john@test.com');
            expect(call.subject).toContain('Order Update');
            expect(call.subject).toContain('ABCD1234');
            expect(call.html).toContain('preparing');
        });

        it('sends CANCELLED email with correct subject', async () => {
            await sendOrderStatusEmail({
                orderId: 'order-abcd1234',
                customerName: 'John',
                customerEmail: 'john@test.com',
                status: 'CANCELLED',
                fulfillment: 'DELIVERY',
            });

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.subject).toContain('cancelled');
        });

        it('returns error for unknown status', async () => {
            const result = await sendOrderStatusEmail({
                orderId: 'order-1',
                customerName: 'John',
                customerEmail: 'john@test.com',
                status: 'UNKNOWN' as any,
                fulfillment: 'DELIVERY',
            });

            expect(result.success).toBe(false);
            expect(mockEmailsSend).not.toHaveBeenCalled();
        });
    });

    describe('sendRefundNotificationEmail', () => {
        it('sends full refund email with correct subject', async () => {
            await sendRefundNotificationEmail({
                orderId: 'order-abcd1234',
                customerName: 'Jane',
                customerEmail: 'jane@test.com',
                refundAmount: '50.00',
                isFullRefund: true,
            });

            expect(mockEmailsSend).toHaveBeenCalledTimes(1);
            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.to).toBe('jane@test.com');
            expect(call.subject).toContain('Refund Processed');
            expect(call.subject).toContain('ABCD1234');
            expect(call.html).toContain('Full Refund');
            expect(call.html).toContain('$50.00');
        });

        it('sends partial refund email', async () => {
            await sendRefundNotificationEmail({
                orderId: 'order-abcd1234',
                customerName: 'Jane',
                customerEmail: 'jane@test.com',
                refundAmount: '25.00',
                isFullRefund: false,
            });

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.html).toContain('Partial Refund');
            expect(call.html).toContain('$25.00');
        });
    });

    describe('sendPaymentFailureEmail', () => {
        it('sends payment failure email with correct subject', async () => {
            await sendPaymentFailureEmail({
                orderId: 'order-abcd1234',
                customerName: 'Bob',
                customerEmail: 'bob@test.com',
            });

            expect(mockEmailsSend).toHaveBeenCalledTimes(1);
            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.to).toBe('bob@test.com');
            expect(call.subject).toContain('Payment Issue');
            expect(call.subject).toContain('ABCD1234');
            expect(call.html).toContain("didn't go through");
        });

        it('includes retry link in the email', async () => {
            await sendPaymentFailureEmail({
                orderId: 'order-abcd1234',
                customerName: 'Bob',
                customerEmail: 'bob@test.com',
            });

            const call = mockEmailsSend.mock.calls[0][0];
            expect(call.html).toContain('/checkout');
            expect(call.html).toContain('Try Again');
        });
    });
});
