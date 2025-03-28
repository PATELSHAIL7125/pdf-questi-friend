
import React from 'react';
import { usePDF } from '@/context/PDFContext';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PresentationQuestionInput from './PresentationQuestionInput';
import PresentationAnswerDisplay from './PresentationAnswerDisplay';

const PresentationViewer: React.FC = () => {
  const { presentationFile, presentationText } = usePDF();

  if (!presentationFile || !presentationText) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <Card className="w-full max-w-3xl mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-lg">{presentationFile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(presentationFile.size / 1024).toFixed(1)} KB • Uploaded {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="rounded-lg border p-4 bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-2">Presentation content extracted:</p>
            <div className="max-h-[200px] overflow-y-auto text-sm">
              {presentationText.split('\n').map((line, index) => (
                <p key={index} className={line.trim() ? '' : 'h-2'}>
                  {line.trim() || ' '}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <PresentationQuestionInput />
      <PresentationAnswerDisplay />
    </div>
  );
};

export default PresentationViewer;
