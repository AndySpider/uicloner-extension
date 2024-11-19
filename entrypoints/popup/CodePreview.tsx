import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeViewer } from "./CodeViewer";
import { UIPreview } from "./UIPreview";
import { CodeStack } from "@/lib/types";
import { OrigUIViewer } from "./OrigUIViewer";

export function CodePreview({ srcUI, stack, code, genFinished }:
    {
        srcUI: { image: string, width: number, height: number }
        stack: CodeStack,
        code: string,
        genFinished: boolean,
    }) {
    return (
        <div className="w-full">
            <Tabs defaultValue="preview" className="flex flex-col">
                <TabsList className="grid w-fit grid-cols-3 self-end">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent value="original">
                    <OrigUIViewer srcUI={srcUI} />
                </TabsContent>
                <TabsContent value="preview">
                    <UIPreview srcUI={srcUI} stack={stack} code={code} genFinished={genFinished} />
                </TabsContent>
                <TabsContent value="code">
                    <CodeViewer stack={stack} code={code} genFinished={genFinished} />
                </TabsContent>
            </Tabs>
        </div>
    )
}