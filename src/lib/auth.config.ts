import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config (no Node.js modules like pg/prisma)
// Used by middleware for route protection
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.wholesaleStatus = (user as any).wholesaleStatus;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.wholesaleStatus = token.wholesaleStatus as string | null;
            }
            return session;
        },
    },
    providers: [], // Providers added in full auth.ts
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
};
