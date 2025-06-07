
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
  canvas.width = 1280;
  canvas.height = 720;
  
  // Get the 2D context
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Draw slide background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#f8fafc');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw slide border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
  // Draw header background
  const headerGradient = ctx.createLinearGradient(0, 0, 0, 100);
  headerGradient.addColorStop(0, '#3b82f6');
  headerGradient.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = headerGradient;
  ctx.fillRect(0, 0, canvas.width, 100);
  
  // Add slide number in header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Slide ${slideNumber}`, 50, 65);
  
  // Extract content from slide text
  const lines = slideText.split('\n').filter(line => line.trim() !== '');
  let contentLines = [];
  
  // Skip the "Slide X:" line if present
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('Slide ')) {
      contentLines.push(line);
    } else if (line.startsWith('Slide ') && line.includes(':') && i < lines.length - 1) {
      // Skip this line as it's just the slide header
      continue;
    }
  }
  
  // Draw content
  let yPosition = 150;
  const lineHeight = 40;
  const maxWidth = canvas.width - 100;
  
  // Set content styling
  ctx.fillStyle = '#1e293b';
  ctx.font = '28px Arial, sans-serif';
  ctx.textAlign = 'left';
  
  // Process and draw each line
  for (let i = 0; i < Math.min(contentLines.length, 12); i++) {
    const line = contentLines[i];
    if (line.trim()) {
      // Handle long lines by wrapping them
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          // Draw current line and start new one
          ctx.fillText(currentLine, 50, yPosition);
          yPosition += lineHeight;
          currentLine = word;
          
          // Stop if we're running out of space
          if (yPosition > canvas.height - 100) break;
        } else {
          currentLine = testLine;
        }
      }
      
      // Draw the last line
      if (currentLine && yPosition <= canvas.height - 100) {
        ctx.fillText(currentLine, 50, yPosition);
        yPosition += lineHeight;
      }
      
      // Add some extra space between paragraphs
      yPosition += 10;
    }
    
    // Stop if we're running out of space
    if (yPosition > canvas.height - 100) break;
  }
  
  // Add decorative footer
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(50, canvas.height - 50, canvas.width - 100, 3);
  
  // Add branding
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('PDF Insight - PowerPoint Analysis', canvas.width - 50, canvas.height - 20);
  
  // Return the canvas as a data URL
  return canvas.toDataURL('image/png');
};

// Helper function to wrap text within a width with better formatting
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let testLine = '';
  let lineCount = 0;
  const maxLines = 15; // Limit to prevent overflow
  
  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y + (lineCount * lineHeight));
      line = words[n] + ' ';
      lineCount++;
      
      // Stop if we've reached max lines
      if (lineCount >= maxLines) {
        ctx.fillText(line + '...', x, y + (lineCount * lineHeight));
        break;
      }
    } else {
      line = testLine;
    }
  }
  
  // Draw the last line if we haven't exceeded max lines
  if (lineCount < maxLines) {
    ctx.fillText(line, x, y + (lineCount * lineHeight));
  }
}
