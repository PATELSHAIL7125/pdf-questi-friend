
import React, { useState } from 'react';
import { MessageCircle, Loader2, Brain, FileText, Clock, Copy, Check, Code } from 'lucide-react';
import { usePDF } from '@/context/PDFContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AnswerDisplay: React.FC = () => {
  const { questions } = usePDF();
  const { toast } = useToast();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  if (questions.length === 0) {
    return null;
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive"
      });
    }
  };

  const extractCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const code = match[2].trim();
      if (code.length > 0) {
        blocks.push({
          language: match[1] || 'code',
          code: code,
          full: match[0]
        });
      }
    }

    return blocks;
  };

  const formatAnswerWithCode = (answer: string, questionId: string) => {
    const codeBlocks = extractCodeBlocks(answer);
    
    if (codeBlocks.length === 0) {
      return (
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {answer}
        </div>
      );
    }

    let formattedAnswer = answer;
    const elements = [];
    let lastIndex = 0;

    codeBlocks.forEach((block, index) => {
      const blockIndex = formattedAnswer.indexOf(block.full, lastIndex);
      
      // Add text before code block
      if (blockIndex > lastIndex) {
        const textBefore = formattedAnswer.substring(lastIndex, blockIndex);
        if (textBefore.trim()) {
          elements.push(
            <div key={`text-${index}`} className="text-sm leading-relaxed whitespace-pre-wrap text-foreground mb-4">
              {textBefore.trim()}
            </div>
          );
        }
      }

      // Add code block
      const codeId = `${questionId}-code-${index}`;
      elements.push(
        <div key={`code-${index}`} className="my-4 rounded-lg overflow-hidden border border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-muted text-muted-foreground text-xs font-medium">
            <div className="flex items-center gap-2">
              <Code className="h-3 w-3" />
              <span className="capitalize">{block.language}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(block.code, codeId)}
              className="h-6 px-2 hover:bg-muted-foreground/10"
            >
              {copiedStates[codeId] ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy code
                </>
              )}
            </Button>
          </div>
          <div className="bg-background">
            <pre className="p-4 text-sm overflow-x-auto">
              <code className="text-foreground font-mono">{block.code}</code>
            </pre>
          </div>
        </div>
      );

      lastIndex = blockIndex + block.full.length;
    });

    // Add remaining text after last code block
    if (lastIndex < formattedAnswer.length) {
      const textAfter = formattedAnswer.substring(lastIndex);
      if (textAfter.trim()) {
        elements.push(
          <div key="text-final" className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {textAfter.trim()}
          </div>
        );
      }
    }

    return <div className="space-y-0">{elements}</div>;
  };
  
  return (
    <div className="w-full max-w-4xl space-y-6 mb-10">
      {questions.map((qa) => (
        <div key={qa.id} className="space-y-4">
          {/* Question */}
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-foreground">You</h3>
                <span className="text-xs text-muted-foreground">
                  {format(qa.timestamp, 'h:mm a')}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground leading-relaxed">{qa.text}</p>
            </div>
          </div>
          
          {/* Answer */}
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Brain className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h3 className="font-semibold text-foreground">AI Assistant</h3>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                {qa.isLoading ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  formatAnswerWithCode(qa.answer, qa.id)
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswerDisplay;
