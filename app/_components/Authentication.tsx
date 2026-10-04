"use client"
import { auth } from '@/configs/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react'
import { toast } from 'sonner'

function Authentication({ children }: any) {
    const provider = new GoogleAuthProvider();

    const onButtonPress = () => {
        // The signed-in user reaches the app through onAuthStateChanged in app/provider.tsx
        signInWithPopup(auth, provider)
            .catch((error) => {
                // Closing the popup (or clicking sign-in twice) isn't an error worth reporting
                if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return;
                console.warn('Sign-in failed:', error.code);
                if (error.code === 'auth/unauthorized-domain') {
                    toast.error('Sign-in is not enabled for this domain yet. Add it to Firebase Authorized domains.');
                } else if (error.code === 'auth/popup-blocked') {
                    toast.error('Your browser blocked the sign-in popup. Allow popups for this site and try again.');
                } else {
                    toast.error(`Sign-in failed: ${error.code || error.message}`);
                }
            });
    }
    return (
        <div>
            <div onClick={onButtonPress}>
                {children}
            </div>
        </div>
    )
}

export default Authentication