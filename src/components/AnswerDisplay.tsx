
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
        title: "Code copied!",
        description: "Code has been copied to your clipboard.",
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
    // Only extract proper code blocks with triple backticks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const code = match[2].trim();
      // Filter out code blocks that are mostly explanatory text
      const codeLines = code.split('\n');
      const actualCodeLines = codeLines.filter(line => {
        const trimmedLine = line.trim();
        return trimmedLine && 
               !trimmedLine.startsWith('//') && 
               !trimmedLine.startsWith('#') &&
               !trimmedLine.startsWith('/*') &&
               !trimmedLine.includes('explanation') &&
               !trimmedLine.includes('example') &&
               trimmedLine.length > 3;
      });

      // Only include if at least 30% of lines are actual code
      if (actualCodeLines.length >= Math.max(1, codeLines.length * 0.3)) {
        blocks.push({
          type: 'block',
          language: match[1] || 'text',
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
      return <div className="text-sm whitespace-pre-line leading-relaxed">{answer}</div>;
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
            <div key={`text-${index}`} className="text-sm whitespace-pre-line leading-relaxed mb-3">
              {textBefore.trim()}
            </div>
          );
        }
      }

      // Add code block with copy functionality
      const codeId = `${questionId}-code-${index}`;
      elements.push(
        <div key={`code-${index}`} className="my-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 text-xs">
              <div className="flex items-center gap-2">
                <Code className="h-3 w-3" />
                <span>{block.language || 'code'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(block.code, codeId)}
                className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {copiedStates[codeId] ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
              <code>{block.code}</code>
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
          <div key="text-final" className="text-sm whitespace-pre-line leading-relaxed">
            {textAfter.trim()}
          </div>
        );
      }
    }

    return <div>{elements}</div>;
  };
  
  return (
    <div className="w-full max-w-3xl space-y-4 mb-10 animate-fade-in">
      {questions.map((qa) => (
        <div key={qa.id} className="space-y-3">
          {/* Question */}
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">Your Question</h3>
                <span className="text-xs text-muted-foreground">
                  {format(qa.timestamp, 'h:mm a')}
                </span>
              </div>
              <p className="mt-1 text-sm">{qa.text}</p>
            </div>
          </div>
          
          {/* Answer */}
          <div className="flex items-start space-x-3 pl-11">
            <div className="flex-1 glass-panel rounded-xl p-4 relative">
              {qa.isLoading ? (
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing document with enhanced AI...</span>
                </div>
              ) : (
                <>
                  {/* Enhanced answer indicator */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <Brain className="h-3 w-3" />
                    <span>Enhanced AI Response</span>
                    <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                    <FileText className="h-3 w-3" />
                    <span>Document Analysis</span>
                    <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                    <Clock className="h-3 w-3" />
                    <span>Context-Aware</span>
                  </div>
                  
                  {/* Answer content with code formatting */}
                  {formatAnswerWithCode(qa.answer, qa.id)}
                  
                  {/* Answer quality indicators */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>High relevance</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Document context</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>AI enhanced</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswerDisplay;
