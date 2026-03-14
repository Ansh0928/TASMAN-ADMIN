import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const product = await prisma.product.findUnique({
            where: { slug },
            include: { categories: { include: { category: true } } },
        });

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        const primaryCat = product.categories.find((pc: any) => pc.isPrimary)?.category || product.categories[0]?.category;

        return NextResponse.json({
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price.toString(),
            imageUrls: product.imageUrls,
            category: primaryCat
                ? { id: primaryCat.id, name: primaryCat.name, slug: primaryCat.slug }
                : { id: '', name: '', slug: '' },
            unit: product.unit,
            stockQuantity: product.stockQuantity,
            isAvailable: product.isAvailable,
            isFeatured: product.isFeatured,
            isTodaysSpecial: product.isTodaysSpecial,
            tags: product.tags,
        });
    } catch (error) {
        captureError(error, 'Product detail API error');
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
