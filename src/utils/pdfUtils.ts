
import * as pdfjs from 'pdfjs-dist';

// Set the workerSrc property of the global pdfjs variable
const pdfjsVersion = '3.11.174';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

// Function to load a PDF from a URL
export const loadPdf = async (url: string): Promise<pdfjs.PDFDocumentProxy> => {
  try {
    const loadingTask = pdfjs.getDocument(url);
    return await loadingTask.promise;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw error;
  }
};

// Function to extract text from a PDF
export const extractTextFromPdf = async (pdfDocument: pdfjs.PDFDocumentProxy): Promise<string> => {
  try {
    let fullText = '';
    
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

// Function to answer questions based on PDF content
export const getAnswerFromPdf = async (
  question: string, 
  pdfText: string
): Promise<string> => {
  try {
    // This is a placeholder function
    // In a real implementation, this would use an AI service to generate answers
    
    // Simple keyword matching for demo purposes
    const lowerQuestion = question.toLowerCase();
    const lowerPdfText = pdfText.toLowerCase();
    
    // Find the most relevant paragraph (simple approach)
    const paragraphs = pdfText.split('\n').filter(p => p.trim().length > 0);
    
    // Score paragraphs based on keyword matches
    const scoredParagraphs = paragraphs.map(p => {
      const lowerP = p.toLowerCase();
      const words = lowerQuestion.split(/\s+/).filter(w => w.length > 3);
      const score = words.reduce((acc, word) => {
        return acc + (lowerP.includes(word) ? 1 : 0);
      }, 0);
      return { paragraph: p, score };
    });
    
    // Sort by score
    scoredParagraphs.sort((a, b) => b.score - a.score);
    
    // Return the most relevant paragraph or a default response
    if (scoredParagraphs[0]?.score > 0) {
      return `Based on the document: ${scoredParagraphs[0].paragraph}`;
    } else {
      return "I couldn't find specific information about that in the document. Could you rephrase your question?";
    }
  } catch (error) {
    console.error('Error getting answer:', error);
    return "Sorry, I encountered an error while trying to answer your question.";
  }
};
