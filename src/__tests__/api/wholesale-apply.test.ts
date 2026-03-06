import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks (available before vi.mock factories run) ──
const {
    mockPrisma,
    mockSendWholesaleApplicationReceivedEmail,
    mockSendWholesaleNewApplicationAdminEmail,
    mockSendSMS,
    mockWholesaleApplicationReceivedSMS,
    mockBcryptHash,
} = vi.hoisted(() => {
    return {
        mockPrisma: {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
        },
        mockSendWholesaleApplicationReceivedEmail: vi.fn().mockResolvedValue({ success: true }),
        mockSendWholesaleNewApplicationAdminEmail: vi.fn().mockResolvedValue({ success: true }),
        mockSendSMS: vi.fn().mockResolvedValue({ success: true, sid: 'SM_test' }),
        mockWholesaleApplicationReceivedSMS: vi.fn().mockReturnValue('SMS body'),
        mockBcryptHash: vi.fn().mockResolvedValue('hashed-password'),
    };
});

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma,
}));

vi.mock('@/lib/resend', () => ({
    sendWholesaleApplicationReceivedEmail: mockSendWholesaleApplicationReceivedEmail,
    sendWholesaleNewApplicationAdminEmail: mockSendWholesaleNewApplicationAdminEmail,
}));

vi.mock('@/lib/twilio', () => ({
    sendSMS: mockSendSMS,
    wholesaleApplicationReceivedSMS: mockWholesaleApplicationReceivedSMS,
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: mockBcryptHash,
    },
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ limited: false, headers: {} }),
    apiLimiter: {},
    getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

import { POST } from '@/app/api/wholesale/apply/route';
import { createMockRequest } from '../helpers/mocks';

const validApplication = {
    companyName: 'Test Seafood Co',
    abn: '12345678901',
    contactName: 'John Doe',
    email: 'john@testseafood.com',
    phone: '+61400111222',
    password: 'securepass123',  // 13 chars, meets 8-char minimum
};

