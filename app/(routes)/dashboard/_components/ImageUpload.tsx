"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CloudUpload, Loader2Icon, WandSparkles, X } from 'lucide-react'
import Image from 'next/image'
//@ts-ignore
import uuid4 from "uuid4";
import React, { ChangeEvent, DragEvent, useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api, getApiError } from '@/lib/apiClient'
import { useRouter } from 'next/navigation'
import Constants from '@/data/Constants'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // before compression; it's shrunk well below this

// Shrink the wireframe to at most 1280px and re-encode as JPEG so it fits in the database
const compressImage = (file: File, maxSize = 1280): Promise<string> =>
    new Promise((resolve, reject) => {
        const img = new window.Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff'; // transparent PNGs would otherwise turn black
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Could not read image'));
        };
        img.src = objectUrl;
    });

function ImageUpload() {

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [file, setFile] = useState<any>();
    const [model, setModel] = useState<string>();
    const [description, setDescription] = useState<string>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const selectFile = (selected?: File | null) => {
        if (!selected) return;
        if (!selected.type.startsWith('image/')) {
            toast.error('Please choose an image file (PNG or JPG).');
            return;
        }
        if (selected.size > MAX_FILE_SIZE) {
            toast.error('That image is too large. Please use one under 10 MB.');
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    }

    const clearFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(undefined);
        setPreviewUrl(null);
    }

    // Lets users paste a screenshot straight from the clipboard (Ctrl+V)
    useEffect(() => {
        const onPaste = (event: ClipboardEvent) => {
            const pasted = Array.from(event.clipboardData?.files ?? []).find(f => f.type.startsWith('image/'));
            if (pasted) selectFile(pasted);
        }
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, [previewUrl])

    const OnImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        selectFile(event.target.files?.[0]);
        event.target.value = ''; // so picking the same file again still triggers onChange
    }

    const OnDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        selectFile(event.dataTransfer.files?.[0]);
    }

    const OnConverToCodeButtonClick = async () => {
        if (!file) return toast.error('Please upload a wireframe image first.');
        if (!model) return toast.error('Please select an AI model.');
        if (!description?.trim()) return toast.error('Please describe your web page.');
        setLoading(true);
        try {
            // Image is stored with the design in the database as a compressed data URL
            const imageUrl = await compressImage(file);

            const uid = uuid4();
            // Save Info To Database (the signed-in user comes from the auth token)
            await api.post('/api/wireframe-to-code', {
                uid: uid,
                description: description,
                imageUrl: imageUrl,
                model: model
            });
            router.push('/view-code/' + uid);
        } catch (e) {
            toast.error(e instanceof Error && e.message == 'Could not read image'
                ? 'Could not read that image. Please choose a PNG or JPG file.'
                : getApiError(e));
            setLoading(false);
        }
    }

    return (
        <div className='mt-10'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                {!previewUrl ? <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={OnDrop}
                    className={`p-7 border border-dashed rounded-md shadow-md
                flex flex-col items-center justify-center transition-colors
                ${dragging ? 'border-primary bg-blue-50' : ''}`}>
                    <CloudUpload className='h-10 w-10 text-primary' />
                    <h2 className='font-bold text-lg'>Upload Image</h2>

                    <p className='text-gray-400 mt-2 text-center'>Drag and drop your wireframe here, paste it with Ctrl+V, or select a file</p>
                    <div className='p-5 border border-dashed w-full flex mt-4 justify-center'>
                        <label htmlFor='imageSelect'>
                            <h2 className='p-2 bg-blue-100 font-bold text-primary  rounded-md px-5'>Select Image</h2>
                        </label>

                    </div>
                    <input type="file" id='imageSelect'
                        accept='image/*'
                        className='hidden'
                        multiple={false}
                        onChange={OnImageSelect}
                    />

                </div> :
                    <div className='p-5 border border-dashed'>
                        <Image src={previewUrl} alt='preview' width={500} height={500}
                            className='w-full h-[250px] object-contain'
                        />
                        <Button variant='ghost' size='sm' className='mt-2 w-full' onClick={clearFile}>
                            <X /> Remove image
                        </Button>

                    </div>
                }
                <div className='p-7 border shadow-md rounded-lg'>

                    <h2 className='font-bold text-lg'>Select AI Model</h2>
                    <Select onValueChange={(value) => setModel(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select AI Model" />
                        </SelectTrigger>
                        <SelectContent>
                            {Constants?.AiModelList.map((model, index) => (
                                <SelectItem value={model.name} key={index} >
                                    <div className='flex items-center gap-2'>
                                        <Image src={model.icon} alt={model.name} width={25} height={25} />
                                        <h2> {model.name}</h2>
                                    </div>

                                </SelectItem>

                            ))}

                        </SelectContent>
                    </Select>

                    <h2 className='font-bold text-lg mt-7'>Enter Description about your webpage</h2>
                    <Textarea
                        onChange={(event) => setDescription(event?.target.value)}
                        className='mt-3 h-[150px]'
                        placeholder='Write about your web page' />
                </div>
            </div>

            <div className='mt-10 flex items-center justify-center'>
                <Button onClick={OnConverToCodeButtonClick} disabled={loading}>
                    {loading ? <Loader2Icon className=' animate-spin' /> : <WandSparkles />}
                    Convert to Code</Button>
            </div>
        </div>
    )
}

export default ImageUpload