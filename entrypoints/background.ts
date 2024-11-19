import { generateCodeStream } from "@/lib/llm";
import { CloneTask, CloneTaskState, CodeStack } from "@/lib/types";

let popupPort: any;

let curCloneTask: CloneTask | undefined;

function createCloneTask(stack: CodeStack, srcUrl: string) {
    curCloneTask = {
        state: 'captureStarted',
        srcUI: undefined,
        stack: stack,
        code: '',
        srcUrl,
    };

    if (popupPort) {
        popupPort.postMessage({
            action: 'CLONE_TASK_CHANGED',
            payload: curCloneTask
        });
    }
}

function updateCloneTask(newState: CloneTaskState,
    srcUI?: { image: string, width: number, height: number }, codeGenerated?: string, errMsg?: string) {
    if (curCloneTask) {
        curCloneTask.state = newState;
        if (srcUI) {
            curCloneTask.srcUI = srcUI;
        }
        if (codeGenerated) {
            curCloneTask.code = codeGenerated;
        }

        if (errMsg) {
            curCloneTask.errorMsg = errMsg;
        }

        if (popupPort) {
            popupPort.postMessage({
                action: 'CLONE_TASK_CHANGED',
                payload: curCloneTask
            });
        }
    }
}


// return null if code is not wrapped by ```html and ```
function extractHTMLContent(code: string): string | null {
    // Use regex to match content between ```html\n and \n```
    const regex = /```html([\s\S]*?)```/;

    const match = code.match(regex);

    if (match && match[1]) {
        return match[1].trim();
    } else {
        return null;
    }
}

async function generateCode(uiImage: string, stack: string): Promise<void> {
    if (!curCloneTask) {
        return;
    }

    try {
        // get saved setting and call LLM API to generate code in stream mode
        const result = await browser.storage.local.get(['apiKey', 'apiEndpoint', 'model']);

        if (result.apiKey && result.apiEndpoint && result.model) {
            await generateCodeStream(result.apiKey, result.model, result.apiEndpoint, uiImage, stack, (chunk) => {
                updateCloneTask('generating', undefined, curCloneTask!.code + chunk);
            });

            // when done, check to remove the html remarkers
            const stripedCode = extractHTMLContent(curCloneTask.code);

            if (stripedCode) {
                updateCloneTask('generating', undefined, stripedCode);
            }
        } else {
            // no settings, show error message
            throw new Error('LLM API not set, please set up first');
        }
    } catch (err) {
        console.error('Failed to generateCode:', err);
        throw err;
    }
}

export default defineBackground(() => {
    // on Firefox which is MV2, use browser.browserActions instead of browser.action
    const browserAction = browser.action || browser.browserAction;

    browser.commands.onCommand.addListener(async command => {
        if (command === 'select-UI') {
            const stackObj = await browser.storage.local.get('selected_stack');
            const stack = stackObj['selected_stack'] || 'html_tailwind'; // make sure default is same with popup
            browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0].id) {
                    browser.tabs.sendMessage(tabs[0].id, { action: 'startCapturing', stack });
                }
            });
        }
    });

    browser.runtime.onConnect.addListener(port => {
        if (port.name === 'popup') {
            popupPort = port;

            port.onDisconnect.addListener(() => {
                popupPort = undefined;
                // clear the task if it's in error state
                if (curCloneTask?.state === 'generateError') {
                    curCloneTask = undefined;
                }
            });
        }
    })

    // Listen for messages
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'GET_CLONE_TASK') {
            sendResponse(curCloneTask)
        } else if (message.action === 'captureStarted') {
            // create the current generateTask
            createCloneTask(message.stack, message.srcUrl);
        } else if (message.action === 'captureCancelled') {
            curCloneTask = undefined;
        } else if (message.action === 'captureArea') { // Handle area screenshot request
            browser.tabs.captureVisibleTab(
                { format: 'png' },
                (dataUrl) => {
                    // Send screenshot data back to content script for cropping
                    browser.tabs.sendMessage(sender.tab!.id!, {
                        action: 'cropArea',
                        image: dataUrl,
                        area: message.data.area
                    });
                }
            );
            // update task state
            updateCloneTask('areaCaptured');
        } else if (message.action === 'areaCropped') { // Handle cropped image data
            const uiCaptured: {
                image: string;
                width: number;
                height: number;
            } = message.data;

            if (!uiCaptured.image || uiCaptured.width < 5 || uiCaptured.height < 5) {
                // too small image, ignore it
                curCloneTask = undefined;
                return;
            }

            browserAction.openPopup().catch(e => { });  // FIXME: On firefox, Uncaught (in promise) Error: openPopup requires a user gesture
            updateCloneTask('areaCropped', uiCaptured);

            updateCloneTask('generateStarted');
            if (curCloneTask) {
                generateCode(uiCaptured.image, curCloneTask.stack).then(() => {
                    updateCloneTask('generateDone');
                }).catch(e => {
                    updateCloneTask('generateError', undefined, undefined, e.message);
                });
            }
        }
    });
});
