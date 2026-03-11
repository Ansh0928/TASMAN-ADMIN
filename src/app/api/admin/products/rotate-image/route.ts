import { requireAdmin } from '@/lib/admin-auth';
import { getObject, putObject } from '@/lib/s3';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { imageUrl, angle } = await request.json();

        if (!imageUrl || typeof imageUrl !== 'string') {
            return NextResponse.json({ message: 'imageUrl is required' }, { status: 400 });
        }

        const validAngles = [90, 180, 270];
        if (!validAngles.includes(angle)) {
            return NextResponse.json({ message: 'angle must be 90, 180, or 270' }, { status: 400 });
        }

        // Extract S3 key from the public URL
        const urlObj = new URL(imageUrl.split('?')[0]); // strip any existing query params
        const key = urlObj.pathname.slice(1); // remove leading /

        // Download from S3
        const imageBuffer = await getObject(key);

        // Rotate with sharp
        const rotated = await sharp(imageBuffer)
            .rotate(angle)
            .toBuffer();

        // Determine content type from extension
        const ext = key.split('.').pop()?.toLowerCase();
        const contentTypeMap: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
        };
        const contentType = contentTypeMap[ext || ''] || 'image/jpeg';

        // Re-upload to same key (overwrite)
        await putObject(key, rotated, contentType);

        // Return URL with cache-busting param so browser fetches new version
        const baseUrl = imageUrl.split('?')[0];
        const newUrl = `${baseUrl}?v=${Date.now()}`;

        return NextResponse.json({ url: newUrl });
    } catch (err) {
        console.error('Rotate image error:', err);
        return NextResponse.json({ message: 'Failed to rotate image' }, { status: 500 });
    }
}
