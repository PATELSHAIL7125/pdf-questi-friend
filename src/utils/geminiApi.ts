// utils/api/geminiApi.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
// Replace 'YOUR_API_KEY' with your actual Gemini API key
const genAI = new GoogleGenerativeAI('AIzaSyBklc71iuVgSkT6wc38suj3xdMH8f_9oMQ');

/**
 * Function to query the Gemini 2.0 Flash API with presentation content
 * @param presentationText - The extracted text from the PowerPoint file
 * @param question - The user's question about the presentation
 * @returns The response from Gemini API
 */
export const queryGeminiAboutPresentation = async (
  presentationText: string,
  question: string
): Promise<string> => {
  try {
    // Get the generative model (Gemini 2.0 Flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create a context-rich prompt that includes both the presentation content and question
    const prompt = `
I have a PowerPoint presentation with the following content:

${presentationText}

Based on this presentation content only, please answer the following question:
${question}

If the presentation doesn't contain information to answer this question, please state that clearly.
`;

    // Generate content with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error querying Gemini API:', error);
    return 'Sorry, there was an error processing your question with the Gemini API. Please try again later.';
  }
};