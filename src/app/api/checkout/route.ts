import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Decimal from 'decimal.js';

export async function POST(request: NextRequest) {
    try {
        const {
            items,
            fulfillment,
            subtotal,
            deliveryFee,
            tax,
            total,
            guestEmail,
            guestName,
            guestPhone,
            deliveryStreet,
            deliveryCity,
            deliveryState,
            deliveryPostcode,
            pickupTime,
        } = await request.json();

        if (!items || items.length === 0) {
            return NextResponse.json(
                { message: 'Cart is empty' },
                { status: 400 }
            );
        }

        // Create order in database
        const order = await prisma.order.create({
            data: {
                guestEmail,
                guestName,
                guestPhone,
                status: 'PENDING',
                fulfillment,
                deliveryStreet: deliveryStreet || null,
                deliveryCity: deliveryCity || null,
                deliveryState: deliveryState || null,
                deliveryPostcode: deliveryPostcode || null,
                pickupTime: pickupTime ? new Date(pickupTime) : null,
                subtotal: new Decimal(subtotal),
                deliveryFee: new Decimal(deliveryFee),
                tax: new Decimal(tax),
                total: new Decimal(total),
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: new Decimal(item.price),
                        total: new Decimal(item.price * item.quantity),
                    })),
                },
            },
        });

        // Create Stripe checkout session
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'aud',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));

        // Add delivery fee if applicable
        if (deliveryFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'aud',
                    product_data: {
                        name: 'Delivery Fee',
                    },
                    unit_amount: Math.round(deliveryFee * 100),
                },
                quantity: 1,
            });
        }

        // Add tax
        lineItems.push({
            price_data: {
                currency: 'aud',
                product_data: {
                    name: 'Tax',
                },
                unit_amount: Math.round(tax * 100),
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
            customer_email: guestEmail,
            metadata: {
                orderId: order.id,
            },
        });

        // Update order with Stripe session ID
        await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: session.id },
        });

        return NextResponse.json(
            { url: session.url },
            { status: 200 }
        );
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { message: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
