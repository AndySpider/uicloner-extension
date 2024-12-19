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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

const MODEL_PROVIDERS = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'claude', label: 'Claude' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'openai_compatible', label: 'OpenAI Compatible' }
] as const;

const PREDEFINED_MODELS: { [provider: string]: { value: string, label: string }[] } = {
    'openai': [
        { value: 'gpt-4o', label: 'gpt-4o' },
        { value: 'gpt-4o-2024-11-20', label: 'gpt-4o-2024-11-20' },
        { value: 'gpt-4o-2024-08-06', label: 'gpt-4o-2024-08-06' },
        { value: 'gpt-4o-2024-05-13', label: 'gpt-4o-2024-05-13' },
    ],
    'claude': [
        { value: 'claude-3-5-sonnet-latest', label: 'claude-3-5-sonnet-latest' },
        { value: 'claude-3-5-sonnet-20241022', label: 'claude-3-5-sonnet-20241022' },
    ],
    'gemini': [
        { value: 'gemini-2.0-flash-exp', label: 'gemini-2.0-flash-exp' },
        { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
        { value: 'gemini-1.5-flash-8b', label: 'gemini-1.5-flash-8b' },
        { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
    ],
    'openai_compatible': []
} as const;

const DEFAULT_MODELS: { [provider: string]: string } = {
    'openai': 'gpt-4o',
    'claude': 'claude-3-5-sonnet-latest',
    'gemini': 'gemini-2.0-flash-exp',
    'openai_compatible': ''
};

interface ProviderSettings {
    apiKey: string;
    model: string;
    apiEndpoint?: string;
}

interface LLMSettings {
    currentProvider: string;
    providers: {
        [key: string]: ProviderSettings;
    };
}

export function LLMSettingsDialog() {
    const [open, setOpen] = useState(false)
    const [settings, setSettings] = useState<LLMSettings>({
        currentProvider: 'openai',
        providers: {}
    })
    const [hasSettings, setHasSettings] = useState(false)

    // Helper function to check if provider settings are complete
    const isProviderSettingsComplete = (providerSettings?: ProviderSettings) => {
        if (!providerSettings) return false;
        const { apiKey, apiEndpoint, model } = providerSettings;

        if (settings.currentProvider === 'openai_compatible') {
            return Boolean(apiKey && apiEndpoint && model);
        }
        return Boolean(apiKey && model);
    }

    useEffect(() => {
        // Load all provider settings
        browser.storage.local.get('llmSettings', (result) => {
            if (result.llmSettings) {
                setSettings(result.llmSettings);
                setHasSettings(isProviderSettingsComplete(result.llmSettings.providers[result.llmSettings.currentProvider]));
            }
        });
    }, []);

    // Update current provider
    const handleProviderChange = (newProvider: typeof MODEL_PROVIDERS[number]['value']) => {
        setSettings(prev => {
            // If no settings exist for this provider, create default settings
            if (!prev.providers[newProvider]) {
                prev.providers[newProvider] = {
                    apiKey: '',
                    apiEndpoint: '',
                    model: DEFAULT_MODELS[newProvider]
                };
            }

            return {
                ...prev,
                currentProvider: newProvider
            };
        });
    };

    // Update current provider settings
    const updateCurrentProviderSettings = (updates: Partial<ProviderSettings>) => {
        setSettings(prev => ({
            ...prev,
            providers: {
                ...prev.providers,
                [prev.currentProvider]: {
                    ...prev.providers[prev.currentProvider],
                    ...updates
                }
            }
        }));
    };

    const handleSave = () => {
        browser.storage.local.set({ llmSettings: settings }, () => {
            setHasSettings(isProviderSettingsComplete(settings.providers[settings.currentProvider]));
            setOpen(false);
        });
    };

    // Get current provider settings
    const currentSettings = settings.providers[settings.currentProvider] || {
        apiKey: '',
        apiEndpoint: '',
        model: DEFAULT_MODELS[settings.currentProvider]
    };

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
                        <Label htmlFor="provider">Provider</Label>
                        <Select
                            value={settings.currentProvider}
                            onValueChange={handleProviderChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {MODEL_PROVIDERS.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                            id="api-key"
                            value={currentSettings.apiKey}
                            onChange={(e) => updateCurrentProviderSettings({ apiKey: e.target.value })}
                            placeholder="Enter your API key"
                            type="password"
                        />
                    </div>
                    {settings.currentProvider === 'openai_compatible' && (
                        <div className="grid gap-2">
                            <Label htmlFor="api-endpoint">API Endpoint</Label>
                            <Input
                                id="api-endpoint"
                                value={currentSettings.apiEndpoint || ''}
                                onChange={(e) => updateCurrentProviderSettings({ apiEndpoint: e.target.value })}
                                placeholder="Enter custom API endpoint"
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="model">Model</Label>
                        {PREDEFINED_MODELS[settings.currentProvider].length > 0 ? (
                            <div className="space-y-2">
                                <Select
                                    value={PREDEFINED_MODELS[settings.currentProvider].some(m => m.value === currentSettings.model)
                                        ? currentSettings.model
                                        : '__custom'}
                                    onValueChange={(value) => {
                                        if (value === '__custom') {
                                            updateCurrentProviderSettings({ model: '' });
                                        } else {
                                            updateCurrentProviderSettings({ model: value });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PREDEFINED_MODELS[settings.currentProvider].map((modelOption) => (
                                            <SelectItem key={modelOption.value} value={modelOption.value}>
                                                {modelOption.label}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="__custom">Custom Model</SelectItem>
                                    </SelectContent>
                                </Select>
                                {!PREDEFINED_MODELS[settings.currentProvider].some(m => m.value === currentSettings.model) && (
                                    <Input
                                        value={currentSettings.model}
                                        onChange={(e) => updateCurrentProviderSettings({ model: e.target.value })}
                                        placeholder="Enter custom model name"
                                    />
                                )}
                            </div>
                        ) : (
                            <Input
                                value={currentSettings.model}
                                onChange={(e) => updateCurrentProviderSettings({ model: e.target.value })}
                                placeholder="Enter model name"
                            />
                        )}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}