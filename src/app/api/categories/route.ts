import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { captureError } from '@/lib/error';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(
            categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                imageUrl: c.imageUrl,
                sortOrder: c.sortOrder,
            })),
            { status: 200 }
        );
    } catch (error) {
        captureError(error, 'Categories API error');
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
