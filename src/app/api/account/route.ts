import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true, authProvider: true },
    });

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }
    if (name.length > 100) {
        return NextResponse.json({ message: 'Name must be 100 characters or less' }, { status: 400 });
    }

    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            name: name.trim(),
            phone: phone?.trim() || null,
        },
        select: { name: true, email: true, phone: true, authProvider: true },
    });

    return NextResponse.json(updated);
}
