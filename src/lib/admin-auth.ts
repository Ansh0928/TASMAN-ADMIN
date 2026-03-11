import { auth } from './auth';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
    const session = await auth();
    if (!session?.user) {
        return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }), session: null };
    }
    if (session.user.role !== 'ADMIN') {
        return { error: NextResponse.json({ message: 'Not Found' }, { status: 404 }), session: null };
    }
    return { error: null, session };
}
