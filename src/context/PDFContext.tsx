
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Question = {
  id: string;
  text: string;
  answer: string;
  timestamp: Date;
};

interface PDFContextType {
  pdfFile: File | null;
  pdfUrl: string | null;
  pdfText: string | null;
  currentPage: number;
  totalPages: number;
  isAnalyzing: boolean;
  questions: Question[];
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setPdfText: (text: string | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  addQuestion: (question: string, answer: string) => void;
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

  const addQuestion = (questionText: string, answerText: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      answer: answerText,
      timestamp: new Date(),
    };
    
    setQuestions((prev) => [newQuestion, ...prev]);
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
        setPdfFile,
        setPdfUrl,
        setPdfText,
        setCurrentPage,
        setTotalPages,
        setIsAnalyzing,
        addQuestion,
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
