import { Loader2 } from "lucide-react";

export function Loading() {
    return (
        <div className="w-full h-full flex justify-center items-center min-h-[200px] text-primary">
            <Loader2 className="animate-spin w-11 h-11" />
        </div>
    )
}