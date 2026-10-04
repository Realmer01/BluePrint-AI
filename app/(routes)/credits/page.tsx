"use client"
import { useAuthContext } from '@/app/provider'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/apiClient'
import React, { useEffect, useState } from 'react'

function Credits() {

    const { user } = useAuthContext();
    const [userData, setUserData] = useState<any>();
    useEffect(() => {
        user && GetUserCredits();
    }, [user])

    const GetUserCredits = async () => {
        const result = await api.get('/api/user');
        setUserData(result.data);
    }

    return (
        <div>
            <h2 className='font-bold text-2xl'>Credits</h2>

            <div className='p-5 bg-slate-50 rounded-xl border
             flex justify-between items-center mt-6'>
                <div>
                    <h2 className='font-bold text-xl'>My Credits:</h2>
                    <p className='text-lg text-gray-500'>
                        {userData ? `${userData.credits ?? 0} ${userData.credits == 1 ? 'credit' : 'credits'} left` : 'Loading...'}
                    </p>
                    <p className='text-sm text-gray-400 mt-1'>Each new design and each requested change uses 1 credit. Regenerating an existing design is free.</p>
                </div>
                <Button disabled>More credits coming soon</Button>
            </div>
        </div>
    )
}

export default Credits