
export function OrigUIViewer({ srcUI }: {
    srcUI: { image: string, width: number, height: number }
}) {

    return (
        <div className="w-full h-[420px] bg-white border flex items-center justify-center rounded-md p-2">
            <img src={srcUI.image} alt="Original UI" className="object-contain max-w-full max-h-full" width={srcUI.width} height={srcUI.height} />
        </div>
    );
}