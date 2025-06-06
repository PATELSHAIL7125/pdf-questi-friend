
import React from 'react';
import { MessageCircle, Loader2, Brain, FileText, Clock } from 'lucide-react';
import { usePDF } from '@/context/PDFContext';
import { format } from 'date-fns';

const AnswerDisplay: React.FC = () => {
  const { questions } = usePDF();
  
  if (questions.length === 0) {
    return null;
  }
  
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
                  
                  {/* Answer content */}
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {qa.answer}
                  </div>
                  
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
