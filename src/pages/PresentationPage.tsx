
import React from 'react';
import Header from '@/components/Header';
import PresentationUploader from '@/components/PresentationUploader';
import PresentationViewer from '@/components/PresentationViewer';
import { Button } from '@/components/ui/button';
import { FileIcon, Presentation, FileUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFProvider, usePDF } from '@/context/PDFContext';

const PresentationContent: React.FC = () => {
  const { presentationFile, setPresentationFile, setPresentationText } = usePDF();
  
  const handleUploadNew = () => {
    setPresentationFile(null);
    setPresentationText(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-5xl">
        <Header />
        
        {!presentationFile ? (
          <div className="my-12">
            <div className="flex gap-4 mb-8 justify-center">
              <Link to="/">
                <Button variant="outline" className="flex items-center gap-2 px-6" size="lg">
                  <FileIcon className="h-5 w-5" />
                  PDF Upload
                </Button>
              </Link>
              <Link to="/presentation">
                <Button variant="outline" className="flex items-center gap-2 px-6" size="lg">
                  <Presentation className="h-5 w-5" />
                  PowerPoint Upload
                </Button>
              </Link>
            </div>
            <PresentationUploader />
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
                Upload New Presentation
              </Button>
            </div>
            <PresentationViewer />
          </div>
        )}
      </div>
    </div>
  );
};

const PresentationPage: React.FC = () => {
  return (
    <PDFProvider>
      <PresentationContent />
    </PDFProvider>
  );
};

export default PresentationPage;
