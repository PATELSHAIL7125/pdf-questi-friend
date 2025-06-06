
import React, { useState } from 'react';
import { Send, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PresentationQuestionInput: React.FC = () => {
  const { toast } = useToast();
  const { presentationText, askPresentationQuestion, isPresentationAnswerLoading } = usePDF();
  const [question, setQuestion] = useState('');
  const [useGeminiBackup, setUseGeminiBackup] = useState(true);
  
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    if (!presentationText) {
      toast({
        title: "No presentation loaded",
        description: "Please upload a presentation before asking questions.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Submitting presentation question:', question);
      console.log('Use Gemini backup:', useGeminiBackup);
      await askPresentationQuestion(question, useGeminiBackup);
      setQuestion('');
    } catch (error) {
      console.error('Error processing presentation question:', error);
      toast({
        title: "Error processing question",
        description: "There was a problem processing your question. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <TooltipProvider>
      <div className="w-full max-w-3xl mt-4 mb-6 animate-fade-in">
        <form onSubmit={handleQuestionSubmit} className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your presentation..."
            disabled={isPresentationAnswerLoading || !presentationText}
            className="w-full h-14 pl-4 pr-16 rounded-xl border border-input 
                      bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 
                      transition-all duration-200 shadow-sm"
          />
          <div className="absolute right-14 top-2 flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant={useGeminiBackup ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setUseGeminiBackup(!useGeminiBackup)}
                >
                  <BookOpen className={`h-5 w-5 ${useGeminiBackup ? 'text-white' : 'text-muted-foreground'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px]">
                {useGeminiBackup ? 
                  "AI Assist ON: If your presentation doesn't contain the answer, Gemini will provide additional information" : 
                  "AI Assist OFF: Only using information found in your presentation slides"}
              </TooltipContent>
            </Tooltip>
          </div>
          <Button
            type="submit"
            disabled={isPresentationAnswerLoading || !presentationText || !question.trim()}
            className="absolute right-2 top-2 rounded-lg p-2 h-10 w-10 button-transition"
            aria-label="Submit question"
          >
            {isPresentationAnswerLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </TooltipProvider>
  );
};

export default PresentationQuestionInput;
