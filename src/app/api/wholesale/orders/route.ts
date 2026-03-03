import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import Decimal from 'decimal.js';

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'WHOLESALE' || user.wholesaleStatus !== 'APPROVED') {
        return NextResponse.json({ message: 'Wholesale access required' }, { status: 403 });
    }

    try {
        const orders = await prisma.wholesaleOrder.findMany({
            where: { userId: user.id },
            include: {
                items: {
                    include: { wholesalePriceItem: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders);
    } catch (err) {
        console.error('Fetch wholesale orders error:', err);
        return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'WHOLESALE' || user.wholesaleStatus !== 'APPROVED') {
        return NextResponse.json({ message: 'Wholesale access required' }, { status: 403 });
    }

    try {
        const { items, notes } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0 || items.length > 100) {
            return NextResponse.json({ message: 'Invalid items list' }, { status: 400 });
        }

        for (const item of items) {
            if (!item.wholesalePriceItemId || typeof item.wholesalePriceItemId !== 'string') {
                return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
            }
            if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000) {
                return NextResponse.json({ message: 'Quantity must be a positive integer (max 10,000)' }, { status: 400 });
            }
        }

        const itemIds = items.map((i: any) => i.wholesalePriceItemId);
        const priceItems = await prisma.wholesalePriceItem.findMany({
            where: { id: { in: itemIds }, isAvailable: true },
        });

        const priceMap = new Map(priceItems.map(p => [p.id, p]));

        const orderItems = items.map((item: any) => {
            const priceItem = priceMap.get(item.wholesalePriceItemId);
            if (!priceItem) throw new Error(`Item ${item.wholesalePriceItemId} not found or unavailable`);

            const unitPrice = new Decimal(priceItem.price.toString());
            const total = unitPrice.times(item.quantity);

            return {
                wholesalePriceItemId: item.wholesalePriceItemId,
                quantity: item.quantity,
                unitPrice: unitPrice.toNumber(),
                total: total.toNumber(),
            };
        });

        const order = await prisma.wholesaleOrder.create({
            data: {
                userId: user.id,
                notes: notes || null,
                items: { create: orderItems },
            },
            include: {
                items: { include: { wholesalePriceItem: true } },
            },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (err: any) {
        console.error('Create wholesale order error:', err);
        return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
    }
}
