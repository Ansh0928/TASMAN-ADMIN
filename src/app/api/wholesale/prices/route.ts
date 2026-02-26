import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    // Auth check: only approved wholesale users and admins can view prices
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json(
            { message: 'Please sign in to view wholesale prices' },
            { status: 401 }
        );
    }

    const { role, wholesaleStatus } = session.user as any;

    if (role === 'ADMIN') {
        // Admins can always see wholesale prices
    } else if (role === 'WHOLESALE' && wholesaleStatus === 'APPROVED') {
        // Approved wholesale users can see prices
    } else if (role === 'WHOLESALE' && wholesaleStatus === 'PENDING') {
        return NextResponse.json(
            { message: 'Your wholesale application is still being reviewed. You will receive an email once approved.' },
            { status: 403 }
        );
    } else if (role === 'WHOLESALE' && wholesaleStatus === 'REJECTED') {
        return NextResponse.json(
            { message: 'Your wholesale application was not approved. Please contact us for more information.' },
            { status: 403 }
        );
    } else {
        return NextResponse.json(
            { message: 'Wholesale pricing is only available to approved wholesale partners.' },
            { status: 403 }
        );
    }

    try {
        const categories = await prisma.wholesaleCategory.findMany({
            include: {
                items: {
                    where: { isAvailable: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(
            categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                items: cat.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    unit: item.unit,
                    price: item.price.toString(),
                    isAvailable: item.isAvailable,
                })),
            })),
            { status: 200 }
        );
    } catch (error) {
        console.error('Wholesale prices error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch prices' },
            { status: 500 }
        );
    }
}
