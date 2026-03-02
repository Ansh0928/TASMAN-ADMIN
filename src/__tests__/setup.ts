import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// Mock localStorage for jsdom environment
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = String(value); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] ?? null,
    };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Mock Next.js modules
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        refresh: vi.fn(),
    }),
    useParams: () => ({}),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-auth/react', () => ({
    useSession: () => ({ data: null, status: 'unauthenticated' }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'test-vapid-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.RESEND_API_KEY = 're_test_fake';
process.env.TWILIO_ACCOUNT_SID = 'AC_test';
process.env.TWILIO_AUTH_TOKEN = 'test_token';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
process.env.AWS_S3_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'AKIATEST';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BFKuqHx9mU-SeFRUq1M5BGxIM3f2avsD5z4YOIZnumq8cZXrMNXE_VNj1MR3B95x5Xls9Q-RUM04Vl5ZKoaQ8z8';
process.env.VAPID_PRIVATE_KEY = 'WeJQj6FJ_Sf5PR5-zdsArb_m8jzvkkzwCzJ2KWWExJY';
