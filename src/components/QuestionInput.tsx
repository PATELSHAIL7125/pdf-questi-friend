
import React, { useState, useEffect } from 'react';
import { Send, Loader2, BarChart3, LayoutList, BookOpen, History, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useEnhancedQuestions } from '@/hooks/useEnhancedQuestions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const QuestionInput: React.FC = () => {
  const { toast } = useToast();
  const { pdfText, isAnswerLoading } = usePDF();
  const [question, setQuestion] = useState('');
  const [useGeminiBackup, setUseGeminiBackup] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    isProcessing,
    processedDocument,
    error,
    processDocument,
    askEnhancedQuestion,
    getConversationHistory,
    searchConversations
  } = useEnhancedQuestions();

  // Process document when PDF text changes
  useEffect(() => {
    if (pdfText) {
      processDocument();
    }
  }, [pdfText, processDocument]);

  // Detect question types
  const detectQuestionType = (q: string): { type: string, icon: React.ReactNode } => {
    // Algorithm analysis detection
    const algorithmKeywords = ['algorithm', 'complexity', 'time complexity', 'space complexity', 
      'approach', 'greedy', 'kruskal', 'prim', 'dijkstra', 'dynamic programming', 'big o'];
    
    const isAlgorithmQuestion = algorithmKeywords.some(keyword => 
      q.toLowerCase().includes(keyword));
    
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

    if (isProcessing) {
      toast({
        title: "Document processing",
        description: "Please wait for document processing to complete.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Submitting enhanced question:', question);
      console.log('Question type:', questionType.type);
      console.log('Use Gemini backup:', useGeminiBackup);
      console.log('Document processed:', !!processedDocument);
      
      await askEnhancedQuestion(question, useGeminiBackup);
      setQuestion('');
      
      toast({
        title: "Question submitted",
        description: "Processing your question with enhanced context...",
      });
    } catch (error) {
      console.error('Error processing enhanced question:', error);
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

  const conversationHistory = getConversationHistory();
  const searchResults = searchQuery ? searchConversations(searchQuery) : [];
  
  return (
    <TooltipProvider>
      <div className="w-full max-w-3xl mt-4 mb-6 animate-fade-in">
        {/* Document processing status */}
        {isProcessing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing document for enhanced Q&A...</span>
            </div>
          </div>
        )}

        {/* Document insights */}
        {processedDocument && !isProcessing && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-700">
              <div className="flex items-center gap-4 flex-wrap">
                <span>📄 {processedDocument.metadata.wordCount} words</span>
                <span>⏱️ {processedDocument.metadata.readingTime} min read</span>
                <span>📊 {processedDocument.sections.length} sections</span>
                <span>🎯 {processedDocument.metadata.complexity} complexity</span>
              </div>
              <div className="mt-2">
                <strong>Key topics:</strong> {processedDocument.keywords.slice(0, 8).join(', ')}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleQuestionSubmit} className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your PDF..."
            disabled={isAnswerLoading || !pdfText || isProcessing}
            className="w-full h-14 pl-4 pr-36 rounded-xl border border-input 
                      bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 
                      transition-all duration-200 shadow-sm"
          />
          {questionType.type !== 'general' && !isAnswerLoading && (
            <div className="absolute top-2 right-28 bg-secondary/50 p-1 rounded-md">
              {questionType.icon}
            </div>
          )}
          
          <div className="absolute right-20 top-2 flex items-center space-x-1">
            {/* Conversation History */}
            <Popover open={showHistory} onOpenChange={setShowHistory}>
              <PopoverTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  disabled={isAnswerLoading}
                >
                  <History className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    <h3 className="font-semibold">Conversation History</h3>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border rounded-md"
                    />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchQuery ? (
                      searchResults.length > 0 ? (
                        searchResults.slice(0, 5).map((msg) => (
                          <button
                            key={msg.id}
                            onClick={() => {
                              setQuestion(msg.question);
                              setShowHistory(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-2 border rounded-md hover:bg-gray-50 text-sm"
                          >
                            <div className="font-medium truncate">{msg.question}</div>
                            <div className="text-gray-500 text-xs truncate">
                              {msg.answer.substring(0, 100)}...
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No matching conversations found</div>
                      )
                    ) : (
                      conversationHistory?.messages.slice(0, 5).map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => {
                            setQuestion(msg.question);
                            setShowHistory(false);
                          }}
                          className="w-full text-left p-2 border rounded-md hover:bg-gray-50 text-sm"
                        >
                          <div className="font-medium truncate">{msg.question}</div>
                          <div className="text-gray-500 text-xs">
                            {msg.timestamp.toLocaleDateString()}
                          </div>
                        </button>
                      )) || (
                        <div className="text-sm text-gray-500">No previous conversations</div>
                      )
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* AI Backup Toggle */}
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
            disabled={isAnswerLoading || !pdfText || !question.trim() || isProcessing}
            className="absolute right-2 top-2 rounded-lg p-2 h-10 w-10 button-transition"
          >
            {isAnswerLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        
        {/* Enhanced status indicator */}
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            useGeminiBackup ? 'bg-green-500' : 'bg-blue-500'
          } ${processedDocument ? 'animate-pulse' : ''}`} />
          <span>
            {useGeminiBackup 
              ? 'Enhanced AI mode: Smart context + general knowledge' 
              : 'Document-only mode: Answers strictly from document content'
            }
            {processedDocument && ' • Document intelligence active'}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuestionInput;
