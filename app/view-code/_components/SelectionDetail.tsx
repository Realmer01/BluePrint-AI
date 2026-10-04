import React, { useState } from 'react'
import { RECORD } from '../[uid]/page'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RefreshCcw, WandSparkles } from 'lucide-react'

const MAX_CHANGES_LENGTH = 1000;

function SelectionDetail({ record, regenrateCode, applyChanges, isReady, hasCode }: any) {
    const [changes, setChanges] = useState('');

    const onApplyChanges = async () => {
        // Keep the text if it fails so the user can retry without retyping
        if (await applyChanges(changes.trim())) setChanges('');
    }

    return record && (
        <div className='p-5 bg-gray-100  rounded-lg'>
            <h2 className='font-bold my-2'>Wireframe</h2>
            <Image src={record?.imageUrl} alt='Wireframe' width={300} height={400}
                className='rounded-lg object-contain h-[200px] w-full border  border-dashed p-2 bg-white'
            />

            <h2 className='font-bold mt-4 mb-2'>AI Model</h2>
            <Input defaultValue={record?.model} disabled={true} className='bg-white' />

            <h2 className='font-bold mt-4 mb-2'>Description</h2>
            <Textarea defaultValue={record?.description} disabled={true}
                className='bg-white h-[100px]' />

            <Button className='mt-5 w-full' variant='outline' disabled={!isReady} onClick={() => regenrateCode()} > <RefreshCcw /> Regenerate Code</Button>
            <p className='text-xs text-gray-500 mt-1 text-center'>Starts over from the wireframe. Free.</p>

            <h2 className='font-bold mt-6 mb-2'>Request Changes</h2>
            <Textarea value={changes}
                onChange={(e) => setChanges(e.target.value)}
                maxLength={MAX_CHANGES_LENGTH}
                disabled={!isReady || !hasCode}
                placeholder='e.g. Make the header dark blue, add a pricing section with 3 plans'
                className='bg-white h-[100px]' />
            <Button className='mt-3 w-full' disabled={!isReady || !hasCode || !changes.trim()} onClick={onApplyChanges}>
                <WandSparkles /> Apply Changes
            </Button>
            <p className='text-xs text-gray-500 mt-1 text-center'>Edits the current code. Uses 1 credit.</p>
        </div>
    )
}

export default SelectionDetail
