
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { usePDF } from '@/context/PDFContext';
import PresentationHeader from './presentation/PresentationHeader';
import UploadDropzone from './presentation/UploadDropzone';
import UploadInformation from './presentation/UploadInformation';
import FeatureGrid from './presentation/FeatureGrid';
import PresentationUploadHandler from './presentation/PresentationUploadHandler';

const PresentationUploader: React.FC = () => {
  const { presentationFile } = usePDF();
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Reset upload state when file is removed
  const resetUpload = () => {
    setIsUploaded(false);
    setFileName(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full animate-slide-up">
      {!isUploaded && !presentationFile ? (
        <>
          <div className="w-full max-w-2xl mb-8">
            <Card className="border-none shadow-lg overflow-hidden">
              <PresentationHeader />
              
              <CardContent className="p-6">
                <PresentationUploadHandler>
                  {({ 
                    isDragging, 
                    uploadProgress, 
                    showFormatWarning,
                    handleDragOver, 
                    handleDragLeave, 
                    handleDrop, 
                    handleBrowseClick 
                  }) => (
                    <>
                      <UploadInformation showFormatWarning={showFormatWarning} />
                      
                      <UploadDropzone 
                        isDragging={isDragging}
                        uploadProgress={uploadProgress}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        handleBrowseClick={handleBrowseClick}
                      />
                    </>
                  )}
                </PresentationUploadHandler>
              </CardContent>
            </Card>
          </div>

          <FeatureGrid />
        </>
      ) : null}
    </div>
  );
};

export default PresentationUploader;
