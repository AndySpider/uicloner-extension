import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function LLMSettingsDialog() {
    const [open, setOpen] = useState(false)
    const [apiKey, setApiKey] = useState("")
    const [apiEndpoint, setApiEndpoint] = useState("")
    const [model, setModel] = useState("")
    const [hasSettings, setHasSettings] = useState(false)

    useEffect(() => {
        browser.storage.local.get(['apiKey', 'apiEndpoint', 'model'], (result) => {
            setApiKey(result.apiKey || '');
            setApiEndpoint(result.apiEndpoint || '');
            setModel(result.model || '');
            if (result.apiKey && result.apiEndpoint && result.model) {
                setHasSettings(true);
            } else {
                setHasSettings(false);
            }
        })
    }, [])

    const handleSave = () => {
        browser.storage.local.set({
            apiKey,
            apiEndpoint,
            model
        }, () => {
            if (apiKey && apiEndpoint && model) {
                setHasSettings(true);
            } else {
                setHasSettings(false);
            }
            setOpen(false);
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="relative text-primary">
                    <Settings />
                    {!hasSettings && (
                        <AlertCircle className="text-destructive absolute -top-0 -right-0" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Vision LLM Settings</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Vision capabilities is required, such as GPT-4o or Claude 3.5
                        <br />
                        (Your API key is saved locally in browser, will NOT upload to any server)
                    </p>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                            id="api-key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            type="password"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="api-endpoint">API Endpoint</Label>
                        <Input
                            id="api-endpoint"
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                            placeholder="e.g., https://api.openai.com/v1/chat/completions"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                            id="model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="e.g., gpt-4o-2024-05-13"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 