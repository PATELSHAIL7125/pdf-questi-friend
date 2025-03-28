
import React, { useState, useEffect } from 'react';
import { usePDF } from '@/context/PDFContext';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PresentationQuestionInput from './PresentationQuestionInput';
import PresentationAnswerDisplay from './PresentationAnswerDisplay';
import { Button } from '@/components/ui/button';

const PresentationViewer: React.FC = () => {
  const { presentationFile, presentationText } = usePDF();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [presentationName, setPresentationName] = useState('');
  const [slideContent, setSlideContent] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  
  useEffect(() => {
    if (presentationFile) {
      // Format the file size
      const size = presentationFile.size < 1000000 
        ? `${(presentationFile.size / 1024).toFixed(1)} KB` 
        : `${(presentationFile.size / 1048576).toFixed(1)} MB`;
      setFileSize(size);
      
      // Format the uploaded date
      setUploadDate(new Date().toLocaleDateString());
    }
  }, [presentationFile]);
  
  useEffect(() => {
    if (presentationText) {
      // Process presentation content
      const lines = presentationText.split('\n');
      const name = lines[0].replace('Presentation: ', '');
      setPresentationName(name);
      
      // Count total slides
      const slideCount = lines.filter(line => line.trim().startsWith('Slide')).length;
      setTotalSlides(slideCount);
      
      // Update content for current slide
      updateSlideContent(currentSlide, lines);
    }
  }, [presentationText, currentSlide]);
  
  // Early return with null if no presentation is loaded
  if (!presentationFile || !presentationText) {
    return null;
  }

  const updateSlideContent = (slideNum: number, lines: string[]) => {
    const slideMarker = `Slide ${slideNum}:`;
    const nextSlideMarker = `Slide ${slideNum + 1}:`;
    
    let startIdx = -1;
    let endIdx = lines.length;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(slideMarker)) {
        startIdx = i;
      } else if (startIdx !== -1 && lines[i].includes(nextSlideMarker)) {
        endIdx = i;
        break;
      }
    }
    
    if (startIdx === -1) {
      setSlideContent("Slide content not found");
    } else {
      setSlideContent(lines.slice(startIdx, endIdx).join('\n'));
    }
  };
  
  const increaseZoom = () => {
    setZoomLevel(prev => Math.min(prev + 20, 200));
  };
  
  const decreaseZoom = () => {
    setZoomLevel(prev => Math.max(prev - 20, 60));
  };
  
  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(prev => prev + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <Card className="w-full max-w-4xl mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-lg">{presentationFile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {fileSize} • Uploaded {uploadDate}
              </p>
            </div>
          </div>
          
          <div className="rounded-lg border p-4 bg-secondary/30 mb-4">
            <div className="text-lg font-medium mb-2">
              Presentation content extracted:
            </div>
            <div className="text-lg font-medium mb-2">{presentationName}</div>
            <div 
              className="p-6 bg-white border rounded-lg shadow-sm" 
              style={{ 
                fontSize: `${zoomLevel}%`,
                transition: 'all 0.2s ease',
                minHeight: '300px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {slideContent}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={currentSlide <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={decreaseZoom}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">Zoom: {zoomLevel}%</span>
              
              <Button variant="outline" size="icon" onClick={increaseZoom}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm">
              Slide {currentSlide} of {totalSlides}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentSlide >= totalSlides}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <PresentationQuestionInput />
      <PresentationAnswerDisplay />
    </div>
  );
};

export default PresentationViewer;
