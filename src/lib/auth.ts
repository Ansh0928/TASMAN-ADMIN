import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user) {
                    throw new Error('Invalid email or password');
                }

                // Google-only users can't log in with credentials
                if (!user.passwordHash) {
                    throw new Error('This account uses Google sign-in. Please use the Google button.');
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!passwordMatch) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    wholesaleStatus: user.wholesaleStatus,
                };
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            // For Google sign-in: find or create the user in our DB
            if (account?.provider === 'google') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    if (existingUser) {
                        // User exists — update their Google info if needed
                        if (!existingUser.authProvider || existingUser.authProvider !== 'google') {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    image: user.image || existingUser.image,
                                    // Mark that this user has also used Google
                                    authProvider: existingUser.passwordHash ? 'both' : 'google',
                                },
                            });
                        }
                        // Attach the DB id to the user object for JWT
                        user.id = existingUser.id;
                        (user as any).role = existingUser.role;
                        (user as any).wholesaleStatus = existingUser.wholesaleStatus;
                    } else {
                        // Create new user from Google profile
                        const newUser = await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name || 'Google User',
                                image: user.image,
                                authProvider: 'google',
                                // No passwordHash — this is a Google-only user
                            },
                        });
                        user.id = newUser.id;
                        (user as any).role = newUser.role;
                        (user as any).wholesaleStatus = newUser.wholesaleStatus;
                    }
                    return true;
                } catch (error) {
                    console.error('Google sign-in error:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // On initial sign-in, store user data in token
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
});
