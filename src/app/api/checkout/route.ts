import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { captureError } from '@/lib/error';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import Decimal from 'decimal.js';
import { rateLimit, apiLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (10 req/min for API endpoints)
        const ip = getClientIp(request);
        const { limited, headers: rateLimitHeaders } = await rateLimit(apiLimiter, ip);
        if (limited) {
            return NextResponse.json(
                { message: 'Too many requests. Please try again later.' },
                { status: 429, headers: rateLimitHeaders }
            );
        }

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
            discountCode,
            notes,
        } = await request.json();

        const authSession = await auth();
        const userId = authSession?.user?.id || null;

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

        // Validate email format (M-2)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof guestEmail !== 'string' || !emailRegex.test(guestEmail)) {
            return NextResponse.json(
                { message: 'Please enter a valid email address' },
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

        // Validate and sanitize items
        if (!Array.isArray(items) || items.length > 50) {
            return NextResponse.json({ message: 'Invalid items' }, { status: 400 });
        }

        for (const item of items) {
            if (!item.productId || typeof item.productId !== 'string') {
                return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
            }
            if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
                return NextResponse.json({ message: 'Quantity must be a positive integer (max 999)' }, { status: 400 });
            }
        }

        // Aggregate quantities per product to prevent duplicate-entry stock bypass
        const aggregated = new Map<string, number>();
        for (const item of items) {
            aggregated.set(item.productId, (aggregated.get(item.productId) || 0) + item.quantity);
        }

        const productIds = [...aggregated.keys()];
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        for (const [productId, totalQty] of aggregated) {
            const product = productMap.get(productId);
            if (!product) {
                return NextResponse.json(
                    { message: `A product is no longer available` },
                    { status: 400 }
                );
            }
            if (!product.isAvailable) {
                return NextResponse.json(
                    { message: `"${product.name}" is currently unavailable` },
                    { status: 400 }
                );
            }
            if (product.stockQuantity < totalQty) {
                return NextResponse.json(
                    {
                        message: product.stockQuantity === 0
                            ? `"${product.name}" is out of stock`
                            : `"${product.name}" doesn't have enough stock for your requested quantity`,
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

        // Validate coupon server-side if provided
        let validatedCouponId: string | undefined;
        let validatedPromotionCodeId: string | undefined;
        let serverDiscountAmount = new Decimal(0);

        if (discountCode && typeof discountCode === 'string') {
            const trimmedCode = discountCode.trim().toUpperCase();

            // Try promotion codes first
            const promotionCodes = await stripe.promotionCodes.list({
                code: trimmedCode,
                active: true,
                limit: 1,
            });

            if (promotionCodes.data.length > 0) {
                const promo = promotionCodes.data[0] as any;
                validatedCouponId = promo.coupon.id;
                validatedPromotionCodeId = promo.id;
                if (promo.coupon.percent_off) {
                    serverDiscountAmount = serverSubtotal.times(promo.coupon.percent_off).div(100);
                } else if (promo.coupon.amount_off) {
                    serverDiscountAmount = Decimal.min(new Decimal(promo.coupon.amount_off).div(100), serverSubtotal);
                }
            } else {
                // Try direct coupon ID
                try {
                    const coupon = await stripe.coupons.retrieve(trimmedCode);
                    if (coupon.valid) {
                        validatedCouponId = coupon.id;
                        if (coupon.percent_off) {
                            serverDiscountAmount = serverSubtotal.times(coupon.percent_off).div(100);
                        } else if (coupon.amount_off) {
                            serverDiscountAmount = Decimal.min(new Decimal(coupon.amount_off).div(100), serverSubtotal);
                        }
                    }
                } catch {
                    // Invalid coupon — ignore silently, no discount applied
                }
            }
        }

        const serverTax = serverSubtotal.plus(serverDeliveryFee).minus(serverDiscountAmount).times(0.1);
        const serverTotal = serverSubtotal.plus(serverDeliveryFee).minus(serverDiscountAmount).plus(serverTax);

        // Create order in database with server-side calculated prices
        const order = await prisma.order.create({
            data: {
                userId,
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
                discountCode: validatedCouponId ? (discountCode as string).trim().toUpperCase() : null,
                discountAmount: serverDiscountAmount,
                notes: notes?.trim() || null,
                items: {
                    create: orderItems.map((item: { productId: string; quantity: number; unitPrice: Decimal; total: Decimal }) => ({
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

        // Look up or create Stripe customer by email
        const existingCustomers = await stripe.customers.list({
            email: guestEmail,
            limit: 1,
        });

        let stripeCustomerId: string;
        if (existingCustomers.data.length > 0) {
            stripeCustomerId = existingCustomers.data[0].id;
        } else {
            const newCustomer = await stripe.customers.create({
                email: guestEmail,
                name: guestName,
                phone: guestPhone,
            });
            stripeCustomerId = newCustomer.id;
        }

        const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;

        const sessionParams: any = {
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: `${baseUrl}/checkout`,
            customer: stripeCustomerId,
            invoice_creation: { enabled: true },
            metadata: {
                orderId: order.id,
            },
        };

        // Apply Stripe discount if coupon was validated
        if (validatedPromotionCodeId) {
            sessionParams.discounts = [{ promotion_code: validatedPromotionCodeId }];
        } else if (validatedCouponId) {
            sessionParams.discounts = [{ coupon: validatedCouponId }];
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        // Update order with Stripe session ID
        await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: session.id },
        });

        return NextResponse.json(
            {
                url: session.url,
                serverSubtotal: serverSubtotal.toFixed(2),
                serverTotal: serverTotal.toFixed(2),
            },
            { status: 200 }
        );
    } catch (error: any) {
        captureError(error, 'Checkout error');
        const message = error?.raw?.message || error?.message || 'Failed to create checkout session';
        return NextResponse.json(
            { message },
            { status: 500 }
        );
    }
}
