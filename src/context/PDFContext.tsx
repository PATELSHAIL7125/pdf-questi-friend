import React, { createContext, useState, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Question = {
  id: string;
  text: string;
  answer: string;
  timestamp: Date;
  isLoading?: boolean;
};

type MCQQuestion = {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
};

type MCQSet = {
  questions: MCQQuestion[];
  generatedAt: Date;
};

interface PDFContextType {
  pdfFile: File | null;
  pdfUrl: string | null;
  pdfText: string | null;
  presentationFile: File | null;
  presentationText: string | null;
  currentPage: number;
  totalPages: number;
  isAnalyzing: boolean;
  questions: Question[];
  presentationQuestions: Question[];
  isAnswerLoading: boolean;
  isPresentationAnswerLoading: boolean;
  mcqSet: MCQSet | null;
  isMCQGenerating: boolean;
  aiProvider: string;
  aiModel: string;
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setPdfText: (text: string | null) => void;
  setPresentationFile: (file: File | null) => void;
  setPresentationText: (text: string | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setQuestions: (questions: Question[]) => void;
  setPresentationQuestions: (questions: Question[]) => void;
  addQuestion: (question: string, answer: string) => void;
  addPresentationQuestion: (question: string, answer: string) => void;
  askQuestion: (question: string, useGeminiBackup?: boolean) => Promise<void>;
  askPresentationQuestion: (question: string, useGeminiBackup?: boolean) => Promise<void>;
  generateMCQs: (numQuestions?: number, questionType?: string) => Promise<void>;
  generatePresentationMCQs: (numQuestions?: number, questionType?: string) => Promise<void>;
  setUserAnswer: (questionIndex: number, answer: string) => void;
  setAiProvider: (provider: string) => void;
  setAiModel: (model: string) => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [presentationText, setPresentationText] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [presentationQuestions, setPresentationQuestions] = useState<Question[]>([]);
  const [isAnswerLoading, setIsAnswerLoading] = useState<boolean>(false);
  const [isPresentationAnswerLoading, setIsPresentationAnswerLoading] = useState<boolean>(false);
  const [mcqSet, setMCQSet] = useState<MCQSet | null>(null);
  const [isMCQGenerating, setIsMCQGenerating] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<string>('gemini');
  const [aiModel, setAiModel] = useState<string>('gemini-2.0-flash');

  const addQuestion = (questionText: string, answerText: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      answer: answerText,
      timestamp: new Date(),
    };
    
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  const addPresentationQuestion = (questionText: string, answerText: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      answer: answerText,
      timestamp: new Date(),
    };
    
    setPresentationQuestions((prev) => [newQuestion, ...prev]);
  };

  const askQuestion = async (questionText: string, useGeminiBackup: boolean = false) => {
    if (!pdfText) return;
    
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
      const { data, error } = await supabase.functions.invoke('multi-ai-analysis', {
        body: {
          question: questionText,
          documentText: pdfText,
          provider: aiProvider,
          model: aiModel,
          useBackup: useGeminiBackup,
          isPresentation: false
        },
      });

      if (error) {
        console.error('Error calling Multi-AI function:', error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error('AI analysis error:', data.error);
        let errorMessage = 'Sorry, I encountered an error while analyzing the document.';
        
        if (data.error.includes('API key')) {
          errorMessage = `Please configure your ${aiProvider.toUpperCase()} API key in the project settings.`;
        } else if (data.error.includes('quota')) {
          errorMessage = `${aiProvider.toUpperCase()} API quota exceeded. Please try again later.`;
        }
        
        setQuestions((prev) => prev.map(q => 
          q.id === tempId 
            ? { ...q, answer: errorMessage, isLoading: false } 
            : q
        ));
        return;
      }

      setQuestions((prev) => prev.map(q => 
        q.id === tempId 
          ? { ...q, answer: data.answer, isLoading: false } 
          : q
      ));
    } catch (error) {
      console.error('Error asking question:', error);
      
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

  const askPresentationQuestion = async (questionText: string, useGeminiBackup: boolean = false) => {
    if (!presentationText) return;
    
    console.log('Asking presentation question:', questionText);
    console.log('Using AI provider:', aiProvider, 'model:', aiModel);
    
    const tempId = Date.now().toString();
    const loadingQuestion: Question = {
      id: tempId,
      text: questionText,
      answer: "Analyzing presentation...",
      timestamp: new Date(),
      isLoading: true,
    };
    
    setPresentationQuestions((prev) => [loadingQuestion, ...prev]);
    setIsPresentationAnswerLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('multi-ai-analysis', {
        body: {
          question: questionText,
          documentText: presentationText,
          provider: aiProvider,
          model: aiModel,
          useBackup: useGeminiBackup,
          isPresentation: true
        },
      });

      if (error) {
        console.error('Error calling Multi-AI function:', error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error('AI analysis error:', data.error);
        let errorMessage = 'Sorry, I encountered an error while analyzing the presentation.';
        
        if (data.error.includes('API key')) {
          errorMessage = `Please configure your ${aiProvider.toUpperCase()} API key in the project settings.`;
        } else if (data.error.includes('quota')) {
          errorMessage = `${aiProvider.toUpperCase()} API quota exceeded. Please try again later.`;
        }
        
        setPresentationQuestions((prev) => prev.map(q => 
          q.id === tempId 
            ? { ...q, answer: errorMessage, isLoading: false } 
            : q
        ));
        return;
      }

      console.log('Received presentation answer from:', data.provider, data.model);

      setPresentationQuestions((prev) => prev.map(q => 
        q.id === tempId 
          ? { ...q, answer: data.answer, isLoading: false } 
          : q
      ));
    } catch (error) {
      console.error('Error asking presentation question:', error);
      
      setPresentationQuestions((prev) => prev.map(q => 
        q.id === tempId 
          ? { 
              ...q, 
              answer: "Sorry, I encountered an error while analyzing the presentation. Please try again.", 
              isLoading: false 
            } 
          : q
      ));
    } finally {
      setIsPresentationAnswerLoading(false);
    }
  };

  const generateMCQs = async (numQuestions: number = 5, questionType: string = 'auto') => {
    if (!pdfText) return;
    
    setIsMCQGenerating(true);
    
    try {
      console.log('Generating MCQs from PDF text');
      // Call the Supabase Edge Function for MCQ generation
      const { data, error } = await supabase.functions.invoke('generate-mcqs', {
        body: {
          pdfText: pdfText,
          numQuestions: numQuestions,
          questionType: questionType,
        },
      });

      if (error) {
        console.error('Error calling MCQ generation function:', error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error('MCQ generation error:', data.error);
        throw new Error(data.error);
      }

      if (!data.mcqData) {
        throw new Error('Failed to generate MCQs');
      }

      // Parse the MCQ data
      const mcqData = JSON.parse(data.mcqData);
      
      if (!mcqData.questions || !Array.isArray(mcqData.questions)) {
        throw new Error('Invalid MCQ data format');
      }
      
      // Set the MCQ data
      setMCQSet({
        questions: mcqData.questions,
        generatedAt: new Date(),
      });
      
      console.log(`Generated ${mcqData.questions.length} MCQs successfully`);
    } catch (error) {
      console.error('Error generating MCQs:', error);
    } finally {
      setIsMCQGenerating(false);
    }
  };

  const generatePresentationMCQs = async (numQuestions: number = 5, questionType: string = 'auto') => {
    if (!presentationText) return;
    
    setIsMCQGenerating(true);
    
    try {
      console.log('Generating MCQs from presentation text, length:', presentationText.length);
      // Call the Supabase Edge Function for MCQ generation
      const { data, error } = await supabase.functions.invoke('generate-mcqs', {
        body: {
          pdfText: presentationText, // Use presentation text instead of PDF text
          numQuestions: numQuestions,
          questionType: questionType,
        },
      });

      if (error) {
        console.error('Error calling MCQ generation function:', error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error('MCQ generation error:', data.error);
        throw new Error(data.error);
      }

      if (!data.mcqData) {
        throw new Error('Failed to generate MCQs');
      }

      // Parse the MCQ data
      const mcqData = JSON.parse(data.mcqData);
      
      if (!mcqData.questions || !Array.isArray(mcqData.questions)) {
        throw new Error('Invalid MCQ data format');
      }
      
      // Set the MCQ data
      setMCQSet({
        questions: mcqData.questions,
        generatedAt: new Date(),
      });
      
      console.log(`Generated ${mcqData.questions.length} presentation MCQs successfully`);
    } catch (error) {
      console.error('Error generating presentation MCQs:', error);
    } finally {
      setIsMCQGenerating(false);
    }
  };

  const setUserAnswer = (questionIndex: number, answer: string) => {
    if (!mcqSet) return;
    
    setMCQSet(prev => {
      if (!prev) return null;
      
      const updatedQuestions = [...prev.questions];
      if (questionIndex >= 0 && questionIndex < updatedQuestions.length) {
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          userAnswer: answer
        };
      }
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  return (
    <PDFContext.Provider 
      value={{
        pdfFile,
        pdfUrl,
        pdfText,
        presentationFile,
        presentationText,
        currentPage,
        totalPages,
        isAnalyzing,
        questions,
        presentationQuestions,
        isAnswerLoading,
        isPresentationAnswerLoading,
        mcqSet,
        isMCQGenerating,
        aiProvider,
        aiModel,
        setPdfFile,
        setPdfUrl,
        setPdfText,
        setPresentationFile,
        setPresentationText,
        setCurrentPage,
        setTotalPages,
        setIsAnalyzing,
        setQuestions,
        setPresentationQuestions,
        addQuestion,
        addPresentationQuestion,
        askQuestion,
        askPresentationQuestion,
        generateMCQs,
        generatePresentationMCQs,
        setUserAnswer,
        setAiProvider,
        setAiModel,
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
