
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

