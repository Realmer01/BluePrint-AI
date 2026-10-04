"use client"
import { auth } from '@/configs/firebaseConfig';
import { signOut } from 'firebase/auth';
import React from 'react'
import { useAuthContext } from '../provider';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';

function ProfileAvatar() {

    const user = useAuthContext();
    const router = useRouter();
    const displayName = user?.user?.displayName || user?.user?.email?.split('@')[0] || '';
    const firstName = displayName.split(' ')[0];

    const onButtonPress = () => {
        signOut(auth).then(() => {
            router.replace('/')
        }).catch(() => { });
    }
    return (
        <Popover>
            <PopoverTrigger className='flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 hover:bg-gray-50 transition-colors'>
                {user?.user?.photoURL
                    ? <img src={user.user.photoURL} alt='profile' className='w-8 h-8 rounded-full' referrerPolicy='no-referrer' />
                    // Accounts without a photo still need something to click to log out
                    : <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold'>
                        {(displayName || '?')[0].toUpperCase()}
                    </div>}
                <span className='text-sm font-medium text-gray-700 max-w-[120px] truncate'>{firstName}</span>
                <ChevronDown className='h-4 w-4 text-gray-400' />
            </PopoverTrigger>
            <PopoverContent align='end' className='w-56 p-2'>
                <div className='px-2 py-1.5'>
                    <p className='text-sm font-medium truncate'>{displayName}</p>
                    <p className='text-xs text-gray-500 truncate'>{user?.user?.email}</p>
                </div>
                <div className='my-1 h-px bg-gray-100' />
                <Button variant='ghost' onClick={onButtonPress} className='w-full justify-start'>
                    <LogOut /> Logout
                </Button>
            </PopoverContent>
        </Popover>
    )
}

export default ProfileAvatar
