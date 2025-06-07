
import React from 'react';
import { usePDF } from '@/context/PDFContext';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PresentationMCQDisplay: React.FC = () => {
  const { mcqSet, setUserAnswer } = usePDF();
  
  if (!mcqSet || mcqSet.questions.length === 0) {
    return null;
  }
  
  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswer(questionIndex, answer);
  };
  
  const calculateScore = () => {
    const answered = mcqSet.questions.filter(q => q.userAnswer).length;
    const correct = mcqSet.questions.filter(q => q.userAnswer === q.correctAnswer).length;
    return { answered, correct, total: mcqSet.questions.length };
  };
  
  const { answered, correct, total } = calculateScore();
  const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  
  const resetQuiz = () => {
    mcqSet.questions.forEach((_, index) => {
      setUserAnswer(index, '');
    });
  };
  
  return (
    <div className="w-full max-w-4xl space-y-6 animate-fade-in">
      {/* Score Summary */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Quiz Progress
            </CardTitle>
            <Button variant="outline" size="sm" onClick={resetQuiz}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{answered}</div>
              <div className="text-sm text-muted-foreground">Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Questions */}
      <div className="space-y-4">
        {mcqSet.questions.map((question, questionIndex) => (
          <Card key={questionIndex} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-relaxed">
                  {questionIndex + 1}. {question.question}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {question.userAnswer && (
                    <Badge variant={question.userAnswer === question.correctAnswer ? "default" : "destructive"}>
                      {question.userAnswer === question.correctAnswer ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {question.userAnswer === question.correctAnswer ? 'Correct' : 'Incorrect'}
                    </Badge>
                  )}
                  {!question.userAnswer && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Unanswered
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {Object.entries(question.options).map(([optionKey, optionText]) => {
                  const isSelected = question.userAnswer === optionKey;
                  const isCorrect = optionKey === question.correctAnswer;
                  const showResult = question.userAnswer !== undefined;
                  
                  let buttonVariant: "outline" | "default" | "destructive" = "outline";
                  let className = "text-left h-auto p-4 justify-start";
                  
                  if (showResult) {
                    if (isCorrect) {
                      buttonVariant = "default";
                      className += " bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300";
                    } else if (isSelected) {
                      buttonVariant = "destructive";
                      className += " bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300";
                    }
                  } else if (isSelected) {
                    buttonVariant = "default";
                  }
                  
                  return (
                    <Button
                      key={optionKey}
                      variant={buttonVariant}
                      className={className}
                      onClick={() => !showResult && handleAnswerSelect(questionIndex, optionKey)}
                      disabled={showResult}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                          {optionKey}
                        </div>
                        <div className="text-sm leading-relaxed">{optionText}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              {question.userAnswer && (
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-sm mb-2">Explanation:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PresentationMCQDisplay;
