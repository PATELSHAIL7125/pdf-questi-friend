
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

  // Format the file size
  const fileSize = presentationFile.size < 1000000 
    ? `${(presentationFile.size / 1024).toFixed(1)} KB` 
    : `${(presentationFile.size / 1048576).toFixed(1)} MB`;
  
  // Format the uploaded date
  const uploadDate = new Date().toLocaleDateString();

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <Card className="w-full max-w-4xl mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-lg">{presentationFile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {fileSize} • Uploaded {uploadDate}
              </p>
            </div>
          </div>
          
          <div className="rounded-lg border p-4 bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-2">Presentation content extracted:</p>
            <div className="max-h-[300px] overflow-y-auto text-sm">
              {presentationText.split('\n').map((line, index) => (
                <p key={index} className={`${line.trim() ? '' : 'h-2'} ${line.includes('Slide') ? 'font-semibold mt-3' : ''}`}>
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
