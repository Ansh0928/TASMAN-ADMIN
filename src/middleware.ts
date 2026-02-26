import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that checks for session cookie
// Full auth + role validation happens at the page/API level
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                         request.cookies.get('__Secure-authjs.session-token')?.value;

    const isLoggedIn = !!sessionToken;

    // Protect admin, wholesale, and account routes - redirect to login if no session
    if (!isLoggedIn) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/wholesale/prices', '/account/:path*'],
};
