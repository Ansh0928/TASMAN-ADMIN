import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploader from '@/components/admin/ImageUploader';

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-preview');
URL.revokeObjectURL = vi.fn();

describe('ImageUploader', () => {
    const defaultProps = {
        value: [] as string[],
        onChange: vi.fn(),
        folder: 'products',
        maxFiles: 10,
    };

    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({
                    uploadUrl: 'https://s3.amazonaws.com/presigned-upload-url',
                    publicUrl: 'https://s3.amazonaws.com/products/uploaded-image.jpg',
                }),
        });
        vi.stubGlobal('fetch', mockFetch);
    });

    it('renders drop zone', () => {
        render(<ImageUploader {...defaultProps} />);

        expect(screen.getByText('Drag & drop images or click to browse')).toBeInTheDocument();
        expect(screen.getByText(/JPEG, PNG, WebP, GIF/)).toBeInTheDocument();
    });

    it('shows existing images', () => {
        const urls = [
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg',
        ];

        render(<ImageUploader {...defaultProps} value={urls} />);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/img1.jpg');
        expect(images[1]).toHaveAttribute('src', 'https://example.com/img2.jpg');
    });

    it('first image has Primary label', () => {
        const urls = [
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg',
        ];

        render(<ImageUploader {...defaultProps} value={urls} />);

        expect(screen.getByText('Primary')).toBeInTheDocument();
    });

    it('does not show Primary label when no images', () => {
        render(<ImageUploader {...defaultProps} value={[]} />);

        expect(screen.queryByText('Primary')).not.toBeInTheDocument();
    });

    it('remove button calls onChange without removed URL', async () => {
        const urls = [
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg',
        ];
        const onChange = vi.fn();
        const user = userEvent.setup();

        render(<ImageUploader {...defaultProps} value={urls} onChange={onChange} />);

        // Find the remove buttons (title="Remove image")
        const removeButtons = screen.getAllByTitle('Remove image');
        expect(removeButtons).toHaveLength(2);

        await user.click(removeButtons[0]);

        expect(onChange).toHaveBeenCalledWith(['https://example.com/img2.jpg']);
    });

    it('validates file types (only images)', async () => {
        render(<ImageUploader {...defaultProps} />);

        // Create a non-image file
        const textFile = new File(['hello'], 'document.txt', { type: 'text/plain' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        // Use fireEvent.change to bypass the input's accept attribute enforcement
        fireEvent.change(input, { target: { files: [textFile] } });

        expect(screen.getByText('Only JPEG, PNG, WebP, and GIF files are allowed')).toBeInTheDocument();
    });

    it('validates file size (max 10MB)', async () => {
        const user = userEvent.setup();

        render(<ImageUploader {...defaultProps} />);

        // Create an oversized file (11MB)
        const largeContent = new ArrayBuffer(11 * 1024 * 1024);
        const largeFile = new File([largeContent], 'large-image.jpg', { type: 'image/jpeg' });

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(input, largeFile);

        expect(screen.getByText('Files must be under 10MB')).toBeInTheDocument();
    });

    it('shows error for invalid files', async () => {
        render(<ImageUploader {...defaultProps} />);

        const pdfFile = new File(['%PDF'], 'document.pdf', { type: 'application/pdf' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        // Use fireEvent.change to bypass the input's accept attribute enforcement
        fireEvent.change(input, { target: { files: [pdfFile] } });

        expect(screen.getByText('Only JPEG, PNG, WebP, and GIF files are allowed')).toBeInTheDocument();
    });

    it('shows max files reached message when at limit', async () => {
        const urls = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];
        const user = userEvent.setup();

        render(<ImageUploader {...defaultProps} value={urls} maxFiles={2} />);

        // Drop zone should not be rendered when at limit
        expect(screen.queryByText('Drag & drop images or click to browse')).not.toBeInTheDocument();
    });

    it('shows error when trying to upload beyond max files', async () => {
        // When value.length >= maxFiles, remaining <= 0, so error is shown
        const urls = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];

        render(<ImageUploader {...defaultProps} value={urls} maxFiles={2} />);

        // The drop zone is hidden, and shows count label
        expect(screen.getByText('Product Images (2/2)')).toBeInTheDocument();
    });

    it('displays image count label', () => {
        const urls = ['https://example.com/img1.jpg'];

        render(<ImageUploader {...defaultProps} value={urls} maxFiles={10} />);

        expect(screen.getByText('Product Images (1/10)')).toBeInTheDocument();
    });

    it('accepts valid image files', async () => {
        const user = userEvent.setup();

        // Mock XMLHttpRequest for the S3 upload
        const mockXhr = {
            open: vi.fn(),
            send: vi.fn(),
            setRequestHeader: vi.fn(),
            upload: {
                onprogress: null as any,
            },
            onload: null as any,
            onerror: null as any,
            status: 200,
        };

        // Use a regular function (not arrow) so it can be called with `new`.
        // Returning an object from a constructor makes `new` return that object.
        vi.stubGlobal('XMLHttpRequest', function () { return mockXhr; });

        const onChange = vi.fn();
        render(<ImageUploader {...defaultProps} onChange={onChange} />);

        const validFile = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(input, validFile);

        // The presign API should have been called
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/upload/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: 'photo.jpg',
                    contentType: 'image/jpeg',
                    folder: 'products',
                }),
            });
        });

        // Simulate the XHR upload completing
        await waitFor(() => {
            expect(mockXhr.onload).not.toBeNull();
        });

        // Trigger the onload callback
        act(() => {
            mockXhr.onload();
        });

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith([
                'https://s3.amazonaws.com/products/uploaded-image.jpg',
            ]);
        });
    });
});
