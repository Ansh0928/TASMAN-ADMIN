import { requireAdmin } from '@/lib/admin-auth';
import { getObject, putObject, getPublicUrl, generateImageKey } from '@/lib/s3';
import { captureError } from '@/lib/error';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { readFile } from 'fs/promises';
import path from 'path';

function isLocalImage(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//');
}

const contentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
};

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

        const cleanUrl = imageUrl.split('?')[0]; // strip cache-busting params

        let imageBuffer: Buffer;
        let ext: string;

        if (isLocalImage(cleanUrl)) {
            // Local file in public/ directory — validate path stays within public/
            const publicDir = path.join(process.cwd(), 'public');
            const filePath = path.resolve(publicDir, cleanUrl.replace(/^\//, ''));
            if (!filePath.startsWith(publicDir)) {
                return NextResponse.json({ message: 'Invalid image path' }, { status: 400 });
            }
            ext = path.extname(filePath).toLowerCase().replace('.', '');
            if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                return NextResponse.json({ message: 'Invalid image type' }, { status: 400 });
            }
            imageBuffer = await readFile(filePath);
        } else {
            // S3 URL — extract key from hostname-based URL
            const urlObj = new URL(cleanUrl);
            const key = urlObj.pathname.slice(1);
            ext = key.split('.').pop()?.toLowerCase() || 'jpeg';
            imageBuffer = await getObject(key);
        }

        // Rotate with sharp
        const rotated = await sharp(imageBuffer)
            .rotate(angle)
            .toBuffer();

        const contentType = contentTypeMap[ext] || 'image/jpeg';

        if (isLocalImage(cleanUrl)) {
            // Upload rotated image to S3 (Vercel filesystem is read-only)
            const filename = path.basename(cleanUrl);
            const key = generateImageKey('products', filename);
            await putObject(key, rotated, contentType);
            const newUrl = getPublicUrl(key);
            return NextResponse.json({ url: newUrl });
        } else {
            // Re-upload to S3 at same key
            const urlObj = new URL(cleanUrl);
            const key = urlObj.pathname.slice(1);
            await putObject(key, rotated, contentType);
            return NextResponse.json({ url: cleanUrl });
        }
    } catch (err) {
        captureError(err, 'Rotate image error');
        return NextResponse.json({ message: 'Failed to rotate image' }, { status: 500 });
    }
}
