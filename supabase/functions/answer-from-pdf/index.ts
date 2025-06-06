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
    console.log("Enhanced PDF Q&A function called");
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { question, pdfText, useGeminiBackup, enhancedContext, conversationHistory } = requestBody;
    console.log('Request parameters:', { 
      hasQuestion: !!question, 
      hasPdfText: !!pdfText, 
      hasEnhancedContext: !!enhancedContext,
      hasConversationHistory: !!conversationHistory,
      useGeminiBackup: useGeminiBackup 
    });

    if (!question || !pdfText) {
      console.log('Missing required parameters');
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

    // Use enhanced context if available, otherwise fall back to original logic
    const contextToUse = enhancedContext || pdfText;
    const isEnhanced = !!enhancedContext;

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
    console.log(`Using enhanced context: ${isEnhanced}`);
    console.log(`Using Gemini backup: ${useGeminiBackup ? 'Yes' : 'No'}`);
    
    // Enhanced prompt engineering with better context handling
    let prompt = '';
    
    if (isAlgorithmAnalysisQuestion) {
      prompt = `
        You are an expert computer science educator with access to enhanced document analysis.
        
        ${isEnhanced ? 'Enhanced Document Analysis:' : 'Document content:'}
        ${contextToUse.substring(0, 15000)} ${contextToUse.length > 15000 ? '... [content truncated due to length]' : ''}
        
        ${conversationHistory ? `Previous conversation context:\n${conversationHistory}\n` : ''}
        
        User Question: ${question}
        
        Please provide a comprehensive, well-structured answer following these enhanced guidelines:
        1. Structure your answer with clear sections and numbered points
        2. Explain algorithms mentioned with step-by-step breakdowns and examples
        3. Include detailed time and space complexity analysis with Big O notation
        4. Compare different algorithmic approaches when relevant
        5. Provide practical examples and real-world applications
        6. Reference specific sections from the document when applicable
        7. Build upon previous conversation context if relevant
        
        Format your response as plain text without markdown symbols. Use numbered lists and clear paragraph breaks for readability.
        
        ${useGeminiBackup ? 
          "Enhanced AI Mode: If the document lacks specific information, supplement with your expert knowledge while clearly distinguishing between document content and additional explanations. Provide comprehensive coverage of the topic." :
          "Document-Only Mode: Base your answer strictly on the document content. If information is missing, clearly state what is and isn't available in the document."
        }
        
        ${isEnhanced ? 'Note: This analysis uses enhanced document processing with semantic search and intelligent context extraction for improved accuracy.' : ''}
      `;
    } else if (isDataVisualizationQuestion) {
      prompt = `
        You are a data visualization expert with access to enhanced document analysis capabilities.
        
        ${isEnhanced ? 'Enhanced Document Analysis:' : 'Document content:'}
        ${contextToUse.substring(0, 15000)} ${contextToUse.length > 15000 ? '... [content truncated due to length]' : ''}
        
        ${conversationHistory ? `Previous conversation context:\n${conversationHistory}\n` : ''}
        
        User Question: ${question}
        
        Please provide a detailed response following these enhanced guidelines:
        1. Identify all data visualization tools, libraries, and frameworks mentioned
        2. Explain the purpose and applications of each visualization technique in detail
        3. Describe the data types and optimal use cases for different chart types
        4. Include best practices for effective data presentation and user experience
        5. Reference specific datasets, examples, or case studies from the document
        6. Provide practical implementation recommendations and considerations
        7. Connect to previous conversation topics when relevant
        
        Format your response as plain text without markdown symbols. Use numbered lists and clear sections for better readability.
        
        ${useGeminiBackup ? 
          "Enhanced AI Mode: If the document lacks specific information, provide comprehensive insights based on your expertise while clearly indicating which parts are not from the document. Include industry best practices and modern approaches." :
          "Document-Only Mode: Focus strictly on what's available in the document and clearly explain any limitations or missing information."
        }
        
        ${isEnhanced ? 'Note: This analysis leverages enhanced document intelligence with semantic understanding for more relevant and contextual responses.' : ''}
      `;
    } else {
      prompt = `
        You are a knowledgeable assistant with enhanced document analysis capabilities, specializing in comprehensive document understanding.
        
        ${isEnhanced ? 'Enhanced Document Analysis with Semantic Context:' : 'Document content:'}
        ${contextToUse.substring(0, 15000)} ${contextToUse.length > 15000 ? '... [content truncated due to length]' : ''}
        
        ${conversationHistory ? `Previous conversation context:\n${conversationHistory}\n` : ''}
        
        User Question: ${question}
        
        Please follow these enhanced guidelines for your response:
        1. Provide a clear, well-organized answer with logical flow and structure
        2. Include all relevant details from the document with proper context
        3. Structure information with numbered points or clear paragraphs for readability
        4. Explain technical terms and concepts when necessary
        5. Include specific examples, data, quotes, or references from the document
        6. Synthesize information across different document sections when relevant
        7. Build upon previous conversation topics and maintain continuity
        8. Summarize key findings and implications at the end if appropriate
        
        Important formatting rules:
        - Use plain text format without markdown symbols
        - Do not use asterisks (*) for emphasis or bullet points
        - Use numbered lists (1., 2., 3.) instead of bullet points
        - Use clear paragraph breaks for readability
        - Avoid special characters that might cause formatting issues
        
        ${useGeminiBackup ? 
          "Enhanced AI Mode: If the document doesn't contain sufficient information, provide helpful context and comprehensive explanations based on your knowledge, but clearly distinguish between document content and additional information. Aim for thorough, educational responses." :
          "Document-Only Mode: Base your answer strictly on the document content. If specific information is missing, clearly state what is available and what is not, and explain the limitations."
        }
        
        ${isEnhanced ? 'Note: This response is powered by enhanced document processing with intelligent context extraction, semantic search, and conversation continuity for optimal relevance and accuracy.' : ''}
      `;
    }

    console.log(`Processing ${isEnhanced ? 'enhanced' : 'standard'} question: ${question}`);
    console.log(`Context length: ${contextToUse.length} characters`);

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
            temperature: 0.3,
            maxOutputTokens: 2000,
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
        
        return new Response(
          JSON.stringify({ 
            error: 'Error communicating with Gemini API',
            details: errorData.error?.message || 'Unknown error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Enhanced Gemini API response received, processing...');
      
      // Extract and clean the answer from Gemini response
      let answer = "Sorry, I couldn't generate an answer from the document.";
      
      if (data.candidates && 
          data.candidates.length > 0 && 
          data.candidates[0].content &&
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        let rawAnswer = data.candidates[0].content.parts[0].text;
        
        answer = rawAnswer
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/^[\s]*\*[\s]*/gm, '')
          .replace(/^[\s]*-[\s]*/gm, '')
          .replace(/```[^`]*```/g, '')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/^\*\*\s*/gm, '')
          .replace(/\s\*\*\s*/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/\r\n/g, '\n')
          .trim();
        
        console.log('Enhanced answer processed and cleaned');
      }

      return new Response(
        JSON.stringify({ 
          answer,
          enhanced: isEnhanced,
          processingMode: useGeminiBackup ? 'enhanced_ai' : 'document_only'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (geminiError) {
      console.error('Gemini API request error:', geminiError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process question with enhanced Gemini API',
          details: geminiError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in enhanced answer-from-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
