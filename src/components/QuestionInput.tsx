
import React, { useState } from 'react';
import { Send, Loader2, BarChart3, LayoutList, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const QuestionInput: React.FC = () => {
  const { toast } = useToast();
  const { pdfText, askQuestion, isAnswerLoading } = usePDF();
  const [question, setQuestion] = useState('');
  const [useGeminiBackup, setUseGeminiBackup] = useState(true);
  
  // Detect question types
  const detectQuestionType = (q: string): { type: string, icon: React.ReactNode } => {
    // Algorithm analysis detection
    const algorithmKeywords = ['algorithm', 'complexity', 'time complexity', 'space complexity', 
      'approach', 'greedy', 'kruskal', 'prim', 'dijkstra', 'dynamic programming', 'big o'];
    
    const isAlgorithmQuestion = algorithmKeywords.some(keyword => 
      q.toLowerCase().includes(keyword));
    
    // Data visualization detection  
    const dataVizKeywords = ['data visual', 'visualization', 'chart', 'graph', 'plot', 'dashboard'];
    const isDataVizQuestion = dataVizKeywords.some(keyword => 
      q.toLowerCase().includes(keyword));
    
    if (isAlgorithmQuestion) {
      return { type: 'algorithm', icon: <LayoutList className="h-4 w-4 text-blue-500" /> };
    } else if (isDataVizQuestion) {
      return { type: 'visualization', icon: <BarChart3 className="h-4 w-4 text-primary" /> };
    }
    
    return { type: 'general', icon: null };
  };
  
  const questionType = detectQuestionType(question);
  
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Empty question",
        description: "Please enter a question before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    if (!pdfText) {
      toast({
        title: "No PDF loaded",
        description: "Please upload a PDF before asking questions.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Submitting question:', question);
      console.log('Question type:', questionType.type);
      console.log('Use Gemini backup:', useGeminiBackup);
      
      await askQuestion(question, useGeminiBackup);
      setQuestion('');
      
      toast({
        title: "Question submitted",
        description: "Processing your question...",
      });
    } catch (error) {
      console.error('Error processing question:', error);
      toast({
        title: "Error processing question",
        description: "There was a problem processing your question. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const toggleGeminiBackup = () => {
    setUseGeminiBackup(!useGeminiBackup);
    console.log('Toggled Gemini backup to:', !useGeminiBackup);
  };
  
  return (
    <TooltipProvider>
      <div className="w-full max-w-3xl mt-4 mb-6 animate-fade-in">
        <form onSubmit={handleQuestionSubmit} className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your PDF..."
            disabled={isAnswerLoading || !pdfText}
            className="w-full h-14 pl-4 pr-28 rounded-xl border border-input 
                      bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 
                      transition-all duration-200 shadow-sm"
          />
          {questionType.type !== 'general' && !isAnswerLoading && (
            <div className="absolute top-2 right-20 bg-secondary/50 p-1 rounded-md">
              {questionType.icon}
            </div>
          )}
          <div className="absolute right-14 top-2 flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant={useGeminiBackup ? "default" : "outline"}
                  size="icon"
                  className={`h-10 w-10 rounded-lg transition-all duration-200 ${
                    useGeminiBackup 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-background border-2 text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={toggleGeminiBackup}
                  disabled={isAnswerLoading}
                >
                  <BookOpen className={`h-5 w-5 ${
                    useGeminiBackup ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-sm max-w-48">
                  {useGeminiBackup 
                    ? "AI backup enabled: Will use general knowledge if PDF doesn't contain the answer" 
                    : "PDF only: Will strictly use PDF content for answers"
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button
            type="submit"
            disabled={isAnswerLoading || !pdfText || !question.trim()}
            className="absolute right-2 top-2 rounded-lg p-2 h-10 w-10 button-transition"
          >
            {isAnswerLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        
        {/* Status indicator */}
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${useGeminiBackup ? 'bg-green-500' : 'bg-blue-500'}`} />
          <span>
            {useGeminiBackup 
              ? 'AI backup mode: Enhanced answers with general knowledge' 
              : 'PDF-only mode: Answers strictly from document content'
            }
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuestionInput;
