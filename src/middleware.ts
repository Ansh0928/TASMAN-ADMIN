import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that checks for session cookie
// Full auth + role validation happens at the page/API level
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                         request.cookies.get('__Secure-authjs.session-token')?.value;

    const isLoggedIn = !!sessionToken;

    if (!isLoggedIn) {
        // Route to the correct login page based on the protected area
        let loginPath = '/auth/login';
        if (pathname.startsWith('/admin')) {
            loginPath = '/admin/login';
        } else if (pathname.startsWith('/wholesale/prices')) {
            loginPath = '/wholesale/login';
        }

        const loginUrl = new URL(loginPath, request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/((?!login).*)',   // protect /admin/* except /admin/login
        '/wholesale/prices',
        '/account/:path*',
    ],
};
