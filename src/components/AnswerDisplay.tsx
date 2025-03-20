
import React from 'react';
import { MessageCircle } from 'lucide-react';
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
            <div className="flex-1 glass-panel rounded-xl p-4">
              <p className="text-sm">{qa.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswerDisplay;
