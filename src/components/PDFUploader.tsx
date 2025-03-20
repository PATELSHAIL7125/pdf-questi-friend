
import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import { loadPdf, extractTextFromPdf } from '@/utils/pdfUtils';
import { useToast } from '@/components/ui/use-toast';

const PDFUploader: React.FC = () => {
  const { toast } = useToast();
  const { 
    setPdfFile, 
    setPdfUrl, 
    setPdfText, 
    setTotalPages, 
    setCurrentPage,
    setIsAnalyzing 
  } = usePDF();
  const [isDragging, setIsDragging] = useState(false);
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
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setPdfFile(file);
      
      // Create a URL for the PDF file
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
      
      // Load the PDF and extract text
      const pdfDocument = await loadPdf(fileUrl);
      setTotalPages(pdfDocument.numPages);
      setCurrentPage(1);
      
      const text = await extractTextFromPdf(pdfDocument);
      setPdfText(text);
      
      toast({
        title: "PDF uploaded successfully",
        description: `${pdfDocument.numPages} pages loaded. You can now ask questions about this document.`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error processing PDF",
        description: "There was an error loading your PDF. Please try again.",
        variant: "destructive"
      });
      setPdfFile(null);
      setPdfUrl(null);
      setPdfText(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetPdf = () => {
    setPdfFile(null);
    setPdfUrl(null);
    setPdfText(null);
    setTotalPages(0);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full animate-slide-up">
      <input
        ref={fileInputRef}
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-md h-40 rounded-xl border-2 border-dashed 
          flex flex-col items-center justify-center p-6 transition-all duration-200
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }
        `}
      >
        <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-sm font-medium mb-1">Drag & drop your PDF here</p>
        <p className="text-xs text-muted-foreground mb-3">or</p>
        <Button 
          variant="outline" 
          className="button-transition hover:bg-primary hover:text-white"
          onClick={handleBrowseClick}
        >
          <FileText className="mr-2 h-4 w-4" />
          Browse files
        </Button>
      </div>
      
      {/* File info section - initially hidden, shown when a file is uploaded */}
      <div className="w-full max-w-md mt-6 hidden">
        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium truncate w-48">document-name.pdf</p>
              <p className="text-xs text-muted-foreground">2.4 MB • 24 pages</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetPdf}
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
