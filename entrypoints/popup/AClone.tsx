import { useCallback } from "react";
import { CloneTask, CloneTaskState, CodeStack, CodeStacksMap } from "@/lib/types";
import { CodePreview } from "./CodePreview";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

function CopyButton({ code, taskState }: {
    code: string;
    taskState: CloneTaskState;
}) {
    const [codeJustCopied, setCodeJustCopied] = useState(false);

    const handleCopyCode = useCallback(() => {
        // copy code to clipboard
        navigator.clipboard.writeText(code).then(() => {
            setCodeJustCopied(true);
            setTimeout(() => {
                setCodeJustCopied(false);
            }, 3000);
        }).catch(e => {
            console.error("Failed to copy code: ", e);
            setCodeJustCopied(false);
        });
    }, []);

    return (
        <Button size="sm" disabled={taskState !== 'generateDone'} onClick={handleCopyCode}>
            {codeJustCopied ? "Copied!" : "Copy Code"}
        </Button>
    );
}

function CloneStackBadge({ stack, taskState }: {
    stack: CodeStack;
    taskState: CloneTaskState
}) {
    return (
        taskState !== 'generateDone' ?
            <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
                <span className="text-base">Generating...</span>
            </div> :
            <div>
                <Badge variant="outline">{CodeStacksMap[stack]}</Badge>
            </div>
    );
}

export function AClone({ task }: { task: CloneTask }) {
    const [cloneId, setCloneId] = useState<string | undefined>(task.id);

    useEffect(() => {
        const checkToSaveDoneClone = async () => {
            if (!cloneId && task.state === 'generateDone') {
                setCloneId(cloneId);
            }
        };

        checkToSaveDoneClone();
    }, [task]);

    const isGenerateFinished = task.state === 'generateDone';

    const UnexpectedError = () => (
        <div className="flex flex-col items-center justify-center h-full text-base">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Something went wrong, please check.</AlertTitle>
                <AlertDescription>
                    {task.errorMsg}
                </AlertDescription>
            </Alert>
        </div>
    );

    return (
        task.state === 'generateError' ?
            <UnexpectedError /> :
            <div>
                <div className="relative">
                    <div className="absolute top-[4px] flex gap-3 items-center z-10">
                        <CopyButton code={task.code} taskState={task.state} />
                        <CloneStackBadge stack={task.stack} taskState={task.state} />
                    </div>
                    <CodePreview srcUI={task.srcUI!} code={task.code} stack={task.stack}
                        genFinished={isGenerateFinished} />
                </div>
            </div>
    )
}