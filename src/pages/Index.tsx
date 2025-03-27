
import React from 'react';
import Header from '@/components/Header';
import PDFUploader from '@/components/PDFUploader';
import PDFViewer from '@/components/PDFViewer';
import QuestionInput from '@/components/QuestionInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import { PDFProvider, usePDF } from '@/context/PDFContext';
import { Button } from '@/components/ui/button';
import { FileUp, FilePresentation, FilePdf } from 'lucide-react';
import { Link } from 'react-router-dom';

const IndexContent: React.FC = () => {
  const { pdfUrl, setPdfFile, setPdfUrl, setPdfText, setTotalPages, setCurrentPage, setQuestions } = usePDF();
  
  const handleUploadNew = () => {
    setPdfFile(null);
    setPdfUrl(null);
    setPdfText(null);
    setTotalPages(0);
    setCurrentPage(1);
    setQuestions([]);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-5xl">
        <Header />
        
        {!pdfUrl ? (
          <div className="my-12">
            <div className="flex gap-4 mb-8 justify-center">
              <Link to="/">
                <Button variant="outline" className="flex items-center gap-2 px-6" size="lg">
                  <FilePdf className="h-5 w-5" />
                  PDF Upload
                </Button>
              </Link>
              <Link to="/presentation">
                <Button variant="outline" className="flex items-center gap-2 px-6" size="lg">
                  <FilePresentation className="h-5 w-5" />
                  PowerPoint Upload
                </Button>
              </Link>
            </div>
            <PDFUploader />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={handleUploadNew}
                className="flex items-center gap-2"
              >
                <FileUp className="h-4 w-4" />
                Upload New PDF
              </Button>
            </div>
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
