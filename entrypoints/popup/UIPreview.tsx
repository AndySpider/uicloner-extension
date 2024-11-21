import { CodeStack } from "@/lib/types";
import { HtmlTwRender } from "./HtmlTwRender";
import { HtmlCssRender } from "./HtmlCssRender";

export function UIPreview({ srcUI, stack, code, genFinished }:
    {
        srcUI: { image: string, width: number, height: number }
        stack: CodeStack,
        code: string,
        genFinished: boolean
    }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scalerRef = useRef<HTMLDivElement>(null);
    const [renderHeight, setRenderHeight] = useState(srcUI.height);

    useEffect(() => {
        if (containerRef.current && scalerRef.current) {
            const containerEle = containerRef.current;
            const scalerEle = scalerRef.current;

            const PADDING_H = 16;
            const PADDING_V = 16;

            const scale = Math.min(
                (containerEle.clientWidth - PADDING_H) / srcUI.width,
                (containerEle.clientHeight - PADDING_V) / renderHeight,
                1
            );

            scalerEle.style.transformOrigin = 'center';
            scalerEle.style.transform = `scale(${scale})`;
        }
    }, [containerRef, scalerRef, genFinished, renderHeight]);

    const handleRenderHeightUpdate = (height: number) => {
        setRenderHeight(height);
    };

    let render: React.ReactNode;
    if (stack === 'html_css') {
        render = <HtmlCssRender html={code} width={srcUI.width} height={srcUI.height} genFinished={genFinished} onHeightUpdate={handleRenderHeightUpdate} />;
    } else if (stack === 'html_tailwind') {
        render = <HtmlTwRender htmlBody={code} width={srcUI.width} height={srcUI.height} genFinished={genFinished} onHeightUpdate={handleRenderHeightUpdate} />;
    }

    return (
        <div ref={containerRef} className="w-full h-[420px] bg-white border flex items-center justify-center rounded-md overflow-hidden">
            <div ref={scalerRef} className="w-fit h-fit bg-white rounded-md ring-1 ring-gray-300">
                {/* FIXME: user can click the url on render which will cause issues */}
                {render}
            </div>
        </div>
    );
}