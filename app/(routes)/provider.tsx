"use client"
import React, { useEffect } from 'react'
import { useAuthContext } from '../provider';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import axios from "axios";
import AppHeader from '../_components/AppHeader';
import { AppSidebar } from '../_components/AppSidebar';
import { auth } from '@/configs/firebaseConfig';

function DashboardProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const user = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        // Wait for Firebase to restore the session before deciding the user is signed out
        auth.authStateReady().then(() => {
            if (!auth.currentUser) router.replace('/')
        })
    }, [])

    useEffect(() => {
        user?.user && checkUser()
    }, [user])


    const checkUser = async () => {
        const result = await axios.post('/api/user', {
            userName: user?.user?.displayName,
            userEmail: user?.user?.email
        });
        console.log(user);
    }


    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full'>
                <AppHeader />
                {/* <SidebarTrigger /> */}
                <div className='p-10'>{children}</div>
            </main>
        </SidebarProvider>

    )
}

export default DashboardProvider