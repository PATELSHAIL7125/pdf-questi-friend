
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

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

    if (!openAIApiKey || openAIApiKey === '') {
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the prompt for OpenAI
    const prompt = `
      You're answering a question about a PDF document. 
      First, analyze the document text and extract the relevant information.
      
      Document text:
      ${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '... [document truncated due to length]' : ''}
      
      Question: ${question}
      
      Provide a concise, informative answer based on the document content. If the document doesn't contain information to answer the question, say so clearly.
    `;

    console.log(`Processing question: ${question}`);
    console.log(`PDF text length: ${pdfText.length} characters`);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that answers questions based on PDF document content.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3, // Lower temperature for more focused answers
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error details:', errorData);
        
        // Check for quota exceeded error
        if (errorData.error && errorData.error.message && errorData.error.message.includes('quota')) {
          return new Response(
            JSON.stringify({ 
              error: 'OpenAI API quota exceeded. Please check your billing details or try again later.',
              details: errorData.error.message
            }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Generic API error
        return new Response(
          JSON.stringify({ 
            error: 'Error communicating with OpenAI API',
            details: errorData.error?.message || 'Unknown error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const answer = data.choices[0].message.content.trim();

      return new Response(
        JSON.stringify({ answer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAIError) {
      console.error('OpenAI API request error:', openAIError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process question with OpenAI API',
          details: openAIError.message 
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
