
import React from 'react';
import { Presentation } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface UploadInformationProps {
  showFormatWarning: boolean;
}

const UploadInformation: React.FC<UploadInformationProps> = ({ showFormatWarning }) => {
  return (
    <>
      {showFormatWarning && (
        <Alert className="mb-4">
          <AlertTitle>File format notice</AlertTitle>
          <AlertDescription>
            This doesn't appear to be a PowerPoint file (.ppt or .pptx). Results may vary.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-6">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">Supported files: PowerPoint (.ppt, .pptx)</p>
          <div className="flex items-center text-sm text-muted-foreground">
            <Presentation className="h-4 w-4 mr-1" />
            <span>Maximum file size: 10 MB</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadInformation;
