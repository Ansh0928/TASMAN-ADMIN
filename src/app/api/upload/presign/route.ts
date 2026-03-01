import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { generateImageKey, generatePresignedUploadUrl, getPublicUrl } from '@/lib/s3';

export async function POST(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { filename, contentType, folder } = await req.json();

        if (!filename || !contentType || !folder) {
            return NextResponse.json({ message: 'filename, contentType, and folder are required' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(contentType)) {
            return NextResponse.json({ message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 });
        }

        const key = generateImageKey(folder, filename);
        const uploadUrl = await generatePresignedUploadUrl(key, contentType);
        const publicUrl = getPublicUrl(key);

        return NextResponse.json({ uploadUrl, publicUrl, key });
    } catch (err) {
        console.error('Failed to generate presigned URL:', err);
        return NextResponse.json({ message: 'Failed to generate upload URL' }, { status: 500 });
    }
}
