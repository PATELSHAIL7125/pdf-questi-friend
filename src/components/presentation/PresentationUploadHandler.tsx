
import React, { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { usePDF } from '@/context/PDFContext';

interface PresentationUploadHandlerProps {
  children: (props: {
    isDragging: boolean;
    uploadProgress: number;
    showFormatWarning: boolean;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBrowseClick: () => void;
  }) => React.ReactNode;
}

const PresentationUploadHandler: React.FC<PresentationUploadHandlerProps> = ({ children }) => {
  const { toast } = useToast();
  const { setPresentationFile, setPresentationText } = usePDF();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFormatWarning, setShowFormatWarning] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      setShowFormatWarning(true);
      toast({
        title: "Not a PowerPoint file",
        description: "This doesn't appear to be a PowerPoint file (.ppt or .pptx). Results may vary.",
        variant: "default"
      });
    }

    try {
      setPresentationFile(file);
      
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          
          // Extract presentation content from the filename for now
          // In a real implementation, we would parse the actual PPT file
          const presentationContent = extractPresentationContent(file.name);
          
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
      setShowFormatWarning(false);
      setPresentationFile(null);
      setPresentationText(null);
    }
  };

  const extractPresentationContent = (filename: string) => {
    const nameWithoutExt = filename.replace(/\.(pptx|ppt)$/i, '');
    
    return `Presentation: ${nameWithoutExt}
            
Slide 1: Introduction
- Welcome to the presentation
- Overview of key topics

Slide 2: Main Points
- First important point about the topic
- Second important consideration
- Supporting statistics and data

Slide 3: Analysis
- Detailed analysis of the situation
- Findings from research
- Implications for stakeholders

Slide 4: Recommendations
- Strategic recommendations
- Implementation steps
- Timeline and milestones

Slide 5: Conclusion
- Summary of key takeaways
- Next steps
- Questions and discussion`;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        id="presentation-upload"
        type="file"
        accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileInput}
        className="hidden"
      />
      {children({
        isDragging,
        uploadProgress,
        showFormatWarning,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileInput,
        handleBrowseClick
      })}
    </>
  );
};

export default PresentationUploadHandler;
