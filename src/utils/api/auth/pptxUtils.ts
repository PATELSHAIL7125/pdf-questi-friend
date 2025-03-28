import * as JSZip from 'jszip';

export const extractPresentationText = async (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Read the file as a zip
      const zip = await JSZip.loadAsync(file);
      
      // Array to store extracted text
      const extractedText: string[] = [];

      // Find all slide files
      const slideFiles = Object.keys(zip.files)
        .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));

      // Process each slide
      for (const slidePath of slideFiles) {
        // Read slide XML
        const slideXml = await zip.file(slidePath)?.async('string');
        
        if (slideXml) {
          // Simple text extraction using regex
          const textMatches = slideXml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
          
          const slideText = textMatches
            .map(match => {
              // Extract text between tags
              const textMatch = match.match(/>([^<]+)</);
              return textMatch ? textMatch[1] : '';
            })
            .filter(Boolean)
            .join(' ');
          
          if (slideText.trim()) {
            extractedText.push(slideText);
          }
        }
      }

      // Resolve with extracted text
      resolve(extractedText.join('\n\n'));
    } catch (error) {
      console.error('Error extracting presentation text:', error);
      reject(error);
    }
  });
};