import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Decimal from 'decimal.js';

export async function POST(request: NextRequest) {
    try {
        const {
            items,
            fulfillment,
            guestEmail,
            guestName,
            guestPhone,
            deliveryStreet,
            deliveryCity,
            deliveryState,
            deliveryPostcode,
            pickupTime,
        } = await request.json();

        // Basic validation
        if (!items || items.length === 0) {
            return NextResponse.json(
                { message: 'Cart is empty' },
                { status: 400 }
            );
        }

        if (!guestEmail || !guestName || !guestPhone) {
            return NextResponse.json(
                { message: 'Name, email, and phone are required' },
                { status: 400 }
            );
        }

        if (!fulfillment || !['DELIVERY', 'PICKUP'].includes(fulfillment)) {
            return NextResponse.json(
                { message: 'Invalid fulfillment type' },
                { status: 400 }
            );
        }

        if (fulfillment === 'DELIVERY' && (!deliveryStreet || !deliveryCity || !deliveryState || !deliveryPostcode)) {
            return NextResponse.json(
                { message: 'Delivery address is required' },
                { status: 400 }
            );
        }

        if (fulfillment === 'PICKUP' && !pickupTime) {
            return NextResponse.json(
                { message: 'Pickup time is required' },
                { status: 400 }
            );
        }

        // Validate stock availability and get server-side prices
        const productIds = items.map((item: any) => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return NextResponse.json(
                    { message: `Product "${item.name}" is no longer available` },
                    { status: 400 }
                );
            }
            if (!product.isAvailable) {
                return NextResponse.json(
                    { message: `"${product.name}" is currently unavailable` },
                    { status: 400 }
                );
            }
            if (product.stockQuantity < item.quantity) {
                return NextResponse.json(
                    {
                        message: product.stockQuantity === 0
                            ? `"${product.name}" is out of stock`
                            : `Only ${product.stockQuantity} of "${product.name}" available (you requested ${item.quantity})`,
                    },
                    { status: 400 }
                );
            }
        }

        // Calculate prices server-side to prevent price tampering
        let serverSubtotal = new Decimal(0);
        const orderItems = items.map((item: any) => {
            const product = productMap.get(item.productId)!;
            const unitPrice = new Decimal(product.price.toString());
            const itemTotal = unitPrice.times(item.quantity);
            serverSubtotal = serverSubtotal.plus(itemTotal);
            return {
                productId: item.productId,
                name: product.name,
                quantity: item.quantity,
                unitPrice,
                total: itemTotal,
            };
        });

        const serverDeliveryFee = new Decimal(fulfillment === 'DELIVERY' ? 10 : 0);
        const serverTax = serverSubtotal.plus(serverDeliveryFee).times(0.1);
        const serverTotal = serverSubtotal.plus(serverDeliveryFee).plus(serverTax);

        // Create order in database with server-side calculated prices
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
                subtotal: serverSubtotal,
                deliveryFee: serverDeliveryFee,
                tax: serverTax,
                total: serverTotal,
                items: {
                    create: orderItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total,
                    })),
                },
            },
        });

        // Create Stripe checkout session using server-side prices
        const lineItems = orderItems.map((item: any) => ({
            price_data: {
                currency: 'aud',
                product_data: {
                    name: item.name,
                },
                unit_amount: item.unitPrice.times(100).toNumber(), // Convert to cents
            },
            quantity: item.quantity,
        }));

        // Add delivery fee if applicable
        if (serverDeliveryFee.gt(0)) {
            lineItems.push({
                price_data: {
                    currency: 'aud',
                    product_data: {
                        name: 'Delivery Fee',
                    },
                    unit_amount: serverDeliveryFee.times(100).toNumber(),
                },
                quantity: 1,
            });
        }

        // Add tax
        lineItems.push({
            price_data: {
                currency: 'aud',
                product_data: {
                    name: 'GST (10%)',
                },
                unit_amount: Math.round(serverTax.times(100).toNumber()),
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
