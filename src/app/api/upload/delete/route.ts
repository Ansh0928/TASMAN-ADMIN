import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteObject } from '@/lib/s3';

const ALLOWED_PREFIXES = ['products/', 'categories/', 'banners/'];

export async function POST(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { key } = await req.json();

        if (!key || typeof key !== 'string') {
            return NextResponse.json({ message: 'key is required' }, { status: 400 });
        }

        if (!ALLOWED_PREFIXES.some(prefix => key.startsWith(prefix))) {
            return NextResponse.json({ message: 'Invalid key prefix' }, { status: 400 });
        }

        await deleteObject(key);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Failed to delete from S3:', err);
        return NextResponse.json({ message: 'Failed to delete image' }, { status: 500 });
    }
}
