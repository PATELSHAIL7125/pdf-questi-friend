
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  question: string;
  documentText: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  model?: string;
  useBackup?: boolean;
  isPresentation?: boolean;
}

const callOpenAI = async (prompt: string, model: string = 'gpt-4o-mini') => {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are an expert document analyzer. Provide comprehensive answers based on the document content.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const callAnthropic = async (prompt: string, model: string = 'claude-3-haiku-20240307') => {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('Anthropic API key not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

const callGemini = async (prompt: string, model: string = 'gemini-2.0-flash') => {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Gemini API key not configured');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        topK: 40,
        topP: 0.9,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, documentText, provider, model, useBackup, isPresentation }: AIRequest = await req.json();

    if (!question || !documentText || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create enhanced prompt based on document type
    const documentType = isPresentation ? 'PowerPoint presentation' : 'PDF document';
    const prompt = `You are analyzing a ${documentType}. Here is the content:

${documentText.substring(0, 15000)}${documentText.length > 15000 ? '... [content truncated]' : ''}

User Question: ${question}

Please provide a comprehensive answer based on the ${documentType} content. ${useBackup ? 'If the document lacks information, you may supplement with your knowledge while clearly indicating what comes from the document versus general knowledge.' : 'Base your answer strictly on the document content.'}`;

    let answer;
    
    switch (provider) {
      case 'openai':
        answer = await callOpenAI(prompt, model || 'gpt-4o-mini');
        break;
      case 'anthropic':
        answer = await callAnthropic(prompt, model || 'claude-3-haiku-20240307');
        break;
      case 'gemini':
        answer = await callGemini(prompt, model || 'gemini-2.0-flash');
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    return new Response(
      JSON.stringify({ 
        answer,
        provider,
        model: model || 'default'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Multi-AI analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
