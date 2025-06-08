
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { usePDF } from '@/context/PDFContext';
import AIProviderSelector from './AIProviderSelector';

const QuestionInput: React.FC = () => {
  const { 
    askQuestion, 
    isAnswerLoading,
    aiProvider,
    aiModel,
    setAiProvider,
    setAiModel
  } = usePDF();
  const [question, setQuestion] = useState('');
  const [useGeminiBackup, setUseGeminiBackup] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isAnswerLoading) {
      await askQuestion(question, useGeminiBackup);
      setQuestion('');
    }
  };

  return (
    <div className="space-y-4">
      <AIProviderSelector
        provider={aiProvider}
        model={aiModel}
        onProviderChange={setAiProvider}
        onModelChange={setAiModel}
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask a question about your PDF..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isAnswerLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!question.trim() || isAnswerLoading}>
            {isAnswerLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="ai-backup"
            checked={useGeminiBackup}
            onCheckedChange={setUseGeminiBackup}
          />
          <Label htmlFor="ai-backup" className="text-sm">
            Use AI assistance for information not in document
          </Label>
        </div>
      </form>
    </div>
  );
};

export default QuestionInput;
