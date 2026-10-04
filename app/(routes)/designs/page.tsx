"use client"
import { useAuthContext } from '@/app/provider'
import { api, getApiError } from '@/lib/apiClient';
import React, { useEffect, useState } from 'react'
import DesignCard from './_components/DesignCard';
import { RECORD } from '@/app/view-code/[uid]/page';
import { Button } from '@/components/ui/button';
import { Loader2, Paintbrush } from 'lucide-react';
import Link from 'next/link';

function Designs() {

    const { user } = useAuthContext();
    const [wireframeList, setWireframeList] = useState<RECORD[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        user && GetAllUserWireframe();
    }, [user])

    const GetAllUserWireframe = async () => {
        setLoading(true);
        try {
            const result = await api.get('/api/wireframe-to-code');
            setWireframeList(result.data);
            setError('');
        } catch (e) {
            setError(getApiError(e, 'Could not load your designs.'));
        }
        setLoading(false);
    }

    return (
        <div>
            <h2 className='font-bold text-2xl'>Wireframe & Codes</h2>

            {loading ? <div className='flex items-center justify-center gap-2 mt-20 text-gray-500'>
                <Loader2 className='animate-spin' /> Loading your designs...
            </div> :
            error ? <div className='mt-20 text-center text-gray-500'>
                <p>{error}</p>
                <Button variant='outline' className='mt-4' onClick={GetAllUserWireframe}>Try again</Button>
            </div> :
            wireframeList.length == 0 ? <div className='mt-20 flex flex-col items-center text-center text-gray-500'>
                <Paintbrush className='h-10 w-10 text-primary' />
                <p className='mt-3'>You haven&apos;t converted any wireframes yet.</p>
                <Link href='/dashboard'><Button className='mt-4'>Convert your first wireframe</Button></Link>
            </div> :
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10'>
                {wireframeList.map((item) => (
                    <DesignCard key={item.uid} item={item} />
                ))}
            </div>}
        </div>
    )
}

export default Designs