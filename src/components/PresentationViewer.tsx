
import React, { useState, useEffect } from 'react';
import { usePDF } from '@/context/PDFContext';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateSlidePreview } from '@/utils/api/auth/pptxUtils';
import { useToast } from '@/components/ui/use-toast';
import PresentationQuestionInput from '@/components/PresentationQuestionInput';
import PresentationAnswerDisplay from '@/components/PresentationAnswerDisplay';

const PresentationViewer: React.FC = () => {
  const { presentationFile, presentationText } = usePDF();
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [presentationName, setPresentationName] = useState('');
  const [slideContent, setSlideContent] = useState('');
  const [slideDataUrl, setSlideDataUrl] = useState<string>('');
  const [slideMap, setSlideMap] = useState<Map<number, string>>(new Map());
  
  useEffect(() => {
    if (presentationText) {
      // Process presentation content
      const lines = presentationText.split('\n\n');
      
      // Extract presentation name
      const firstLine = lines[0];
      const name = firstLine.replace('Presentation: ', '');
      setPresentationName(name);
      
      // Count total slides
      const slideCount = lines.filter(line => line.trim().startsWith('Slide')).length;
      setTotalSlides(slideCount);
      
      console.log(`Presentation has ${slideCount} slides`);
      
      // Create a map of slide numbers to content
      const newSlideMap = new Map<number, string>();
      lines.forEach(line => {
        const slideMatch = line.match(/^Slide (\d+):/);
        if (slideMatch) {
          const slideNum = parseInt(slideMatch[1]);
          newSlideMap.set(slideNum, line);
        }
      });
      setSlideMap(newSlideMap);
      
      // Update content for current slide
      updateSlideContent(currentSlide, newSlideMap);
    }
  }, [presentationText, currentSlide]);
  
  // Early return with null if no presentation is loaded
  if (!presentationFile || !presentationText) {
    return null;
  }

  const updateSlideContent = (slideNum: number, slideContentMap: Map<number, string>) => {
    const content = slideContentMap.get(slideNum);
    
    if (content) {
      setSlideContent(content);
      // Generate the slide preview image
      const dataUrl = generateSlidePreview(slideNum, content);
      setSlideDataUrl(dataUrl);
    } else {
      const fallbackContent = `Slide ${slideNum}:\nSlide content not found.`;
      setSlideContent(fallbackContent);
      setSlideDataUrl(generateSlidePreview(slideNum, fallbackContent));
    }
  };
  
  // Format the file size
  const fileSize = presentationFile.size < 1000000 
    ? `${(presentationFile.size / 1024).toFixed(1)} KB` 
    : `${(presentationFile.size / 1048576).toFixed(1)} MB`;
  
  // Format the uploaded date
  const uploadDate = new Date().toLocaleDateString();
  
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

  const handleDownload = () => {
    // Create a link to download the original file
    const url = URL.createObjectURL(presentationFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = presentationFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${presentationFile.name} is being downloaded.`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: presentationName,
          text: `Check out this presentation: ${presentationName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Presentation link copied to clipboard.",
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <Card className="w-full max-w-6xl mb-6 overflow-hidden shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
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
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg border bg-background overflow-hidden shadow-inner">
            <div className="bg-muted/30 p-4 border-b">
              <div className="text-lg font-medium text-center">{presentationName}</div>
            </div>
            
            <div className="p-6 bg-white dark:bg-muted/20">
              {/* Slide preview image */}
              <div 
                className="w-full border rounded-lg shadow-lg overflow-hidden bg-white mb-4 mx-auto transition-all duration-300"
                style={{ 
                  maxWidth: `${Math.min(zoomLevel, 100)}%`,
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'center top'
                }}
              >
                <img 
                  src={slideDataUrl} 
                  alt={`Slide ${currentSlide}`}
                  className="w-full h-auto block"
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide <= 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={decreaseZoom}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium min-w-[80px] text-center">
                {zoomLevel}%
              </span>
              
              <Button variant="outline" size="sm" onClick={increaseZoom}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm font-medium">
              {currentSlide} of {totalSlides}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide >= totalSlides}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Input Section */}
      <div className="w-full max-w-4xl mb-6">
        <PresentationQuestionInput />
        <PresentationAnswerDisplay />
      </div>
    </div>
  );
};

export default PresentationViewer;
