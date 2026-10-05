import React, { useEffect, useState } from 'react'
import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import Constants from '@/data/Constants';
import { aquaBlue } from "@codesandbox/sandpack-themes";
import { Button } from '@/components/ui/button';
import { Check, Code, Columns2, Copy, Download, FileCode, Loader2, Monitor, Save, Smartphone, Tablet, Eye } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { downloadFile, toFileSlug, toStandaloneHtml } from '@/lib/exportCode';
import { toast } from 'sonner';

type View = 'split' | 'code' | 'preview';
const DEVICES = {
    desktop: { width: '100%', icon: Monitor, label: 'Desktop' },
    tablet: { width: '768px', icon: Tablet, label: 'Tablet' },
    mobile: { width: '375px', icon: Smartphone, label: 'Mobile' },
};
type Device = keyof typeof DEVICES;
const HEIGHT = '75vh';

function ToggleButton({ active, onClick, title, children }: any) {
    return (
        <button title={title} onClick={onClick}
            className={`p-1.5 rounded-md transition-colors ${active ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}>
            {children}
        </button>
    )
}

// Lives inside SandpackProvider so it can read what the user typed in the editor
function Toolbar({ savedCode, onSave, onCodeChange, view, setView, device, setDevice, fileName }: any) {
    const { sandpack } = useSandpack();
    const code = sandpack.files['/App.js']?.code ?? '';
    const isDirty = code.trim() != (savedCode ?? '').trim();
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => { onCodeChange?.(code) }, [code])

    const save = async () => {
        setSaving(true);
        await onSave(code);
        setSaving(false);
    }

    const copy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
            <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1'>
                    <ToggleButton title='Code and preview' active={view == 'split'} onClick={() => setView('split')}><Columns2 className='h-4 w-4' /></ToggleButton>
                    <ToggleButton title='Code only' active={view == 'code'} onClick={() => setView('code')}><Code className='h-4 w-4' /></ToggleButton>
                    <ToggleButton title='Preview only' active={view == 'preview'} onClick={() => setView('preview')}><Eye className='h-4 w-4' /></ToggleButton>
                </div>
                {view == 'preview' && <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1'>
                    {(Object.keys(DEVICES) as Device[]).map((key) => {
                        const Icon = DEVICES[key].icon;
                        return <ToggleButton key={key} title={DEVICES[key].label} active={device == key} onClick={() => setDevice(key)}><Icon className='h-4 w-4' /></ToggleButton>
                    })}
                </div>}
            </div>
            <div className='flex items-center gap-2'>
                <Button size='sm' variant={isDirty ? 'default' : 'outline'} disabled={!isDirty || saving} onClick={save}>
                    {saving ? <Loader2 className='animate-spin' /> : <Save />} {isDirty ? 'Save changes' : 'Saved'}
                </Button>
                <Button size='sm' variant='outline' onClick={copy}>
                    {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy'}
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size='sm' variant='outline'><Download /> Download</Button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='w-64 p-2'>
                        <button className='w-full text-left p-2 rounded-md hover:bg-gray-100 flex gap-3'
                            onClick={() => { downloadFile(`${fileName}.html`, toStandaloneHtml(code, fileName), 'text/html'); toast.success('Downloaded. Double-click the file to open it.'); }}>
                            <Monitor className='h-5 w-5 mt-0.5 text-primary shrink-0' />
                            <span><span className='block text-sm font-medium'>HTML file</span>
                                <span className='block text-xs text-gray-500'>Opens in any browser, no setup needed</span></span>
                        </button>
                        <button className='w-full text-left p-2 rounded-md hover:bg-gray-100 flex gap-3'
                            onClick={() => downloadFile('App.jsx', code, 'text/javascript')}>
                            <FileCode className='h-5 w-5 mt-0.5 text-primary shrink-0' />
                            <span><span className='block text-sm font-medium'>React component (App.jsx)</span>
                                <span className='block text-xs text-gray-500'>Drop into a React + Tailwind project</span></span>
                        </button>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

function CodeEditor({ codeResp, isReady, onSave, onCodeChange, fileName = 'blueprint-page' }: any) {
    const [view, setView] = useState<View>('split');
    const [device, setDevice] = useState<Device>('desktop');

    const setup = {
        template: 'react' as const,
        theme: aquaBlue,
        customSetup: { dependencies: { ...Constants.DEPENDANCY } },
        options: { externalResources: ["https://cdn.tailwindcss.com"] },
    };

    // While the code streams in there's nothing to run yet, so only show the editor
    if (!isReady) {
        return (
            <SandpackProvider {...setup} files={{ "/App.js": { code: `${codeResp}`, active: true } }}>
                <SandpackLayout>
                    <SandpackCodeEditor showTabs={true} style={{ height: HEIGHT }} />
                </SandpackLayout>
            </SandpackProvider>
        )
    }

    return (
        <SandpackProvider {...setup} files={{ "/App.js": { code: `${codeResp}`, active: true } }}>
            <Toolbar savedCode={codeResp} onSave={onSave} onCodeChange={onCodeChange}
                view={view} setView={setView} device={device} setDevice={setDevice} fileName={toFileSlug(fileName)} />
            {/* Both panes stay mounted so switching views keeps edits and the running preview */}
            <SandpackLayout style={view == 'preview' ? { background: '#f3f4f6' } : undefined}>
                <SandpackCodeEditor showTabs={true} showLineNumbers={true} wrapContent
                    style={{ height: HEIGHT, display: view == 'preview' ? 'none' : undefined }} />
                <SandpackPreview showOpenInCodeSandbox={true}
                    style={{
                        height: HEIGHT,
                        display: view == 'code' ? 'none' : undefined,
                        ...(view == 'preview' ? { flex: 'none', width: DEVICES[device].width, maxWidth: '100%', margin: '0 auto' } : {}),
                    }} />
            </SandpackLayout>
        </SandpackProvider>
    )
}

export default CodeEditor
