import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
        console.error('Categories API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
