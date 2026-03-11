import { requireAdmin } from '@/lib/admin-auth';
import { getObject, putObject } from '@/lib/s3';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

function isLocalImage(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//');
}

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

        if (isLocalImage(cleanUrl)) {
            // Local file in public/ directory
            const filePath = path.join(process.cwd(), 'public', cleanUrl);
            imageBuffer = await readFile(filePath);
        } else {
            // S3 URL — extract key from hostname-based URL
            const urlObj = new URL(cleanUrl);
            const key = urlObj.pathname.slice(1);
            imageBuffer = await getObject(key);
        }

        // Rotate with sharp
        const rotated = await sharp(imageBuffer)
            .rotate(angle)
            .toBuffer();

        if (isLocalImage(cleanUrl)) {
            // Write back to local file
            const filePath = path.join(process.cwd(), 'public', cleanUrl);
            await writeFile(filePath, rotated);
        } else {
            // Re-upload to S3
            const urlObj = new URL(cleanUrl);
            const key = urlObj.pathname.slice(1);
            const ext = key.split('.').pop()?.toLowerCase();
            const contentTypeMap: Record<string, string> = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                webp: 'image/webp',
                gif: 'image/gif',
            };
            const contentType = contentTypeMap[ext || ''] || 'image/jpeg';
            await putObject(key, rotated, contentType);
        }

        // Return clean URL (no query string — Next.js Image doesn't allow it on local images)
        return NextResponse.json({ url: cleanUrl });
    } catch (err) {
        console.error('Rotate image error:', err);
        return NextResponse.json({ message: 'Failed to rotate image' }, { status: 500 });
    }
}
