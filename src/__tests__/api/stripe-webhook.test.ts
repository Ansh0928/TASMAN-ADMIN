import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock, stripeMock, factories } from '../helpers/mocks';

const mockSendOrderConfirmationEmail = vi.hoisted(() =>
    vi.fn().mockResolvedValue({ success: true, id: 'email-123' })
);

vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('@/lib/stripe', () => ({
    stripe: stripeMock,
}));

vi.mock('@/lib/resend', () => ({
    sendOrderConfirmationEmail: mockSendOrderConfirmationEmail,
}));

import { POST } from '@/app/api/stripe/webhook/route';
import { NextRequest } from 'next/server';

function createWebhookRequest(body: string, signature: string | null = 'valid-sig'): NextRequest {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (signature) {
        headers['stripe-signature'] = signature;
    }
    return new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body,
        headers,
    });
}

const mockOrderWithItems = {
    ...factories.order({
        id: 'order-1',
        status: 'CONFIRMED',
        guestEmail: 'customer@example.com',
        guestName: 'John Doe',
        subtotal: '59.98',
        deliveryFee: '10.00',
        tax: '7.00',
        total: '76.98',
        fulfillment: 'DELIVERY',
        deliveryStreet: '123 Ocean Rd',
        deliveryCity: 'Gold Coast',
        deliveryState: 'QLD',
        deliveryPostcode: '4217',
        pickupTime: null,
    }),
    user: null,
    items: [
        {
            id: 'oi-1',
            orderId: 'order-1',
            productId: 'prod-1',
            quantity: 2,
            unitPrice: '29.99',
            total: '59.98',
            product: factories.product({ id: 'prod-1', name: 'Atlantic Salmon' }),
        },
    ],
};

