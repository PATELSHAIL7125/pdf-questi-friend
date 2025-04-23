
import * as JSZip from 'jszip';

// Function to extract text content from slides
export const extractPresentationText = async (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Read the file as a zip
      const zip = await JSZip.loadAsync(file);
      
      // Array to store extracted text
      const extractedText: string[] = [];
      
      // Add presentation title
      extractedText.push(`Presentation: ${file.name.replace('.pptx', '').replace('.ppt', '')}`);

      // Find all slide files
      const slideFiles = Object.keys(zip.files)
        .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
        .sort((a, b) => {
          // Sort slides by number
          const numA = parseInt(a.replace(/\D/g, ''));
          const numB = parseInt(b.replace(/\D/g, ''));
          return numA - numB;
        });

      console.log(`Found ${slideFiles.length} slides in the presentation`);
      
      // Process each slide
      for (let i = 0; i < slideFiles.length; i++) {
        const slidePath = slideFiles[i];
        const slideNumber = i + 1;
        
        // Read slide XML
        const slideXml = await zip.file(slidePath)?.async('string');
        
        if (slideXml) {
          // Begin with slide header
          let slideContent = [`Slide ${slideNumber}:`];
          
          // Multiple pattern matching for different PowerPoint formats
          const patterns = [
            /<a:t>([^<]+)<\/a:t>/g,                 // Standard text
            /<a:t xml[^>]*>([^<]+)<\/a:t>/g,        // Text with XML namespace
            /<a:fld[^>]*><a:t>([^<]+)<\/a:t><\/a:fld>/g, // Field text
            /<a:r><a:t>([^<]+)<\/a:t><\/a:r>/g,     // Run text
            /<a:p>.*?<a:t>([^<]+)<\/a:t>.*?<\/a:p>/gs // Paragraph text
          ];
          
          let slideTexts = [];
          
          // Try each pattern
          for (const pattern of patterns) {
            const matches = slideXml.matchAll(pattern);
            for (const match of matches) {
              if (match[1] && match[1].trim()) {
                slideTexts.push(match[1].trim());
              }
            }
          }
          
          // If we found text with any pattern
          if (slideTexts.length > 0) {
            slideContent.push(slideTexts.join(' '));
            extractedText.push(slideContent.join('\n'));
          } else {
            // Handle empty slides
            extractedText.push(`Slide ${slideNumber}:\n(No text content on this slide)`);
          }
        }
      }
      
      // If no slides were found or processed
      if (extractedText.length <= 1) {
        console.error('No slide content could be extracted');
        // Try to extract from presentation props as fallback
        try {
          const presentationXml = await zip.file('docProps/core.xml')?.async('string');
          if (presentationXml) {
            const titleMatch = presentationXml.match(/<dc:title>([^<]+)<\/dc:title>/);
            const subjectMatch = presentationXml.match(/<dc:subject>([^<]+)<\/dc:subject>/);
            
            if (titleMatch && titleMatch[1]) {
              extractedText.push(`Presentation Title: ${titleMatch[1]}`);
            }
            
            if (subjectMatch && subjectMatch[1]) {
              extractedText.push(`Subject: ${subjectMatch[1]}`);
            }
            
            // Add placeholder slide
            extractedText.push(`Slide 1:\nUnable to extract detailed content from this presentation format.`);
          }
        } catch (e) {
          console.error('Fallback extraction failed:', e);
        }
      }

      console.log(`Extracted ${extractedText.length} text segments from presentation`);
      
      // Resolve with extracted text
      resolve(extractedText.join('\n\n'));
    } catch (error) {
      console.error('Error extracting presentation text:', error);
      reject(error);
    }
  });
};

// Function to extract slide images from the PPTX file
export const extractSlideImages = async (file: File): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const zip = await JSZip.loadAsync(file);
      const slideImages: string[] = [];
      
      // Get all image relationships from the media folder
      const mediaFiles = Object.keys(zip.files)
        .filter(name => name.startsWith('ppt/media/') && 
               (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')));
      
      console.log(`Found ${mediaFiles.length} media files in presentation`);
      
      // Get all slides
      const slideFiles = Object.keys(zip.files)
        .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''));
          const numB = parseInt(b.replace(/\D/g, ''));
          return numA - numB;
        });
      
      // Find slide thumbnails from the presentation
      for (let i = 0; i < slideFiles.length; i++) {
        // This is a placeholder - we'll generate a base64 data URL for each slide
        slideImages.push(`slide-${i+1}`);
      }
      
      // If no images were extracted, generate placeholder URLs
      if (slideImages.length === 0) {
        console.warn('No slide images could be extracted, using placeholders');
        const numSlides = slideFiles.length || 1;
        for (let i = 0; i < numSlides; i++) {
          slideImages.push(`slide-${i+1}-placeholder`);
        }
      }
      
      resolve(slideImages);
    } catch (error) {
      console.error('Error extracting slide images:', error);
      reject(error);
    }
  });
};

// Generate a data URL for a given slide with its text content
export const generateSlidePreview = (slideNumber: number, slideText: string): string => {
  // Create a canvas element to render the slide
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  
  // Get the 2D context
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Draw slide background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw slide border
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  
  // Add slide number
  ctx.fillStyle = '#333333';
  ctx.font = '16px Arial';
  ctx.fillText(`Slide ${slideNumber}`, 20, 30);
  
  // Draw a gradient header
  const gradient = ctx.createLinearGradient(0, 40, 0, 100);
  gradient.addColorStop(0, '#f0f0f0');
  gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 40, canvas.width, 60);
  
  // Extract the first line as title (if it exists)
  const lines = slideText.split('\n');
  let title = '';
  let content = '';
  
  if (lines.length > 0) {
    // Skip "Slide X:" prefix if it exists
    if (lines[0].startsWith('Slide ') && lines[0].includes(':')) {
      if (lines.length > 1) {
        title = lines[1];
        content = lines.slice(2).join('\n');
      }
    } else {
      title = lines[0];
      content = lines.slice(1).join('\n');
    }
  }
  
  // Draw title
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 24px Arial';
  wrapText(ctx, title, 40, 80, canvas.width - 80, 32);
  
  // Draw content
  ctx.fillStyle = '#444444';
  ctx.font = '18px Arial';
  wrapText(ctx, content, 40, 140, canvas.width - 80, 24);
  
  // Return the canvas as a data URL
  return canvas.toDataURL('image/png');
};

// Helper function to wrap text within a width
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let testLine = '';
  let lineCount = 0;
  
  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y + (lineCount * lineHeight));
      line = words[n] + ' ';
      lineCount++;
      
      // Limit to 12 lines to prevent overflow
      if (lineCount >= 12) {
        ctx.fillText(line + '...', x, y + (lineCount * lineHeight));
        break;
      }
    } else {
      line = testLine;
    }
  }
  
  // Draw the last line
  if (lineCount < 12) {
    ctx.fillText(line, x, y + (lineCount * lineHeight));
  }
}
