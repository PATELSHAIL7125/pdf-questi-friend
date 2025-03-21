
import React from 'react';
import Header from '@/components/Header';
import PDFUploader from '@/components/PDFUploader';
import PDFViewer from '@/components/PDFViewer';
import QuestionInput from '@/components/QuestionInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import { PDFProvider, usePDF } from '@/context/PDFContext';

const IndexContent: React.FC = () => {
  const { pdfUrl } = usePDF();
  
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 bg-background">
      <div className="w-full max-w-5xl">
        <Header />
        
        {!pdfUrl ? (
          <div className="my-12">
            <PDFUploader />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <PDFViewer />
            <QuestionInput />
            <AnswerDisplay />
          </div>
        )}
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <PDFProvider>
      <IndexContent />
    </PDFProvider>
  );
};

export default Index;