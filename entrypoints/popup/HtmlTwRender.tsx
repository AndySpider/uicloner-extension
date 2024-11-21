import { useDebouncedCallback } from "use-debounce";

export function HtmlTwRender({ htmlBody, width, height, genFinished, onHeightUpdate }: {
    htmlBody: string;
    width: number;
    height: number;
    genFinished: boolean;
    onHeightUpdate: (height: number) => void;
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const iframeInitialized = useRef(false);

    const updateIframeContent = useDebouncedCallback((body: HTMLElement, content: string) => {
        body.innerHTML = content;
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

        if (!iframeInitialized.current) {
            // build full HTML to render
            const initHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script src="/tailwindcss.js"></script>
                  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
                  <style>
                      body {
                          margin: 0;
                          overflow: hidden;
                          width: ${width}px;
                      }
                  </style>
                </head>
                <body>
                  ${htmlBody}
                </body>
                </html>
                `;
            iframeDocument.open();
            iframeDocument.write(initHtml);
            iframeDocument.close();
            iframeInitialized.current = true;
        } else { // continue to update body content
            if (iframeDocument.body) {
                updateIframeContent(iframeDocument.body, htmlBody);
            }
        }

    }, [htmlBody]);

    useEffect(() => {
        if (!iframeRef.current) return;

        // function to set MutationObserver
        const setupObserver = () => {
            const body = iframeRef.current?.contentWindow?.document?.body;
            if (!body) return;

            const observer = new MutationObserver(() => {
                requestAnimationFrame(updateIframeHeight);
            });

            observer.observe(body, {
                childList: true,
                subtree: true,
                attributes: true
            });

            return observer;
        };

        // listen to iframe to be loaded
        let observer: MutationObserver | undefined = undefined;
        iframeRef.current.addEventListener('load', () => {
            // first update height immediately on loaded
            requestAnimationFrame(updateIframeHeight);
            // then setup observer to update height on content change
            observer = setupObserver();
        });

        return () => {
            observer?.disconnect();
        };
    }, []);

    return (
        <iframe ref={iframeRef} title="HtmlTWPreview" style={{ width, height, border: 'none' }} />
    );
}