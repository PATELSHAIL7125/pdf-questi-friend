
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
    const { question, pdfText } = await req.json();

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

    // Check if it's a data visualization question
    const isDataVisualizationQuestion = 
      question.toLowerCase().includes('data visual') || 
      question.toLowerCase().includes('visualization') || 
      question.toLowerCase().includes('chart') || 
      question.toLowerCase().includes('graph') ||
      question.toLowerCase().includes('plot') ||
      question.toLowerCase().includes('dashboard');

    console.log(`Question type: ${isDataVisualizationQuestion ? 'Data Visualization' : 'General'}`);
    
    // Create the prompt for Gemini based on question type
    let prompt = '';
    
    if (isDataVisualizationQuestion) {
      prompt = `
        You're answering a question about data visualization in a document.
        First, analyze the document text to identify all information related to data visualization.
        
        Document text:
        ${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '... [document truncated due to length]' : ''}
        
        Data Visualization Question: ${question}
        
        In your response:
        1. Identify all data visualization tools, libraries, or skills mentioned
        2. Explain how these visualization tools are being used according to the document
        3. Include specific details about data visualization techniques or projects mentioned
        4. If relevant, explain the context in which data visualization is mentioned
        
        Be comprehensive but concise. If the document doesn't contain specific information, explain what IS available.
      `;
    } else {
      prompt = `
        You're answering a question about a PDF document. 
        First, analyze the document text and extract the relevant information.
        
        Document text:
        ${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '... [document truncated due to length]' : ''}
        
        Question: ${question}
        
        Provide a concise, informative answer based on the document content. If the document doesn't contain information to answer the question, say so clearly.
      `;
    }

    console.log(`Processing question: ${question}`);
    console.log(`PDF text length: ${pdfText.length} characters`);

    try {
      // Call Gemini 2.0 Flash API (upgraded from 1.5-flash)
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
            temperature: isDataVisualizationQuestion ? 0.1 : 0.2, // Lower temperature for more precise data viz answers
            maxOutputTokens: 1000, // Increased from 800 for more detailed responses
            topK: 40,
            topP: 0.95
          }
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
      
      // Extract the answer from Gemini response format
      let answer = "Sorry, I couldn't generate an answer from the document.";
      
      if (data.candidates && 
          data.candidates.length > 0 && 
          data.candidates[0].content &&
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        answer = data.candidates[0].content.parts[0].text;
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
