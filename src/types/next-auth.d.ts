import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        id: string;
        role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN';
        wholesaleStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    }

    interface Session {
        user: User & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN';
        wholesaleStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    }
}
