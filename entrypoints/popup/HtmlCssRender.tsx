import { useRef, useEffect } from 'react';
import { useDebouncedCallback } from "use-debounce";

export function HtmlCssRender({ html, width, height, genFinished, onHeightUpdate }: {
    html: string;
    width: number;
    height: number;
    genFinished: boolean;
    onHeightUpdate: (height: number) => void;
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const updateIframeContent = useDebouncedCallback((document: Document, content: string) => {
        // Inject necessary styles
        const styleTag = `
            <style>
                body {
                    margin: 0;
                    overflow: hidden;
                    width: ${width}px;
                }
            </style>
        `;
        const contentWithStyle = content.replace('</head>', `${styleTag}</head>`);
        document.open();
        // Update entire document
        document.write(contentWithStyle);
        document.close();
    }, 50);

    const updateIframeHeight = () => {
        if (!iframeRef.current?.contentWindow?.document?.body) return;

        const body = iframeRef.current.contentWindow.document.body;
        const height = body.scrollHeight;
        if (height > 0) {
            iframeRef.current.style.height = `${height}px`;
            onHeightUpdate(height);
        }
    };

    useEffect(() => {
        if (!iframeRef.current) return;
        const iframeDocument = iframeRef.current.contentDocument;
        if (!iframeDocument) return;

        // html is full document
        updateIframeContent(iframeDocument, html);
    }, [html]);

    useEffect(() => {
        if (!iframeRef.current) return;

        // Listen for iframe load completion event
        // Since we're updating the entire document each time, we always use the load event to update height
        iframeRef.current.addEventListener('load', () => {
            requestAnimationFrame(updateIframeHeight);
        });
    }, []);

    return (
        <iframe
            ref={iframeRef}
            title="HtmlCssPreview"
            style={{
                width,
                height,
                border: 'none'
            }}
        />
    );
}