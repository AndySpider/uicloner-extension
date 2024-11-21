import { CodeStack } from '@/lib/types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export function CodeViewer({ stack, code, genFinished }: {
    stack: CodeStack,
    code: string,
    genFinished: boolean
}) {
    return (
        <div className="bg-white border w-full h-[420px] overflow-auto rounded-md custom-scrollbar">
            {
                genFinished ?
                    <SyntaxHighlighter language='html' style={docco} showLineNumbers={true} customStyle={{
                        paddingLeft: 0,
                        height: "100%",
                        overflowY: 'auto',
                        overflowX: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)',
                    }}>{code}</SyntaxHighlighter> :
                    <pre className='p-1'>{code}</pre>
            }
        </div>
    );
}