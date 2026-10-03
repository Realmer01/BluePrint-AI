import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';

// Verifying ID tokens only needs the project ID (Google's public keys), no service account
const adminApp = getApps()[0] ?? initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });

export interface AuthUser {
    email: string,
    name: string
}

// Returns the signed-in user from the "Authorization: Bearer <Firebase ID token>" header, or null
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
    const header = req.headers.get('authorization') ?? '';
    if (!header.startsWith('Bearer ')) return null;
    try {
        const decoded = await getAuth(adminApp).verifyIdToken(header.slice(7));
        if (!decoded.email) return null;
        return { email: decoded.email, name: decoded.name ?? decoded.email.split('@')[0] };
    } catch {
        return null;
    }
}

export const unauthorized = () =>
    NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

export const serverError = (e: unknown) => {
    console.error(e);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
