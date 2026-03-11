'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon, RotateCw } from 'lucide-react';

interface ImageUploaderProps {
    value: string[];
    onChange: (urls: string[]) => void;
    maxFiles?: number;
    folder: string;
}

interface UploadingFile {
    id: string;
    name: string;
    progress: number;
    preview: string;
}

export default function ImageUploader({ value, onChange, maxFiles = 10, folder }: ImageUploaderProps) {
    const [uploading, setUploading] = useState<UploadingFile[]>([]);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
    const [cacheBusters, setCacheBusters] = useState<Record<number, number>>({});

    const rotateImage = useCallback(async (index: number, angle: 90 | 270) => {
        const url = value[index];
        setRotatingIndex(index);
        setError('');

        try {
            const res = await fetch('/api/admin/products/rotate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: url, angle }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to rotate image');
            }

            await res.json();
            // Don't modify the URL — use a local cache-buster for display only
            setCacheBusters(prev => ({ ...prev, [index]: Date.now() }));
            // Trigger re-render by setting same URLs (forces parent to re-save unchanged URLs)
            onChange([...value]);
        } catch (err: any) {
            setError(err.message || 'Failed to rotate image');
        } finally {
            setRotatingIndex(null);
        }
    }, [value, onChange]);

    const uploadFile = useCallback(async (file: File) => {
        const id = Math.random().toString(36).slice(2);
        const preview = URL.createObjectURL(file);

        setUploading(prev => [...prev, { id, name: file.name, progress: 0, preview }]);

        try {
            // Get presigned URL
            const presignRes = await fetch('/api/upload/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    folder,
                }),
            });

            if (!presignRes.ok) {
                const data = await presignRes.json();
                throw new Error(data.message || 'Failed to get upload URL');
            }

            const { uploadUrl, publicUrl } = await presignRes.json();

            // Upload directly to S3
            const xhr = new XMLHttpRequest();
            await new Promise<void>((resolve, reject) => {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const progress = Math.round((e.loaded / e.total) * 100);
                        setUploading(prev => prev.map(u => u.id === id ? { ...u, progress } : u));
                    }
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                };
                xhr.onerror = () => reject(new Error('Upload failed'));
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });

            // Add URL to value
            onChange([...value, publicUrl]);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(prev => prev.filter(u => u.id !== id));
            URL.revokeObjectURL(preview);
        }
    }, [folder, onChange, value]);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        setError('');

        const remaining = maxFiles - value.length;
        if (remaining <= 0) {
            setError(`Maximum ${maxFiles} images allowed`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remaining);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        for (const file of filesToUpload) {
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPEG, PNG, WebP, and GIF files are allowed');
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('Files must be under 10MB');
                continue;
            }
            uploadFile(file);
        }
    }, [maxFiles, value.length, uploadFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const removeImage = async (index: number) => {
        const url = value[index];
        const newUrls = value.filter((_, i) => i !== index);
        onChange(newUrls);

        // Try to delete from S3 (extract key from URL)
        try {
            const urlObj = new URL(url);
            const key = urlObj.pathname.slice(1); // Remove leading /
            await fetch('/api/upload/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });
        } catch {
            // Non-critical if delete fails
        }
    };

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;

        const newUrls = [...value];
        const [moved] = newUrls.splice(dragIndex, 1);
        newUrls.splice(index, 0, moved);
        onChange(newUrls);
        setDragIndex(index);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
    };

    return (
        <div className="space-y-3">
            <label className="block text-theme-text-muted text-sm mb-1">
                Product Images {value.length > 0 && `(${value.length}/${maxFiles})`}
            </label>

            {/* Existing images */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {value.map((url, index) => {
                        const displayUrl = cacheBusters[index] ? `${url}${url.includes('?') ? '&' : '?'}t=${cacheBusters[index]}` : url;
                        return (
                        <div
                            key={`${url}-${cacheBusters[index] || ''}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative group rounded-lg overflow-hidden border-2 aspect-square ${
                                dragIndex === index ? 'border-theme-accent opacity-50' : 'border-theme-border'
                            } ${index === 0 ? 'ring-2 ring-theme-accent' : ''}`}
                        >
                            <img
                                src={displayUrl}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                                <span className="absolute top-1 left-1 bg-theme-accent text-white text-xs px-1.5 py-0.5 rounded">
                                    Primary
                                </span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => rotateImage(index, 270)}
                                    disabled={rotatingIndex === index}
                                    className="text-white hover:text-theme-accent disabled:opacity-50"
                                    title="Rotate left (CCW)"
                                >
                                    <RotateCw size={20} className="scale-x-[-1]" />
                                </button>
                                <button
                                    type="button"
                                    className="cursor-grab active:cursor-grabbing text-white"
                                    title="Drag to reorder"
                                >
                                    <GripVertical size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => rotateImage(index, 90)}
                                    disabled={rotatingIndex === index}
                                    className="text-white hover:text-theme-accent disabled:opacity-50"
                                    title="Rotate right (CW)"
                                >
                                    <RotateCw size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="text-white hover:text-red-400"
                                    title="Remove image"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            {rotatingIndex === index && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            )}

            {/* Uploading previews */}
            {uploading.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {uploading.map(file => (
                        <div key={file.id} className="relative rounded-lg overflow-hidden border-2 border-theme-border aspect-square">
                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3/4">
                                    <div className="h-2 bg-theme-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-theme-accent transition-all duration-300"
                                            style={{ width: `${file.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-theme-text mt-1">{file.progress}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Drop zone */}
            {value.length < maxFiles && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        dragOver
                            ? 'border-theme-accent bg-theme-accent/10'
                            : 'border-theme-border hover:border-theme-accent/50'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                    <div className="flex flex-col items-center gap-2">
                        {value.length === 0 ? (
                            <ImageIcon size={32} className="text-theme-text-muted" />
                        ) : (
                            <Upload size={24} className="text-theme-text-muted" />
                        )}
                        <p className="text-theme-text-muted text-sm">
                            {dragOver ? 'Drop images here' : 'Drag & drop images or click to browse'}
                        </p>
                        <p className="text-theme-text-muted text-xs">
                            JPEG, PNG, WebP, GIF &bull; Max 10MB per file
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-red-400 text-sm">{error}</p>
            )}
        </div>
    );
}
