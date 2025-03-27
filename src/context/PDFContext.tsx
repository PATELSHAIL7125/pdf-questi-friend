
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  setQuestions: (questions: Question[]) => void;
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
      // Call the Supabase Edge Function using the JavaScript client
      const { data, error } = await supabase.functions.invoke('answer-from-pdf', {
        body: {
          question: questionText,
          pdfText: pdfText,
        },
      });

      if (error) {
        console.error('Error calling Edge Function:', error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error('Gemini API error:', data.error);
        let errorMessage = 'Sorry, I encountered an error while analyzing the document.';
        
        // Provide more specific error messages based on the error type
        if (data.error.includes('quota exceeded')) {
          errorMessage = 'Sorry, the Gemini API quota has been exceeded. Please try again later.';
        } else if (data.error.includes('API key')) {
          errorMessage = 'There is an issue with the Gemini API key. Please contact the administrator.';
        } else if (data.error.includes('blocked')) {
          errorMessage = 'The content of your document or question was flagged by AI content filters. Please try a different document or question.';
        }
        
        // Update with error message
        setQuestions((prev) => prev.map(q => 
          q.id === tempId 
            ? { ...q, answer: errorMessage, isLoading: false } 
            : q
        ));
        return;
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
        setQuestions,
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
