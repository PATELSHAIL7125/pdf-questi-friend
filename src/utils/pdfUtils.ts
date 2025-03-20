
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
    // Split the PDF text into smaller chunks (sentences or paragraphs)
    const chunks = pdfText
      .split(/\.|\n/)
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 20); // Filter out very short chunks
    
    // Extract keywords from the question
    const questionWords = question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'who', 'why', 'how', 'does', 'do', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should', 'can', 'about'].includes(word));
    
    // Score each chunk based on keyword matches and proximity
    const scoredChunks = chunks.map(chunk => {
      const lowerChunk = chunk.toLowerCase();
      let score = 0;
      
      // Score based on keyword presence
      questionWords.forEach(word => {
        if (lowerChunk.includes(word)) {
          score += 10;
          
          // Bonus for exact phrase matches
          if (lowerChunk.includes(question.toLowerCase())) {
            score += 50;
          }
        }
      });
      
      // Penalize very long chunks
      if (chunk.length > 300) {
        score *= 0.8;
      }
      
      return { chunk, score };
    });
    
    // Sort chunks by score (highest first)
    scoredChunks.sort((a, b) => b.score - a.score);
    
    // Get the top 3 most relevant chunks
    const topChunks = scoredChunks.slice(0, 3).filter(item => item.score > 0);
    
    if (topChunks.length === 0) {
      return "I couldn't find specific information about that in the document. Could you rephrase your question?";
    }
    
    // Combine the top chunks into a coherent answer
    const answerText = topChunks.map(item => item.chunk).join('. ');
    
    // Format the answer
    return `Based on the document: "${answerText}"`;
  } catch (error) {
    console.error('Error getting answer:', error);
    return "Sorry, I encountered an error while trying to answer your question.";
  }
};
