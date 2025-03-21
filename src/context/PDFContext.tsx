
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Question = {
  id: string;
  text: string;
  answer: string;
  timestamp: Date;
  isLoading?: boolean;
};

interface PDFContextType {
  pdfFile: File | null;
  pdfUrl: string | null;
  pdfText: string | null;
  currentPage: number;
  totalPages: number;
  isAnalyzing: boolean;
  questions: Question[];
  isAnswerLoading: boolean;
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setPdfText: (text: string | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  addQuestion: (question: string, answer: string) => void;
  askQuestion: (question: string) => Promise<void>;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAnswerLoading, setIsAnswerLoading] = useState<boolean>(false);

  const addQuestion = (questionText: string, answerText: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      answer: answerText,
      timestamp: new Date(),
    };
    
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  const askQuestion = async (questionText: string) => {
    if (!pdfText) return;
    
    // Add the question with a loading state
    const tempId = Date.now().toString();
    const loadingQuestion: Question = {
      id: tempId,
      text: questionText,
      answer: "Analyzing document...",
      timestamp: new Date(),
      isLoading: true,
    };
    
    setQuestions((prev) => [loadingQuestion, ...prev]);
    setIsAnswerLoading(true);
    
    try {
      // Call the Supabase Edge Function
      const { error, data } = await fetch('/functions/v1/answer-from-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          pdfText: pdfText,
        }),
      }).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      // Update the question with the answer
      setQuestions((prev) => prev.map(q => 
        q.id === tempId 
          ? { ...q, answer: data.answer, isLoading: false } 
          : q
      ));
    } catch (error) {
      console.error('Error asking question:', error);
      
      // Update with error message
      setQuestions((prev) => prev.map(q => 
        q.id === tempId 
          ? { 
              ...q, 
              answer: "Sorry, I encountered an error while analyzing the document. Please try again.", 
              isLoading: false 
            } 
          : q
      ));
    } finally {
      setIsAnswerLoading(false);
    }
  };

  return (
    <PDFContext.Provider 
      value={{
        pdfFile,
        pdfUrl,
        pdfText,
        currentPage,
        totalPages,
        isAnalyzing,
        questions,
        isAnswerLoading,
        setPdfFile,
        setPdfUrl,
        setPdfText,
        setCurrentPage,
        setTotalPages,
        setIsAnalyzing,
        addQuestion,
        askQuestion,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = (): PDFContextType => {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  return context;
};
