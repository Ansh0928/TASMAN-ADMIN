import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _s3: S3Client | null = null;

function getS3(): S3Client {
    if (!_s3) {
        const region = process.env.AWS_S3_REGION;
        if (!region) throw new Error('AWS_S3_REGION environment variable is not set');
        _s3 = new S3Client({
            region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }
    return _s3;
}

function getBucket(): string {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
    return bucket;
}

export function generateImageKey(folder: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    return `${folder}/${timestamp}-${sanitized}`;
}

export async function generatePresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(getS3(), command, { expiresIn: 300 });
}

export async function deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
    });
    await getS3().send(command);
}

export function getPublicUrl(key: string): string {
    const bucket = getBucket();
    const region = process.env.AWS_S3_REGION;
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function getObject(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
    });
    const response = await getS3().send(command);
    const stream = response.Body;
    if (!stream) throw new Error('Empty response from S3');
    return Buffer.from(await stream.transformToByteArray());
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    await getS3().send(command);
}
