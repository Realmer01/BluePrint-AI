"use client"
import { useAuthContext } from '@/app/provider'
import { api } from '@/lib/apiClient';
import React, { useEffect, useState } from 'react'
import DesignCard from './_components/DesignCard';
import { RECORD } from '@/app/view-code/[uid]/page';

function Designs() {

    const { user } = useAuthContext();
    const [wireframeList, setWireframeList] = useState([]);
    useEffect(() => {
        user && GetAllUserWireframe();
    }, [user])

    const GetAllUserWireframe = async () => {

        const result = await api.get('/api/wireframe-to-code');
        setWireframeList(result.data);
    }

    return (
        <div>
            <h2 className='font-bold text-2xl'>Wireframe & Codes</h2>

            <div className='grid grid-cols-2 lg:grid-cols-3 gap-7 mt-10'>
                {wireframeList?.map((item: RECORD, index) => (
                    <DesignCard key={index} item={item} />
                ))}
            </div>
        </div>
    )
}

export default Designs