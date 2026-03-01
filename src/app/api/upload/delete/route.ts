import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteObject } from '@/lib/s3';

export async function POST(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { key } = await req.json();

        if (!key) {
            return NextResponse.json({ message: 'key is required' }, { status: 400 });
        }

        await deleteObject(key);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Failed to delete from S3:', err);
        return NextResponse.json({ message: 'Failed to delete image' }, { status: 500 });
    }
}