describe('POST /api/wholesale/apply', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Restore default resolved values after clearAllMocks
        mockSendWholesaleApplicationReceivedEmail.mockResolvedValue({ success: true });
        mockSendWholesaleNewApplicationAdminEmail.mockResolvedValue({ success: true });
        mockSendSMS.mockResolvedValue({ success: true, sid: 'SM_test' });
        mockWholesaleApplicationReceivedSMS.mockReturnValue('SMS body');
        mockBcryptHash.mockResolvedValue('hashed-password');
    });

    // ── Successful application ──

    it('creates a wholesale application successfully', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({
            id: 'user-new',
            email: validApplication.email,
            name: validApplication.contactName,
            phone: validApplication.phone,
            role: 'WHOLESALE',
            wholesaleStatus: 'PENDING',
            companyName: validApplication.companyName,
            abn: validApplication.abn,
        });

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.message).toBe('Application submitted successfully');
        expect(body.userId).toBe('user-new');
    });

    it('creates user with hashed password and WHOLESALE role', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });

        const req = createMockRequest('POST', validApplication);
        await POST(req as any);

        expect(mockBcryptHash).toHaveBeenCalledWith(validApplication.password, 12);
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
            data: {
                email: validApplication.email,
                passwordHash: 'hashed-password',
                name: validApplication.contactName,
                phone: validApplication.phone,
                role: 'WHOLESALE',
                wholesaleStatus: 'PENDING',
                companyName: validApplication.companyName,
                abn: validApplication.abn,
                authProvider: 'credentials',
            },
        });
    });

    it('checks for existing user by email before creating', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });

        const req = createMockRequest('POST', validApplication);
        await POST(req as any);

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: validApplication.email },
        });
    });

    // ── Notifications ──

    it('sends confirmation email to applicant', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });

        const req = createMockRequest('POST', validApplication);
        await POST(req as any);

        expect(mockSendWholesaleApplicationReceivedEmail).toHaveBeenCalledWith({
            name: validApplication.contactName,
            email: validApplication.email,
            companyName: validApplication.companyName,
            abn: validApplication.abn,
            phone: validApplication.phone,
        });
    });

    it('sends notification email to admin', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });

        const req = createMockRequest('POST', validApplication);
        await POST(req as any);

        expect(mockSendWholesaleNewApplicationAdminEmail).toHaveBeenCalledWith({
            name: validApplication.contactName,
            email: validApplication.email,
            companyName: validApplication.companyName,
            abn: validApplication.abn,
            phone: validApplication.phone,
        });
    });

    it('sends SMS to applicant when phone is provided', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });

        const req = createMockRequest('POST', validApplication);
        await POST(req as any);

        expect(mockWholesaleApplicationReceivedSMS).toHaveBeenCalledWith(validApplication.contactName);
        expect(mockSendSMS).toHaveBeenCalledWith(validApplication.phone, 'SMS body');
    });

    it('still returns 201 even if email notification fails', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });
        mockSendWholesaleApplicationReceivedEmail.mockRejectedValue(new Error('Email failed'));

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);

        expect(res.status).toBe(201);
    });

    it('still returns 201 even if SMS notification fails', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });
        mockSendSMS.mockRejectedValue(new Error('SMS failed'));

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);

        expect(res.status).toBe(201);
    });

    // ── Validation ──

    it('rejects when companyName is missing', async () => {
        const { companyName, ...partial } = validApplication;
        const req = createMockRequest('POST', partial);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('All fields are required');
    });

    it('rejects when abn is missing', async () => {
        const { abn, ...partial } = validApplication;
        const req = createMockRequest('POST', partial);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('All fields are required');
    });

    it('rejects when contactName is missing', async () => {
        const { contactName, ...partial } = validApplication;
        const req = createMockRequest('POST', partial);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('All fields are required');
    });

    it('rejects when email is missing', async () => {
        const { email, ...partial } = validApplication;
        const req = createMockRequest('POST', partial);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('All fields are required');
    });

    it('rejects when phone is missing', async () => {
        const { phone, ...partial } = validApplication;
        const req = createMockRequest('POST', partial);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('All fields are required');
    });

    it('rejects when password is missing', async () => {
        const { password, ...partial } = validApplication;
        const req = createMockRequest('POST', partial);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('All fields are required');
    });

    it('rejects when password is shorter than 8 characters', async () => {
        const req = createMockRequest('POST', { ...validApplication, password: '1234567' });
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('Password must be at least 8 characters');
    });

    // ── Duplicate email ──

    it('rejects if email is already registered', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'existing-user',
            email: validApplication.email,
            role: 'WHOLESALE',
            wholesaleStatus: 'PENDING',
        });

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('Email already registered. Try signing in instead.');
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('rejects if email exists with APPROVED wholesale status', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'existing-user',
            email: validApplication.email,
            role: 'WHOLESALE',
            wholesaleStatus: 'APPROVED',
        });

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('Email already registered. Try signing in instead.');
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('rejects if email exists as a regular customer', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'existing-user',
            email: validApplication.email,
            role: 'CUSTOMER',
        });

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe('Email already registered. Try signing in instead.');
    });

    // ── Error handling ──

    it('returns 500 when database create throws an error', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockRejectedValue(new Error('DB connection failed'));

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to submit application');
    });

    it('returns 500 when findUnique throws an error', async () => {
        mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));

        const req = createMockRequest('POST', validApplication);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe('Failed to submit application');
    });

    it('does not send notifications when user creation fails', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockRejectedValue(new Error('DB error'));

        const req = createMockRequest('POST', validApplication);
        await POST(req as any);

        expect(mockSendWholesaleApplicationReceivedEmail).not.toHaveBeenCalled();
        expect(mockSendWholesaleNewApplicationAdminEmail).not.toHaveBeenCalled();
        expect(mockSendSMS).not.toHaveBeenCalled();
    });
});
