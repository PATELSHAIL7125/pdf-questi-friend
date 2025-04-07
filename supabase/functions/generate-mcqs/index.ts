
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
    console.log("Generate MCQs function called");
    const { pdfText, numQuestions, questionType } = await req.json();

    if (!pdfText) {
      return new Response(
        JSON.stringify({ error: 'PDF text is required' }),
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

    const questionsToGenerate = numQuestions || 5;
    const focusType = questionType || 'auto';
    
    console.log(`Generating ${questionsToGenerate} MCQs with focus: ${focusType}`);
    console.log(`PDF text length: ${pdfText.length} characters`);

    // Truncate document text if too long
    const maxTextLength = 15000;
    const truncatedText = pdfText.length > maxTextLength 
      ? pdfText.substring(0, maxTextLength) + "... [document truncated due to length]" 
      : pdfText;

    // Create prompt specifically for MCQ generation based on content type
    let prompt = '';
    
    if (focusType === 'algorithm') {
      // Algorithm-focused MCQs
      prompt = `
I have a document about algorithm analysis with the following content:

${truncatedText}

Please create ${questionsToGenerate} multiple-choice questions (MCQs) specifically focused on algorithm analysis topics such as:
- Time and space complexity analysis
- Algorithm approaches (greedy, dynamic programming, divide and conquer, etc.)
- Comparison between different algorithms
- Data structures used in the algorithms
- Big O notation and efficiency

For each question, provide:
1. A clear, technically precise question based on algorithm information in the document
2. Four answer options (A, B, C, D) with only one correct answer
3. Indicate which option is the correct answer
4. Provide a detailed explanation of why the answer is correct, with specific references to complexity analysis or algorithmic principles from the document

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

Focus on creating challenging, technical questions that test deep understanding of algorithm concepts, implementation details, and performance characteristics presented in the document.
If the document includes tables of time/space complexity, ensure questions reference this information accurately.
`;
    } else if (focusType === 'technical') {
      // Technical concepts focused MCQs
      prompt = `
I have a technical document with the following content:

${truncatedText}

Please create ${questionsToGenerate} multiple-choice questions (MCQs) specifically focused on technical concepts such as:
- Technical definitions and terminology
- Implementation details 
- System architecture or design
- Technical processes or workflows
- Mathematical or scientific concepts

For each question, provide:
1. A clear, technically precise question based on important technical information in the document
2. Four answer options (A, B, C, D) with only one correct answer
3. Indicate which option is the correct answer
4. Provide a detailed explanation of why the answer is correct, with specific references to the technical concepts from the document

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

Focus on creating technically rigorous questions that test accurate understanding of the content. Make sure all information is drawn directly from the document.
`;
    } else {
      // Auto-detect content type
      prompt = `
I have a document with the following content:

${truncatedText}

Please create ${questionsToGenerate} multiple-choice questions (MCQs) based on this document's content.

First, analyze the document to determine its main subject matter (e.g., algorithm analysis, technical concepts, business, history, science, etc.).

Then, create questions that are specifically tailored to the document's subject matter. For example:
- If it's about algorithms, focus on complexity analysis, algorithm approaches, and implementation details
- If it's about technical concepts, focus on definitions, implementations, and technical processes
- If it's business content, focus on key business concepts, strategies, and examples

For each question, provide:
1. A clear question based on important information in the document
2. Four answer options (A, B, C, D) with only one correct answer
3. Indicate which option is the correct answer
4. Provide a detailed explanation of why the answer is correct, referencing specific information from the document

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
    }

    try {
      // Call Gemini 2.0 Flash API for MCQ generation
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
            temperature: 0.1, // Lower temperature for more precise MCQs
            maxOutputTokens: 1500,
            topK: 40,
            topP: 0.95
          }
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
      console.log('Gemini API response:', JSON.stringify(data).substring(0, 200) + '...');
      
      let mcqData = "Sorry, I couldn't generate MCQs from the document.";
      
      if (data.candidates && 
          data.candidates.length > 0 && 
          data.candidates[0].content &&
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response if it's wrapped in code blocks
        let jsonText = responseText;
        if (responseText.includes('```json')) {
          jsonText = responseText.split('```json')[1].split('```')[0].trim();
        } else if (responseText.includes('```')) {
          jsonText = responseText.split('```')[1].split('```')[0].trim();
        }
        
        try {
          // Validate the JSON
          const parsedJson = JSON.parse(jsonText);
          mcqData = jsonText;
        } catch (jsonError) {
          console.error('Error parsing JSON from Gemini response:', jsonError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to generate properly formatted MCQs',
              details: 'The AI response was not valid JSON'
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ mcqData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (geminiError) {
      console.error('Gemini API request error:', geminiError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process request with Gemini API',
          details: geminiError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-mcqs function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
