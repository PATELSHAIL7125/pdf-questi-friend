
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import { Loader2, FileText, CheckCircle } from 'lucide-react';

const MCQGenerator: React.FC = () => {
  const { pdfText, generateMCQs, isMCQGenerating, mcqSet } = usePDF();

  const handleGenerateMCQs = async () => {
    await generateMCQs(5); // Generate 5 MCQs by default
  };

  if (!pdfText) {
    return null; // Don't show if no PDF is loaded
  }

  return (
    <div className="w-full max-w-3xl my-4 p-4 border border-border rounded-lg bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">MCQ Generator</h3>
        </div>
        
        {mcqSet && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            <span>{mcqSet.questions.length} questions generated</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mt-2 mb-4">
        Generate multiple-choice questions based on your PDF content to test understanding.
      </p>
      
      <Button
        onClick={handleGenerateMCQs}
        disabled={isMCQGenerating || !pdfText}
        className="w-full sm:w-auto button-transition"
      >
        {isMCQGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating MCQs...
          </>
        ) : (
          'Generate MCQs'
        )}
      </Button>
    </div>
  );
};

export default MCQGenerator;
