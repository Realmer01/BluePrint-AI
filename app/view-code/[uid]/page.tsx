"use client"
import AppHeader from '@/app/_components/AppHeader'
import { api, getApiError, getAuthHeaders } from '@/lib/apiClient'
import { extractCode } from '@/lib/extractCode'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import SelectionDetail from '../_components/SelectionDetail'
import CodeEditor from '../_components/CodeEditor'

export interface RECORD {
    id: number,
    description: string,
    code: any,
    imageUrl: string,
    model: string,
    createdBy: string,
    uid: string
}

function ViewCode() {

    const { uid } = useParams();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [codeResp, setCodeResp] = useState('');
    const [record, setRecord] = useState<RECORD | null>();
    const [isReady, setIsReady] = useState(false);
    const [pageError, setPageError] = useState('');
    useEffect(() => {
        uid && GetRecordInfo();
    }, [uid])

    const GetRecordInfo = async (regen = false) => {
        setLoading(true)
        try {
            const result = await api.get('/api/wireframe-to-code?uid=' + uid)
            const resp: RECORD = result.data;
            setRecord(resp)

            // No saved code yet (new design, or its first attempt failed) -> generate it
            if (!resp?.code?.resp || regen) {
                await GenerateCode(resp, regen ? codeResp : '');
            }
            else {
                setCodeResp(resp.code.resp);
                setIsReady(true);
                setLoading(false);
            }
        } catch (e) {
            setLoading(false);
            setPageError(getApiError(e, 'Could not load this design.'));
        }
    }

    // Streams generated code into the editor. The server saves it once the stream completes.
    const GenerateCode = async (record: RECORD, previousCode: string) => {
        setLoading(true)
        setGenerating(true)
        setIsReady(false)
        // On failure keep whatever code was showing before, so a failed regenerate loses nothing
        const fail = (message: string) => {
            toast.error(message);
            setCodeResp(previousCode);
            setIsReady(!!previousCode);
            setLoading(false);
            setGenerating(false);
        }

        try {
            const res = await fetch('/api/ai-model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
                body: JSON.stringify({ uid: record.uid })
            });

            if (!res.ok || !res.body) {
                const data = await res.json().catch(() => ({}));
                return fail(data.error ?? 'Code generation failed. Please try Regenerate.');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            // Fences can be split across chunks, so extract from the full text each time
            let rawText = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                rawText += decoder.decode(value, { stream: true });
                setLoading(false);
                setCodeResp(extractCode(rawText));
            }

            const finalCode = extractCode(rawText).trim();
            if (!finalCode) return fail('The AI returned no code. Please try Regenerate.');
            setCodeResp(finalCode);
            setIsReady(true);
            setLoading(false);
            setGenerating(false);
        } catch (e) {
            fail('The AI stopped responding partway through. Please try Regenerate.');
        }
    }



    return (
        <div>
            <AppHeader hideSidebar={true} />
            <div className='grid grid-cols-1 md:grid-cols-5 p-5 gap-10'>
                <div>
                    {/* Selection Details  */}
                    <SelectionDetail record={record} regenrateCode={() => { GetRecordInfo(true) }}
                        isReady={!loading && !generating}
                    />
                </div>
                <div className='col-span-4'>
                    {/* Code Editor  */}
                    {pageError ? <div>
                        <h2 className='font-bold text-xl text-center p-20 flex items-center justify-center
                        bg-slate-100 h-[80vh] rounded-xl text-gray-500'>{pageError}</h2>
                    </div> :
                    loading ? <div>
                        <h2 className='font-bold text-2xl text-center p-20 flex items-center justify-center
                        bg-slate-100 h-[80vh] rounded-xl
                        '> <Loader2 className='animate-spin' /> Anaylzing the Wireframe...</h2>
                    </div> :
                        <CodeEditor codeResp={codeResp} isReady={isReady}
                        />
                    }
                </div>
            </div>




        </div>
    )
}

export default ViewCode