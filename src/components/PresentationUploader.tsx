import React, { useCallback, useState, useRef } from 'react';
import { Upload, Presentation, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { usePDF } from '@/context/PDFContext';
import PresentationQuestionInput from './PresentationQuestionInput';
import PresentationAnswerDisplay from './PresentationAnswerDisplay';
import { extractPresentationText } from '@/utils/api/auth/pptxUtils'; // Adjust the import path as necessary
import { supabase } from '@/lib/supabase';

const PresentationUploader: React.FC = () => {
  const { toast } = useToast();
  const { setPresentationFile, setPresentationText, presentationText } = usePDF();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    await handleFiles(files);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await handleFiles(files);
    }
  }, []);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const allowedTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PowerPoint file (.ppt or .pptx)",
        variant: "destructive"
      });
      return;
    }

    try {
      setFileName(file.name);
      setPresentationFile(file);
      
      // Track the upload in the database
      const { error: uploadError } = await supabase
        .from('user_uploads')
        .insert({
          file_name: file.name,
          file_type: 'ppt',
        });

      if (uploadError) {
        console.error('Error tracking upload:', uploadError);
      }
      
      // Simulate upload progress
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploaded(true);
          
          // Extract text from presentation
          const presentationContent = await extractPresentationText(file);
          setPresentationText(presentationContent);
          
          toast({
            title: "Presentation uploaded successfully",
            description: `${file.name} has been uploaded. You can now ask questions about this presentation.`,
          });
        }
      }, 150);
      
    } catch (error) {
      console.error('Error processing presentation:', error);
      toast({
        title: "Error processing presentation",
        description: "There was an error loading your presentation. Please try again.",
        variant: "destructive"
      });
      setUploadProgress(0);
      setIsUploaded(false);
      setFileName(null);
      setPresentationFile(null);
      setPresentationText(null);
    }
  };

  const resetUpload = () => {
    setIsUploaded(false);
    setFileName(null);
    setUploadProgress(0);
    setPresentationFile(null);
    setPresentationText(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full animate-slide-up">
      {!isUploaded ? (
        <>
          <div className="w-full max-w-2xl mb-8">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 to-background p-6 flex items-center justify-center">
                <Presentation className="h-16 w-16 text-primary" />
                <div className="ml-4 text-left">
                  <h2 className="text-2xl font-bold text-foreground">Presentation Insight</h2>
                  <p className="text-muted-foreground">Upload your PowerPoint to start analyzing</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <input
                  ref={fileInputRef}
                  id="presentation-upload"
                  type="file"
                  accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
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
                
                <div className="mt-6">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">Supported files: PowerPoint (.ppt, .pptx)</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Presentation className="h-4 w-4 mr-1" />
                      <span>Maximum file size: 10 MB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-border">
              <div className="bg-primary/10 p-2 rounded-full mb-2">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Upload Presentation</h3>
              <p className="text-xs text-center text-muted-foreground mt-1">Drag & drop or browse</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-border">
              <div className="bg-primary/10 p-2 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium">Ask Questions</h3>
              <p className="text-xs text-center text-muted-foreground mt-1">Get instant answers</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-border">
              <div className="bg-primary/10 p-2 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-sm font-medium">Get Insights</h3>
              <p className="text-xs text-center text-muted-foreground mt-1">Extract key information</p>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-full flex justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={resetUpload}
                className="flex items-center gap-2"
              >
                <FileUp className="h-4 w-4" />
                Upload New Presentation
              </Button>
            </div>
            
            <div className="flex flex-col items-center p-6 border border-primary/20 rounded-xl mb-8 w-full">
              <Presentation className="h-12 w-12 mb-4 text-primary" />
              <p className="text-lg font-medium mb-2">{fileName}</p>
              <p className="text-sm text-muted-foreground mb-4">Uploaded successfully</p>
            </div>
          </div>
          
          <PresentationQuestionInput />
          <PresentationAnswerDisplay />
        </div>
      )}
    </div>
  );
};

export default PresentationUploader;
