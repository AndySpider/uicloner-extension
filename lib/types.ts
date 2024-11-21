export type CodeStack = 'html_css' | 'html_tailwind';

export const CodeStacksMap: {
    [key in CodeStack]: string;
} = Object.freeze({
    'html_css': 'HTML+CSS',
    'html_tailwind': 'HTML+Tailwind',
});

export type CloneTaskState = 'captureStarted' | 'areaCaptured' | 'areaCropped' | 'generateStarted' | 'generating' | 'generateDone' | 'generateError';

export interface CloneTask {
    id?: string;    // clone that is creating has no Id
    state: CloneTaskState;
    srcUrl: string;
    srcUI?: {
        image: string;
        width: number;
        height: number;
    };  // clone that is creating might have no src UI yet
    stack: CodeStack;
    code: string;   // generated code, will be populated before generateDone
    errorMsg?: string;  // only present when generateError
};