describe('POST /api/stripe/webhook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 when stripe-signature header is missing', async () => {
        const response = await POST(createWebhookRequest('{}', null));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Missing signature or secret');
    });

    it('returns 400 when signature verification fails', async () => {
        stripeMock.webhooks.constructEvent.mockImplementation(() => {
            throw new Error('Invalid signature');
        });

        const response = await POST(createWebhookRequest('{}', 'invalid-sig'));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe('Webhook signature verification failed');
    });

    it('handles checkout.session.completed event and confirms order', async () => {
        const stripeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    payment_status: 'paid',
                    payment_intent: 'pi_test_123',
                    metadata: { orderId: 'order-1' },
                    invoice: null,
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
        prismaMock.order.update.mockResolvedValue(mockOrderWithItems);
        prismaMock.product.update.mockResolvedValue({});
        prismaMock.notification.create.mockResolvedValue({});

        const response = await POST(createWebhookRequest(JSON.stringify(stripeEvent)));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);

        // Verify order was updated to CONFIRMED
        expect(prismaMock.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: {
                status: 'CONFIRMED',
                stripePaymentIntent: 'pi_test_123',
            },
            include: {
                items: {
                    include: { product: true },
                },
                user: true,
            },
        });

        // Verify stock was decremented
        expect(prismaMock.product.update).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
            data: {
                stockQuantity: {
                    decrement: 2,
                },
            },
        });
    });

    it('sends confirmation email after checkout.session.completed', async () => {
        const stripeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    payment_status: 'paid',
                    payment_intent: 'pi_test_123',
                    metadata: { orderId: 'order-1' },
                    invoice: null,
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
        prismaMock.order.update.mockResolvedValue(mockOrderWithItems);
        prismaMock.product.update.mockResolvedValue({});
        prismaMock.notification.create.mockResolvedValue({});

        await POST(createWebhookRequest(JSON.stringify(stripeEvent)));

        expect(mockSendOrderConfirmationEmail).toHaveBeenCalledWith({
            orderId: 'order-1',
            customerName: 'John Doe',
            customerEmail: 'customer@example.com',
            items: mockOrderWithItems.items,
            subtotal: '59.98',
            deliveryFee: '10.00',
            tax: '7.00',
            total: '76.98',
            fulfillment: 'DELIVERY',
            deliveryStreet: '123 Ocean Rd',
            deliveryCity: 'Gold Coast',
            deliveryState: 'QLD',
            deliveryPostcode: '4217',
            pickupTime: undefined,
            invoiceUrl: undefined,
        });

        // Verify notification was logged
        expect(prismaMock.notification.create).toHaveBeenCalledWith({
            data: {
                orderId: 'order-1',
                type: 'EMAIL',
                recipient: 'customer@example.com',
                status: 'SENT',
            },
        });
    });

    it('captures invoice URL when invoice is present', async () => {
        const stripeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    payment_status: 'paid',
                    payment_intent: 'pi_test_123',
                    metadata: { orderId: 'order-1' },
                    invoice: 'in_test_123',
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
        prismaMock.order.update
            // First call: update order status
            .mockResolvedValueOnce(mockOrderWithItems)
            // Second call: update invoice info
            .mockResolvedValueOnce({});
        prismaMock.product.update.mockResolvedValue({});
        prismaMock.notification.create.mockResolvedValue({});

        stripeMock.invoices.retrieve.mockResolvedValue({
            hosted_invoice_url: 'https://invoice.stripe.com/i/test',
        });

        await POST(createWebhookRequest(JSON.stringify(stripeEvent)));

        expect(stripeMock.invoices.retrieve).toHaveBeenCalledWith('in_test_123');

        // Verify invoice data was saved
        expect(prismaMock.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: {
                stripeInvoiceId: 'in_test_123',
                stripeInvoiceUrl: 'https://invoice.stripe.com/i/test',
            },
        });

        // Verify email was sent with invoice URL
        expect(mockSendOrderConfirmationEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                invoiceUrl: 'https://invoice.stripe.com/i/test',
            })
        );
    });

    it('uses user email when order has associated user', async () => {
        const orderWithUser = {
            ...mockOrderWithItems,
            user: factories.user({
                id: 'user-1',
                name: 'Jane Smith',
                email: 'jane@example.com',
            }),
        };

        const stripeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    payment_status: 'paid',
                    payment_intent: 'pi_test_123',
                    metadata: { orderId: 'order-1' },
                    invoice: null,
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
        prismaMock.order.update.mockResolvedValue(orderWithUser);
        prismaMock.product.update.mockResolvedValue({});
        prismaMock.notification.create.mockResolvedValue({});

        await POST(createWebhookRequest(JSON.stringify(stripeEvent)));

        expect(mockSendOrderConfirmationEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                customerEmail: 'jane@example.com',
                customerName: 'Jane Smith',
            })
        );
    });

    it('does not process checkout.session.completed when payment_status is not paid', async () => {
        const stripeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    payment_status: 'unpaid',
                    metadata: { orderId: 'order-1' },
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);

        const response = await POST(createWebhookRequest(JSON.stringify(stripeEvent)));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
        expect(prismaMock.order.update).not.toHaveBeenCalled();
    });

    it('handles checkout.session.async_payment_failed event', async () => {
        const stripeEvent = {
            type: 'checkout.session.async_payment_failed',
            data: {
                object: {
                    metadata: { orderId: 'order-2' },
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
        prismaMock.order.update.mockResolvedValue({});

        const response = await POST(createWebhookRequest(JSON.stringify(stripeEvent)));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
        expect(prismaMock.order.update).toHaveBeenCalledWith({
            where: { id: 'order-2' },
            data: { status: 'CANCELLED' },
        });
    });

    it('handles unknown event types gracefully', async () => {
        const stripeEvent = {
            type: 'payment_intent.succeeded',
            data: { object: {} },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);

        const response = await POST(createWebhookRequest(JSON.stringify(stripeEvent)));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('logs notification as FAILED when email sending fails', async () => {
        const stripeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    payment_status: 'paid',
                    payment_intent: 'pi_test_123',
                    metadata: { orderId: 'order-1' },
                    invoice: null,
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
        prismaMock.order.update.mockResolvedValue(mockOrderWithItems);
        prismaMock.product.update.mockResolvedValue({});
        prismaMock.notification.create.mockResolvedValue({});
        mockSendOrderConfirmationEmail.mockResolvedValue({ success: false, error: 'Email failed' });

        await POST(createWebhookRequest(JSON.stringify(stripeEvent)));

        expect(prismaMock.notification.create).toHaveBeenCalledWith({
            data: {
                orderId: 'order-1',
                type: 'EMAIL',
                recipient: 'customer@example.com',
                status: 'FAILED',
            },
        });
    });

    it('returns 500 when order update throws an error', async () => {
        const stripeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    payment_status: 'paid',
                    payment_intent: 'pi_test_123',
                    metadata: { orderId: 'order-1' },
                    invoice: null,
                },
            },
        };

        stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
        prismaMock.order.update.mockRejectedValue(new Error('DB error'));

        const response = await POST(createWebhookRequest(JSON.stringify(stripeEvent)));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.message).toBe('Webhook processing failed');
    });
});
