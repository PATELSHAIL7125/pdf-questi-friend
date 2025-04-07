// import * as JSZip from 'jszip';

// export const extractPresentationText = async (file: File): Promise<string> => {
//   try {
//     // Read the file as a zip
//     const zip = await JSZip.loadAsync(file);

//     // Array to store extracted text
//     const extractedText: string[] = [];

//     // Find all slide files
//     const slideFiles = Object.keys(zip.files)
//       .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));

//     // Process each slide
//     for (const slidePath of slideFiles) {
//       // Read slide XML
//       const slideXml = await zip.file(slidePath)?.async('string');

//       if (slideXml) {
//         // More comprehensive text extraction patterns
//         const textPatterns = [
//           /<a:t[^>]*>(.*?)<\/a:t>/g,
//           /<a:t[^>]*>\s*(.*?)\s*<\/a:t>/gs,
//           />\s*(.*?)\s*<\/a:t>/gs
//         ];

//         let slideText = '';
//         for (const pattern of textPatterns) {
//           const matches = slideXml.match(pattern);
//           if (matches) {
//             slideText = matches
//               .map(match => {
//                 // Extract text, remove XML tags, decode HTML entities
//                 return match
//                   .replace(/<[^>]*>/g, '')
//                   .replace(/&amp;/g, '&')
//                   .replace(/&lt;/g, '<')
//                   .replace(/&gt;/g, '>')
//                   .replace(/&quot;/g, '"')
//                   .replace(/&#39;/g, "'")
//                   .trim();
//               })
//               .filter(text => text.length > 0)
//               .join(' ');
            
//             if (slideText) break;
//           }
//         }

//         if (slideText.trim()) {
//           extractedText.push(slideText);
//         }
//       }
//     }

//     // If no text found, try core XML
//     if (extractedText.length === 0) {
//       const coreXml = await zip.file('docProps/core.xml')?.async('string');
//       if (coreXml) {
//         const titleMatch = coreXml.match(/<dc:title>(.*?)<\/dc:title>/);
//         if (titleMatch) {
//           extractedText.push(titleMatch[1]);
//         }
//       }
//     }

//     // Resolve with extracted text
//     const finalText = extractedText.join('\n\n');
//     return finalText.length > 0 
//       ? finalText 
//       : 'No text content found in the presentation.';

//   } catch (error) {
//     console.error('Error extracting presentation text:', error);
//     throw new Error('Unable to extract text from the presentation.');
//   }
// };