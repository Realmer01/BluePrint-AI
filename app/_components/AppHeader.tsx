import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import ProfileAvatar from './ProfileAvatar'
import Image from 'next/image'

function AppHeader({ hideSidebar = false }) {
    return (
        <div className='h-16 px-4 border-b border-gray-200 bg-white flex items-center justify-between w-full'>
            {!hideSidebar ? <SidebarTrigger /> :
                <a href='/designs' className='flex items-center gap-2'>
                    <Image src={'/logo.svg'} alt='logo' width={100} height={100}
                        className='w-9 h-9' />
                    <h2 className='font-bold text-lg'>BlueprintAI</h2>
                </a>
            }
            <ProfileAvatar />
        </div>
    )
}

export default AppHeader