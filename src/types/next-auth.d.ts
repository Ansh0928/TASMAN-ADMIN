import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface User extends DefaultUser {
        role?: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN';
        wholesaleStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    }

    interface Session {
        user: {
            id: string;
            role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN';
            wholesaleStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id?: string;
        role?: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN';
        wholesaleStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    }
}
