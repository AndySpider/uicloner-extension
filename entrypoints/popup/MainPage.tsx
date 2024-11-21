import { useState } from 'react';
import './style.css';
import { useCurrentCloneTask } from './useCurrentCloneTask';
import { Button } from '@/components/ui/button';
import { SquareMousePointer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CodeStack } from '@/lib/types';
import { AClone } from './AClone';
import { PageNav } from './PageNav';
import { LLMSettingsDialog } from './LLMSettingsDialog';

export function MainPage() {
    const curCloneTask = useCurrentCloneTask();
    const [selectedStack, setSelectedStack] = useState<CodeStack>('html_tailwind');

    // load the selected stack from storage
    useEffect(() => {
        browser.storage.local.get('selected_stack').then((stackRet) => {
            const stack = stackRet['selected_stack'] || 'html_tailwind';
            setSelectedStack(stack);
        });
    }, []);

    const handleCaptureArea = () => {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                browser.tabs.sendMessage(tabs[0].id, { action: 'startCapturing', stack: selectedStack }, (response) => {
                    if (response?.ok) {
                        window.close(); // close popup after started
                    }
                });
            }
        });
    };

    const handleStackChange = (stack: CodeStack) => {
        setSelectedStack(stack);
        browser.storage.local.set({ selected_stack: stack });
    };

    const isGenerateWIP = !!curCloneTask && (curCloneTask.state !== 'generateDone' && curCloneTask.state !== 'generateError');
    const hasCurrentCloneTask = !!(curCloneTask && curCloneTask.srcUI);

    const leftAction = (
        <div className='flex justify-start items-center gap-2 text-primary'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleCaptureArea} variant="outline" size="sm" disabled={isGenerateWIP}><SquareMousePointer /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Select an UI from the page to clone. (Alt + Shift + S)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Select value={selectedStack} onValueChange={handleStackChange} disabled={isGenerateWIP}>
                <SelectTrigger className='w-[160px] h-9'>
                    <SelectValue placeholder="Select Stack" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="html_tailwind">HTML + Tailwind</SelectItem>
                    <SelectItem value="html_css">HTML + CSS</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    const rightAction = (
        <LLMSettingsDialog />
    );

    return (
        <div className='w-full h-full'>
            <PageNav leftAction={leftAction} rightAction={rightAction} />

            <div className='p-5 w-full relative'>
                {
                    hasCurrentCloneTask ?
                        <>
                            <AClone task={curCloneTask} />
                        </>
                        :
                        <div className='mt-10 text-center text-base text-slate-600 italic'>
                            <p>Click <SquareMousePointer className='inline w-5' /> to select an UI from the page to clone.</p>
                        </div>
                }
            </div>
        </div>
    );
}
