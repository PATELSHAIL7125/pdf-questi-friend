
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDF } from '@/context/PDFContext';
import * as pdfjs from 'pdfjs-dist';

const PDFViewer: React.FC = () => {
  const { pdfUrl, currentPage, totalPages, setCurrentPage } = usePDF();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.5);
  
  // Function to render the current page
  const renderPage = async () => {
    if (!pdfUrl || !canvasRef.current) return;
    
    try {
      setIsLoading(true);
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context!,
        viewport
      }).promise;
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      setIsLoading(false);
    }
  };
  
  // Navigate to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Navigate to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Render the page when the component mounts or currentPage changes
  useEffect(() => {
    if (pdfUrl) {
      renderPage();
    }
  }, [pdfUrl, currentPage, scale]);
  
  if (!pdfUrl) {
    return null;
  }
  
  return (
    <div className="w-full flex flex-col items-center px-4 animate-fade-in">
      <div className="relative w-full max-w-2xl mb-4 glass-panel rounded-xl p-4 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}
        
        <div className="overflow-auto max-h-[70vh] flex justify-center">
          <canvas ref={canvasRef} className="shadow-lg" />
        </div>
      </div>
      
      {/* PDF Navigation Controls */}
      <div className="flex items-center justify-between w-full max-w-md mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage <= 1}
          className="button-transition"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <span className="text-sm">
          Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          className="button-transition"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;
