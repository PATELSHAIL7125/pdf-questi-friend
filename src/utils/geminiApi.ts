
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
    // Get the generative model (now using Gemini 2.0 Flash for better performance)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Check if the question is related to data visualization
    const isDataVisualizationQuestion = question.toLowerCase().includes('data visual') || 
                                        question.toLowerCase().includes('visualization') || 
                                        question.toLowerCase().includes('chart') || 
                                        question.toLowerCase().includes('graph') ||
                                        question.toLowerCase().includes('plot') ||
                                        question.toLowerCase().includes('dashboard');

    // Create a context-rich prompt with specific instructions for data visualization questions
    let prompt = '';
    
    if (isDataVisualizationQuestion) {
      prompt = `
I have a document with the following content:

${documentText}

The user is asking about data visualization: "${question}"

Please provide a detailed and helpful answer based on this document content. 
1. Identify and explain all data visualization tools, libraries, or skills mentioned in the document
2. Explain how these visualization tools are being used according to the document
3. Include specific details about data visualization techniques or projects mentioned
4. If relevant, explain the context in which data visualization is mentioned (e.g., in a resume, project description, etc.)
5. Be comprehensive but concise in your explanation

If the document doesn't contain the specific information to answer this question, please explicitly state what information is available in the document and what is missing.
`;
    } else {
      // Standard prompt for non-visualization questions
      prompt = `
I have a document with the following content:

${documentText}

Based on this document content only, please answer the following question:
${question}

Be specific and reference only information contained in the document. If the document doesn't contain information to answer this question, please state that clearly.
`;
    }

    console.log('Querying Gemini API with prompt of length:', prompt.length);
    console.log('Question category:', isDataVisualizationQuestion ? 'Data Visualization' : 'General');
    
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

/**
 * Function to generate MCQs based on PDF content
 * @param documentText - The extracted text from the PDF
 * @param numQuestions - Number of MCQs to generate (default: 5)
 * @returns JSON string containing MCQs with answers and explanations
 */
export const generateMCQsFromDocument = async (
  documentText: string,
  numQuestions: number = 5
): Promise<string> => {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Truncate document text if too long
    const maxTextLength = 15000;
    const truncatedText = documentText.length > maxTextLength 
      ? documentText.substring(0, maxTextLength) + "... [document truncated due to length]" 
      : documentText;
    
    // Create prompt specifically for MCQ generation
    const prompt = `
I have a document with the following content:

${truncatedText}

Please create ${numQuestions} multiple-choice questions (MCQs) based on this document's content. 
For each question, provide:
1. A clear question based on important information in the document
2. Four answer options (A, B, C, D) with only one correct answer
3. Indicate which option is the correct answer
4. Provide a brief explanation of why the answer is correct, referencing specific information from the document

Format your response as a JSON string with this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Explanation why A is correct with reference to document"
    },
    ...more questions...
  ]
}

Focus on creating questions that test understanding of the main concepts, facts, and ideas presented in the document. 
Make sure each question has a clear correct answer based on the document content.
`;

    console.log('Generating MCQs with Gemini API, prompt length:', prompt.length);
    
    // Generate content with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Received MCQ response from Gemini API of length:', text.length);
    
    // Make sure the response is valid JSON
    try {
      // Extract JSON if it's wrapped in code blocks
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }
      
      // Parse and stringify to ensure valid JSON
      JSON.parse(jsonText);
      return jsonText;
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini response:', jsonError);
      throw new Error('Failed to generate properly formatted MCQs. Please try again.');
    }
  } catch (error) {
    console.error('Error generating MCQs with Gemini API:', error);
    
    // Provide more detailed error message based on the error type
    if (error instanceof Error) {
      if (error.message.includes('invalid API key')) {
        throw new Error('Invalid Gemini API key. Please check your API key configuration.');
      } else if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later or check your billing status.');
      } else if (error.message.includes('blocked')) {
        throw new Error('The content was blocked by Gemini API safety systems. Please try a different document.');
      }
    }
    
    throw new Error('Failed to generate MCQs. Please try again later.');
  }
};
