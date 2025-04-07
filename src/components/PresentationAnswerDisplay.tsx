
import React from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { usePDF } from '@/context/PDFContext';
import { format } from 'date-fns';

const PresentationAnswerDisplay: React.FC = () => {
  const { presentationQuestions } = usePDF();
  
  if (presentationQuestions.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full max-w-4xl space-y-4 mb-10 animate-fade-in">
      {presentationQuestions.map((qa) => (
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
            <div className="flex-1 glass-panel rounded-xl p-4 bg-secondary/30 border">
              {qa.isLoading ? (
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing presentation...</span>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-line">
                  {qa.answer}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PresentationAnswerDisplay;
