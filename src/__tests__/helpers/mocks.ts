import { vi } from 'vitest';

// ── Prisma Mock ──
export const prismaMock = {
    product: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    category: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
    },
    order: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
    },
    orderItem: {
        findMany: vi.fn(),
        createMany: vi.fn(),
    },
    user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    notification: {
        findMany: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
    },
    processedWebhookEvent: {
        findUnique: vi.fn(),
        create: vi.fn(),
    },
    pushSubscription: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
    },
    wholesaleCategory: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    wholesalePriceItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    wholesaleOrder: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
    },
    wholesaleOrderItem: {
        createMany: vi.fn(),
    },
    address: {
        findMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ id: 'prod-1' }]),
    $transaction: vi.fn((fn: any) => fn(prismaMock)),
};

// ── Stripe Mock ──
export const stripeMock = {
    checkout: {
        sessions: {
            create: vi.fn(),
            retrieve: vi.fn(),
        },
    },
    customers: {
        list: vi.fn(),
        create: vi.fn(),
    },
    webhooks: {
        constructEvent: vi.fn(),
    },
    invoices: {
        retrieve: vi.fn(),
    },
    promotionCodes: {
        list: vi.fn(),
    },
    coupons: {
        retrieve: vi.fn(),
    },
    refunds: {
        create: vi.fn(),
    },
};

// ── Resend Mock ──
export const resendMock = {
    emails: {
        send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
};

// ── Twilio Mock ──
export const twilioMock = {
    sendSMS: vi.fn().mockResolvedValue({ success: true, sid: 'SM_test' }),
};

// ── S3 Mock ──
export const s3Mock = {
    generatePresignedUploadUrl: vi.fn().mockResolvedValue('https://s3.amazonaws.com/presigned-url'),
    generateImageKey: vi.fn().mockReturnValue('products/test-image.jpg'),
    getPublicUrl: vi.fn().mockReturnValue('https://test-bucket.s3.us-east-1.amazonaws.com/products/test-image.jpg'),
    deleteObject: vi.fn().mockResolvedValue(undefined),
};

// ── Web Push Mock ──
export const webPushMock = {
    sendPushNotification: vi.fn().mockResolvedValue(undefined),
};

// ── Auth Mock ──
export function mockAuth(user: { id: string; role: string; email?: string; wholesaleStatus?: string } | null) {
    return vi.fn().mockResolvedValue(
        user
            ? { user: { id: user.id, role: user.role, email: user.email || 'test@test.com', wholesaleStatus: user.wholesaleStatus } }
            : null
    );
}

export function mockAdminAuth(isAdmin: boolean) {
    if (isAdmin) {
        return vi.fn().mockResolvedValue({ error: null, session: { user: { id: 'admin-1', role: 'ADMIN' } } });
    }
    return vi.fn().mockResolvedValue({
        error: new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 }),
    });
}

// ── Next.js Request/Response helpers ──
export function createMockRequest(method: string, body?: any, searchParams?: Record<string, string>): Request {
    const url = new URL('http://localhost:3000/api/test');
    if (searchParams) {
        Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const init: RequestInit = { method };
    if (body) {
        init.body = JSON.stringify(body);
        init.headers = { 'Content-Type': 'application/json' };
    }
    return new Request(url.toString(), init);
}

// ── Sample data factories ──
export const factories = {
    product: (overrides = {}) => ({
        id: 'prod-1',
        name: 'Atlantic Salmon',
        slug: 'atlantic-salmon',
        description: 'Fresh Atlantic Salmon',
        price: '29.99',
        imageUrls: ['https://example.com/salmon.jpg'],
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'Fish', slug: 'fish' },
        unit: 'KG',
        stockQuantity: 50,
        isAvailable: true,
        isFeatured: false,
        isTodaysSpecial: false,
        tags: ['fresh', 'popular'],
        relatedProductIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    category: (overrides = {}) => ({
        id: 'cat-1',
        name: 'Fish',
        slug: 'fish',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    user: (overrides = {}) => ({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+61400000000',
        role: 'CUSTOMER',
        wholesaleStatus: null,
        businessName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    order: (overrides = {}) => ({
        id: 'order-1',
        userId: 'user-1',
        status: 'PENDING',
        total: '109.89',
        subtotal: '89.99',
        gst: '9.00',
        tax: '9.00',
        deliveryFee: '10.00',
        fulfillment: 'DELIVERY',
        stripeSessionId: 'cs_test_123',
        stripePaymentIntent: null,
        stripeInvoiceId: null,
        stripeInvoiceUrl: null,
        guestEmail: 'test@example.com',
        guestName: 'Test User',
        guestPhone: '+61400000000',
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        deliveryAddress: '123 Test St',
        deliveryStreet: null,
        deliveryCity: null,
        deliveryState: null,
        deliveryPostcode: null,
        pickupTime: null,
        notes: null,
        discountCode: null,
        discountAmount: '0',
        refundStatus: 'NONE',
        refundedAmount: '0',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    wholesalePriceItem: (overrides = {}) => ({
        id: 'wpi-1',
        name: 'Bulk Salmon',
        unit: 'KG',
        price: '19.99',
        categoryId: 'wcat-1',
        category: { id: 'wcat-1', name: 'Fresh Fish' },
        isTodaysSpecial: false,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    }),

    wholesaleOrder: (overrides = {}) => ({
        id: 'wo-1',
        userId: 'user-1',
        status: 'PENDING',
        notes: 'Test order',
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', name: 'Test Wholesaler', email: 'ws@test.com', phone: '+61400000000', businessName: 'Test Business' },
        items: [],
        ...overrides,
    }),

    pushSubscription: (overrides = {}) => ({
        id: 'ps-1',
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
        userId: 'user-1',
        createdAt: new Date(),
        ...overrides,
    }),
};
