
import * as JSZip from 'jszip';

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
