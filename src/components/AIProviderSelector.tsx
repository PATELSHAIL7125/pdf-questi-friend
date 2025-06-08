
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Zap, Cpu } from 'lucide-react';

interface AIProviderSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}

const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  provider,
  model,
  onProviderChange,
  onModelChange
}) => {
  const providers = [
    {
      value: 'openai',
      label: 'OpenAI',
      icon: Brain,
      description: 'GPT models - Great for general analysis',
      models: [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
        { value: 'gpt-4o', label: 'GPT-4o (Advanced)' }
      ]
    },
    {
      value: 'anthropic',
      label: 'Anthropic',
      icon: Cpu,
      description: 'Claude models - Excellent reasoning',
      models: [
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Balanced)' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' }
      ]
    },
    {
      value: 'gemini',
      label: 'Google Gemini',
      icon: Zap,
      description: 'Gemini models - Strong multimodal capabilities',
      models: [
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Fast)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Advanced)' }
      ]
    }
  ];

  const selectedProvider = providers.find(p => p.value === provider);
  const availableModels = selectedProvider?.models || [];

  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">AI Provider</Label>
            <Select value={provider} onValueChange={onProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => {
                  const Icon = p.icon;
                  return (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{p.label}</div>
                          <div className="text-xs text-muted-foreground">{p.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-model">Model</Label>
            <Select value={model} onValueChange={onModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProviderSelector;
