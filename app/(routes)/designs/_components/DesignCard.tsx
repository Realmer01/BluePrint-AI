import { Button } from '@/components/ui/button'
import Constants from '@/data/Constants'
import { api, getApiError } from '@/lib/apiClient'
import { Code, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'sonner'

function DesignCard({ item, onDeleted }: any) {
    const modelObj = item && Constants.AiModelList.find((x => x.name == item?.model))
    const [deleting, setDeleting] = useState(false);

    const onDelete = async () => {
        if (!confirm('Delete this design and its code? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await api.delete('/api/wireframe-to-code?uid=' + item.uid);
            onDeleted?.(item.uid);
            toast.success('Design deleted.');
        } catch (e) {
            toast.error(getApiError(e, 'Could not delete this design.'));
            setDeleting(false);
        }
    }

    return (
        <div className='p-5 border rounded-lg flex flex-col'>
            <Image src={item?.imageUrl} alt='image'
                width={300} height={200}
                className='w-full h-[200px] object-cover bg-white rounded-lg'
            />

            <div className='mt-2 flex flex-col flex-1'>
                <h2 className='line-clamp-3 text-gray-400 text-sm'>{item?.description}</h2>
                <div className='flex justify-between items-center gap-2 mt-auto pt-4'>
                    <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-full min-w-0'>
                        {modelObj && <Image src={modelObj?.icon} alt={modelObj?.modelName ?? ''}
                            width={24}
                            height={24}
                        />}
                        <h2 className='text-sm truncate'>{modelObj?.name ?? item?.model}</h2>
                    </div>
                    <div className='flex items-center gap-1 shrink-0'>
                        <Button variant='ghost' size='icon' title='Delete design' disabled={deleting} onClick={onDelete}
                            className='text-gray-400 hover:text-red-600'>
                            {deleting ? <Loader2 className='animate-spin' /> : <Trash2 />}
                        </Button>
                        <Link href={'/view-code/' + item?.uid}>
                            <Button> <Code /> {item?.code?.resp ? 'View Code' : 'Generate'}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DesignCard
