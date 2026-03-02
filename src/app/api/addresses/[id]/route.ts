import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/addresses/[id] — Update an address
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify address belongs to the user
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    let body: { street?: string; city?: string; state?: string; postcode?: string; isDefault?: boolean };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { street, city, state, postcode, isDefault } = body;
    const userId = session.user.id;

    // Build update data — only include provided fields
    const data: Record<string, unknown> = {};
    if (street !== undefined) data.street = street.trim();
    if (city !== undefined) data.city = city.trim();
    if (state !== undefined) data.state = state.trim();
    if (postcode !== undefined) data.postcode = postcode.trim();

    if (isDefault === true) {
        // Transaction: unset other defaults, then update this one
        const updated = await prisma.$transaction(async (tx) => {
            await tx.address.updateMany({
                where: { userId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
            return tx.address.update({
                where: { id },
                data: { ...data, isDefault: true },
            });
        });
        return NextResponse.json(updated);
    }

    if (isDefault !== undefined) {
        data.isDefault = isDefault;
    }

    const updated = await prisma.address.update({
        where: { id },
        data,
    });

    return NextResponse.json(updated);
}

// DELETE /api/addresses/[id] — Delete an address
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify address belongs to the user
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
}
