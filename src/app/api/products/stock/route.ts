import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const ids = request.nextUrl.searchParams.get('ids');
    if (!ids) {
        return NextResponse.json({}, { status: 200 });
    }

    const productIds = ids.split(',').slice(0, 50);

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stockQuantity: true, isAvailable: true },
    });

    const result: Record<string, { stockQuantity: number; isAvailable: boolean }> = {};
    for (const p of products) {
        result[p.id] = { stockQuantity: p.stockQuantity, isAvailable: p.isAvailable };
    }

    return NextResponse.json(result);
}
