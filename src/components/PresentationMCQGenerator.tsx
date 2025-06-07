
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import { Loader2, FileText, CheckCircle, BookOpen, Code, Calculator } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const PresentationMCQGenerator: React.FC = () => {
  const { presentationText, generateMCQs, isMCQGenerating, mcqSet } = usePDF();
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questionType, setQuestionType] = useState<string>("auto");

  const handleGenerateMCQs = async () => {
    if (presentationText) {
      // Use presentation text instead of PDF text for MCQ generation
      await generateMCQs(numQuestions, questionType); 
    }
  };

  if (!presentationText) {
    return null; // Don't show if no presentation is loaded
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
        Generate multiple-choice questions based on your presentation content to test understanding.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Question Focus</label>
          <Select 
            value={questionType}
            onValueChange={setQuestionType}
            disabled={isMCQGenerating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select focus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Auto-detect content</span>
                </div>
              </SelectItem>
              <SelectItem value="algorithm">
                <div className="flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  <span>Algorithm Analysis</span>
                </div>
              </SelectItem>
              <SelectItem value="technical">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2" />
                  <span>Technical Concepts</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Number of Questions: {numQuestions}</label>
          <Slider 
            value={[numQuestions]} 
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setNumQuestions(value[0])}
            disabled={isMCQGenerating}
            className="my-4"
          />
        </div>
      </div>
      
      <Button
        onClick={handleGenerateMCQs}
        disabled={isMCQGenerating || !presentationText}
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

export default PresentationMCQGenerator;
