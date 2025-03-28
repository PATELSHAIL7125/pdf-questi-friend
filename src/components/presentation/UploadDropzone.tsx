
import React, { useCallback } from 'react';
import { Presentation, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadDropzoneProps {
  isDragging: boolean;
  uploadProgress: number;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleBrowseClick: () => void;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  isDragging,
  uploadProgress,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleBrowseClick,
}) => {
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-48 rounded-xl border-2 border-dashed 
        flex flex-col items-center justify-center p-6 transition-all duration-200
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-105' 
          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        }
      `}
    >
      {uploadProgress > 0 && uploadProgress < 100 ? (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-xs bg-secondary h-2 rounded-full mb-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-200 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">Uploading {uploadProgress}%</p>
        </div>
      ) : (
        <>
          <Presentation className={`w-12 h-12 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-lg font-medium mb-2">Drag & drop your presentation here</p>
          <p className="text-sm text-muted-foreground mb-4">or</p>
          <Button 
            size="lg"
            className="button-transition hover:bg-primary hover:text-white"
            onClick={handleBrowseClick}
          >
            <FileUp className="mr-2 h-5 w-5" />
            Browse files
          </Button>
        </>
      )}
    </div>
  );
};

export default UploadDropzone;
