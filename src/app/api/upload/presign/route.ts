import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { generateImageKey, generatePresignedUploadUrl, getPublicUrl } from '@/lib/s3';
import { captureError } from '@/lib/error';

export async function POST(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    try {
        const { filename, contentType, folder, fileSize } = await req.json();

        if (!filename || !contentType || !folder) {
            return NextResponse.json({ message: 'filename, contentType, and folder are required' }, { status: 400 });
        }

        const allowedFolders = ['products', 'categories', 'banners'];
        if (!allowedFolders.includes(folder)) {
            return NextResponse.json({ message: 'Invalid upload folder' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(contentType)) {
            return NextResponse.json({ message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 });
        }

        if (fileSize && typeof fileSize === 'number' && fileSize > MAX_FILE_SIZE) {
            return NextResponse.json({ message: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
        }

        const key = generateImageKey(folder, filename);
        const uploadUrl = await generatePresignedUploadUrl(key, contentType);
        const publicUrl = getPublicUrl(key);

        return NextResponse.json({ uploadUrl, publicUrl, key });
    } catch (err) {
        captureError(err, 'Failed to generate presigned URL');
        return NextResponse.json({ message: 'Failed to generate upload URL' }, { status: 500 });
    }
}
