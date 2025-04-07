
// utils/geminiApi.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
// The API key should be provided as an environment variable in production
const genAI = new GoogleGenerativeAI('AIzaSyBklc71iuVgSkT6wc38suj3xdMH8f_9oMQ');

/**
 * Function to query the Gemini API with document content
 * @param documentText - The extracted text from the PDF or PowerPoint file
 * @param question - The user's question about the document
 * @returns The response from Gemini API
 */
export const queryGeminiAboutDocument = async (
  documentText: string,
  question: string
): Promise<string> => {
  try {
    // Get the generative model (Gemini 2.0 Flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create a context-rich prompt that includes both the document content and question
    const prompt = `
I have a document with the following content:

${documentText}

Based on this document content only, please answer the following question:
${question}

If the document doesn't contain information to answer this question, please state that clearly.
`;

    console.log('Querying Gemini API with prompt of length:', prompt.length);
    
    // Generate content with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Received response from Gemini API of length:', text.length);
    
    return text;
  } catch (error) {
    console.error('Error querying Gemini API:', error);
    
    // Provide more detailed error message based on the error type
    if (error instanceof Error) {
      if (error.message.includes('invalid API key')) {
        return 'Error: Invalid Gemini API key. Please check your API key configuration.';
      } else if (error.message.includes('quota')) {
        return 'Error: Gemini API quota exceeded. Please try again later or check your billing status.';
      } else if (error.message.includes('blocked')) {
        return 'Error: The content was blocked by Gemini API safety systems. Please try a different question or document.';
      }
    }
    
    return 'Sorry, there was an error processing your question with the Gemini API. Please try again later.';
  }
};

