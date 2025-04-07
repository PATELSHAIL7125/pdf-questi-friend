
import React, { useState } from 'react';
import { usePDF } from '@/context/PDFContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, EyeOff, Printer } from 'lucide-react';

const MCQDisplay: React.FC = () => {
  const { mcqSet, setUserAnswer } = usePDF();
  const [showExplanations, setShowExplanations] = useState<boolean>(false);
  const [showAllExplanations, setShowAllExplanations] = useState<boolean>(false);
  
  if (!mcqSet || mcqSet.questions.length === 0) {
    return null;
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswer(questionIndex, answer);
  };

  const toggleExplanations = () => {
    setShowAllExplanations(!showAllExplanations);
  };
  
  const printMCQs = () => {
    window.print();
  };

  // Calculate score if all questions are answered
  const answeredQuestions = mcqSet.questions.filter(q => q.userAnswer);
  const correctAnswers = mcqSet.questions.filter(q => q.userAnswer === q.correctAnswer);
  const allAnswered = answeredQuestions.length === mcqSet.questions.length;
  const score = allAnswered ? Math.round((correctAnswers.length / mcqSet.questions.length) * 100) : null;

  return (
    <div className="w-full max-w-3xl my-8 print:my-2 animate-fade-in">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-2xl font-bold">MCQ Quiz</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleExplanations}
            className="flex items-center gap-1"
          >
            {showAllExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAllExplanations ? 'Hide Explanations' : 'Show Explanations'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={printMCQs}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      {allAnswered && (
        <Card className="mb-6 bg-muted/30 print:bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium">Quiz Results</h3>
              <div className="text-2xl font-bold">
                Score: {score}%
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              You answered {correctAnswers.length} out of {mcqSet.questions.length} questions correctly.
            </div>
          </CardContent>
        </Card>
      )}
      
      {mcqSet.questions.map((question, index) => (
        <Card key={index} className="mb-6 shadow-sm print:shadow-none print:border print:mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span>{question.question}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={question.userAnswer}
              onValueChange={(value) => handleAnswerSelect(index, value)}
            >
              {Object.entries(question.options).map(([key, value]) => (
                <div key={key} className="flex items-start space-x-2 mb-3">
                  <RadioGroupItem 
                    value={key} 
                    id={`q${index}-${key}`}
                    className={`mt-1 ${question.userAnswer && question.correctAnswer === key ? 'border-green-500' : ''}`}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`q${index}-${key}`}
                      className={`flex items-start gap-2 ${
                        question.userAnswer && (
                          key === question.correctAnswer 
                            ? 'text-green-600 font-medium' 
                            : (key === question.userAnswer ? 'text-red-600' : '')
                        )
                      }`}
                    >
                      <span className="w-5 flex-shrink-0">{key}.</span>
                      <span>{value}</span>
                      {question.userAnswer && key === question.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-1 flex-shrink-0 mt-1" />
                      )}
                      {question.userAnswer && key === question.userAnswer && key !== question.correctAnswer && (
                        <XCircle className="h-4 w-4 text-red-500 ml-1 flex-shrink-0 mt-1" />
                      )}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          
          {(question.userAnswer || showAllExplanations) && (
            <CardFooter className="flex flex-col items-start border-t bg-muted/20 print:bg-white">
              <div className="pt-3 pb-1 text-sm font-medium">Explanation:</div>
              <p className="text-sm text-muted-foreground">
                {question.explanation}
              </p>
              {question.userAnswer && question.userAnswer !== question.correctAnswer && (
                <div className="mt-2 text-sm font-medium text-red-600">
                  The correct answer is {question.correctAnswer}.
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default MCQDisplay;
