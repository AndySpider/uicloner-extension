import { CloneTask } from '@/lib/types';
import { useState, useEffect } from 'react';

export function useCurrentCloneTask() {
    const [task, setTask] = useState<CloneTask | undefined>();

    useEffect(() => {
        browser.runtime.sendMessage({
            action: 'GET_CLONE_TASK'
        }, (task) => {
            setTask(task);
        });

        const listener = (message: any) => {
            if (message.action === 'CLONE_TASK_CHANGED') {
                setTask(message.payload);
            }
        }
        const port = browser.runtime.connect({ name: 'popup' });
        port.onMessage.addListener(listener);
        return () => port.onMessage.removeListener(listener);
    }, []);

    return task;
};