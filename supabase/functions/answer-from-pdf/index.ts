
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Function called");
    const { question, pdfText, useGeminiBackup } = await req.json();

    if (!question || !pdfText) {
      return new Response(
        JSON.stringify({ error: 'Question and PDF text are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!geminiApiKey || geminiApiKey === '') {
      console.error('Gemini API key is not configured');
      return new Response(
        JSON.stringify({ error: 'Gemini API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect question type for customized prompting
    const isDataVisualizationQuestion = 
      question.toLowerCase().includes('data visual') || 
      question.toLowerCase().includes('visualization') || 
      question.toLowerCase().includes('chart') || 
      question.toLowerCase().includes('graph') ||
      question.toLowerCase().includes('plot') ||
      question.toLowerCase().includes('dashboard');
      
    const isAlgorithmAnalysisQuestion = 
      question.toLowerCase().includes('algorithm') || 
      question.toLowerCase().includes('complexity') || 
      question.toLowerCase().includes('time complexity') || 
      question.toLowerCase().includes('space complexity') ||
      question.toLowerCase().includes('approach') ||
      question.toLowerCase().includes('greedy') ||
      question.toLowerCase().includes('kruskal') ||
      question.toLowerCase().includes('prim');

    console.log(`Question type: ${
      isAlgorithmAnalysisQuestion ? 'Algorithm Analysis' : 
      isDataVisualizationQuestion ? 'Data Visualization' : 'General'
    }`);
    console.log(`Using Gemini backup: ${useGeminiBackup ? 'Yes' : 'No'}`);
    
    // Enhanced prompt engineering for better quality answers
    let prompt = '';
    
    if (isAlgorithmAnalysisQuestion) {
      prompt = `
        You are an expert computer science educator. Analyze the document and provide a comprehensive, well-structured answer about algorithms.
        
        Document content:
        ${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '... [document truncated due to length]' : ''}
        
        User Question: ${question}
        
        Please provide a detailed, educational response following these guidelines:
        1. Structure your answer with clear sections and numbered points
        2. Explain algorithms mentioned (Kruskal's, Prim's, Greedy approaches, etc.) with step-by-step breakdowns
        3. Include time and space complexity analysis with Big O notation
        4. Compare different algorithmic approaches when relevant
        5. Provide practical examples or applications
        6. Use simple, clear language without unnecessary jargon
        
        Format your response as plain text without markdown symbols. Use numbered lists and clear paragraph breaks for readability.
        
        ${useGeminiBackup ? 
          "If the document lacks specific information, supplement with your knowledge while clearly distinguishing between document content and additional explanations." :
          "Base your answer strictly on the document content. If information is missing, clearly state what is and isn't available in the document."
        }
      `;
    } else if (isDataVisualizationQuestion) {
      prompt = `
        You are a data visualization expert. Analyze the document and provide comprehensive insights about data visualization concepts.
        
        Document content:
        ${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '... [document truncated due to length]' : ''}
        
        User Question: ${question}
        
        Please provide a detailed response following these guidelines:
        1. Identify all data visualization tools, libraries, and frameworks mentioned
        2. Explain the purpose and applications of each visualization technique
        3. Describe the data types and use cases for different chart types
        4. Include best practices for effective data presentation
        5. Mention any specific datasets or examples from the document
        6. Provide practical recommendations
        
        Format your response as plain text without markdown symbols. Use numbered lists and clear sections for better readability.
        
        ${useGeminiBackup ? 
          "If the document lacks specific information, provide helpful insights based on your expertise while clearly indicating which parts are not from the document." :
          "Focus strictly on what's available in the document and clearly explain any limitations."
        }
      `;
    } else {
      prompt = `
        You are a knowledgeable assistant specializing in document analysis. Provide a comprehensive, well-structured answer based on the document content.
        
        Document content:
        ${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '... [document truncated due to length]' : ''}
        
        User Question: ${question}
        
        Please follow these guidelines for your response:
        1. Provide a clear, well-organized answer with logical flow
        2. Include all relevant details from the document
        3. Structure information with numbered points or clear paragraphs
        4. Explain technical terms when necessary
        5. Include specific examples, data, or quotes from the document
        6. Summarize key findings at the end if appropriate
        
        Important formatting rules:
        - Use plain text format without markdown symbols
        - Do not use asterisks (*) for emphasis or bullet points
        - Use numbered lists (1., 2., 3.) instead of bullet points
        - Use clear paragraph breaks for readability
        - Avoid special characters that might cause formatting issues
        
        ${useGeminiBackup ? 
          "If the document doesn't contain sufficient information, provide helpful context based on your knowledge, but clearly distinguish between document content and additional information." :
          "Base your answer strictly on the document content. If specific information is missing, clearly state what is available and what is not."
        }
      `;
    }

    console.log(`Processing question: ${question}`);
    console.log(`PDF text length: ${pdfText.length} characters`);

    try {
      // Call Gemini 2.0 Flash API with enhanced configuration
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3, // Slightly higher for more natural responses
            maxOutputTokens: 2000, // Increased for more detailed responses
            topK: 40,
            topP: 0.9,
            candidateCount: 1
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error details:', errorData);
        
        // Handle different types of errors
        if (errorData.error && errorData.error.message) {
          if (errorData.error.message.includes('quota')) {
            return new Response(
              JSON.stringify({ 
                error: 'Gemini API quota exceeded. Please check your billing details or try again later.',
                details: errorData.error.message
              }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else if (errorData.error.message.includes('API key')) {
            return new Response(
              JSON.stringify({ 
                error: 'Invalid Gemini API key. Please check your API key and try again.',
                details: errorData.error.message
              }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        // Generic API error
        return new Response(
          JSON.stringify({ 
            error: 'Error communicating with Gemini API',
            details: errorData.error?.message || 'Unknown error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Gemini API response:', JSON.stringify(data).substring(0, 200) + '...');
      
      // Extract and clean the answer from Gemini response
      let answer = "Sorry, I couldn't generate an answer from the document.";
      
      if (data.candidates && 
          data.candidates.length > 0 && 
          data.candidates[0].content &&
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        let rawAnswer = data.candidates[0].content.parts[0].text;
        
        // Clean up formatting issues
        answer = rawAnswer
          // Remove markdown formatting
          .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
          .replace(/^[\s]*\*[\s]*/gm, '') // Remove asterisk bullet points at line start
          .replace(/^[\s]*-[\s]*/gm, '') // Remove dash bullet points at line start
          .replace(/```[^`]*```/g, '') // Remove code blocks
          .replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
          // Improve line breaks and spacing
          .replace(/\n{3,}/g, '\n\n') // Replace multiple line breaks with double
          .replace(/\r\n/g, '\n') // Normalize line endings
          .trim(); // Remove leading/trailing whitespace
      }

      return new Response(
        JSON.stringify({ answer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (geminiError) {
      console.error('Gemini API request error:', geminiError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process question with Gemini API',
          details: geminiError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in answer-from-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
