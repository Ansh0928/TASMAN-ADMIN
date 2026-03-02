import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/addresses — List addresses for the authenticated user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json(addresses);
}

// POST /api/addresses — Create a new address for the authenticated user
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { street?: string; city?: string; state?: string; postcode?: string; isDefault?: boolean };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { street, city, state, postcode, isDefault } = body;

    // Validate required fields
    if (!street?.trim() || !city?.trim() || !state?.trim() || !postcode?.trim()) {
        return NextResponse.json(
            { error: 'Street, city, state, and postcode are required' },
            { status: 400 }
        );
    }

    const userId = session.user.id;

    if (isDefault) {
        // Use a transaction: unset existing defaults, then create with isDefault true
        const address = await prisma.$transaction(async (tx) => {
            await tx.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
            return tx.address.create({
                data: {
                    userId,
                    street: street.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    postcode: postcode.trim(),
                    isDefault: true,
                },
            });
        });
        return NextResponse.json(address, { status: 201 });
    }

    const address = await prisma.address.create({
        data: {
            userId,
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            postcode: postcode.trim(),
            isDefault: false,
        },
    });

    return NextResponse.json(address, { status: 201 });
}
