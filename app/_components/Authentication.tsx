"use client"
import { auth } from '@/configs/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react'
import { toast } from 'sonner'

function Authentication({ children }: any) {
    const provider = new GoogleAuthProvider();

    const onButtonPress = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential: any = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log(user);
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                console.error('Sign-in failed:', error.code, error.message);
                if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return;
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