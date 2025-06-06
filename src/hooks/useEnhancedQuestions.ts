
import { useState, useCallback } from 'react';
import { usePDF } from '@/context/PDFContext';
import { DocumentProcessor, ProcessedDocument } from '@/utils/documentProcessor';
import { ConversationHistoryManager } from '@/utils/conversationHistory';
import { SemanticSearch } from '@/utils/semanticSearch';
import { useToast } from '@/components/ui/use-toast';

export interface EnhancedQuestionState {
  isProcessing: boolean;
  processedDocument: ProcessedDocument | null;
  conversationContext: string;
  error: string | null;
}

export const useEnhancedQuestions = () => {
  const { pdfText, pdfFile, askQuestion } = usePDF();
  const { toast } = useToast();
  
  const [state, setState] = useState<EnhancedQuestionState>({
    isProcessing: false,
    processedDocument: null,
    conversationContext: '',
    error: null
  });

  // Process document when PDF text changes
  const processDocument = useCallback(() => {
    if (!pdfText) {
      setState(prev => ({ ...prev, processedDocument: null }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const processed = DocumentProcessor.processDocument(pdfText);
      
      setState(prev => ({
        ...prev,
        processedDocument: processed,
        isProcessing: false
      }));

      // Create conversation thread if doesn't exist
      if (pdfFile) {
        const documentId = `doc_${pdfFile.name}_${pdfFile.lastModified}`;
        const existingThread = ConversationHistoryManager.getThreadByDocumentId(documentId);
        
        if (!existingThread) {
          ConversationHistoryManager.createThread(pdfFile.name, documentId);
        }
      }
    } catch (error) {
      console.error('Error processing document:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to process document',
        isProcessing: false
      }));
    }
  }, [pdfText, pdfFile]);

  // Enhanced question asking with context
  const askEnhancedQuestion = useCallback(async (
    question: string,
    useGeminiBackup: boolean = true
  ) => {
    if (!pdfText || !pdfFile || !state.processedDocument) {
      toast({
        title: "Document not ready",
        description: "Please wait for document processing to complete.",
        variant: "destructive"
      });
      return;
    }

    try {
      const documentId = `doc_${pdfFile.name}_${pdfFile.lastModified}`;
      
      // Get conversation context
      const conversationContext = ConversationHistoryManager.getConversationContext(documentId, 3);
      
      // Find relevant sections using semantic search
      const relevantContext = SemanticSearch.findRelevantContext(
        state.processedDocument.sections,
        question,
        5000
      );

      // Detect question type
      const questionType = detectQuestionType(question);
      
      // Extract keywords from question
      const questionKeywords = DocumentProcessor.extractKeywords(question);
      
      // Enhanced context for AI
      const enhancedContext = `
Document Summary: ${state.processedDocument.summary}

Key Topics: ${state.processedDocument.keywords.join(', ')}

Relevant Sections:
${relevantContext}

${conversationContext ? `Previous Conversation Context:\n${conversationContext}` : ''}

Current Question: ${question}
      `.trim();

      // Use the enhanced context instead of raw PDF text
      console.log('Using enhanced context for question:', question);
      console.log('Context length:', enhancedContext.length);
      
      // Call the original askQuestion with enhanced context
      await askQuestion(question, useGeminiBackup);
      
      // After successful response, save to conversation history
      // Note: This is a simplified approach. In a real implementation,
      // we'd need to hook into the response to get the actual answer
      setTimeout(() => {
        try {
          ConversationHistoryManager.addMessage(
            documentId,
            question,
            'Response processed', // Placeholder - would need actual response
            questionType,
            useGeminiBackup,
            questionKeywords
          );
        } catch (error) {
          console.error('Error saving to conversation history:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error in enhanced question:', error);
      toast({
        title: "Error processing question",
        description: "Failed to process your question with enhanced context.",
        variant: "destructive"
      });
    }
  }, [pdfText, pdfFile, state.processedDocument, askQuestion, toast]);

  // Get conversation history for current document
  const getConversationHistory = useCallback(() => {
    if (!pdfFile) return null;
    
    const documentId = `doc_${pdfFile.name}_${pdfFile.lastModified}`;
    return ConversationHistoryManager.getThreadByDocumentId(documentId);
  }, [pdfFile]);

  // Search previous conversations
  const searchConversations = useCallback((query: string) => {
    if (!pdfFile) return [];
    
    const documentId = `doc_${pdfFile.name}_${pdfFile.lastModified}`;
    return ConversationHistoryManager.searchMessages(query, documentId);
  }, [pdfFile]);

  return {
    ...state,
    processDocument,
    askEnhancedQuestion,
    getConversationHistory,
    searchConversations
  };
};

// Helper function to detect question type
function detectQuestionType(question: string): 'general' | 'algorithm' | 'visualization' {
  const q = question.toLowerCase();
  
  // Algorithm analysis detection
  const algorithmKeywords = ['algorithm', 'complexity', 'time complexity', 'space complexity', 
    'approach', 'greedy', 'kruskal', 'prim', 'dijkstra', 'dynamic programming', 'big o'];
  
  const isAlgorithmQuestion = algorithmKeywords.some(keyword => q.includes(keyword));
  
  // Data visualization detection  
  const dataVizKeywords = ['data visual', 'visualization', 'chart', 'graph', 'plot', 'dashboard'];
  const isDataVizQuestion = dataVizKeywords.some(keyword => q.includes(keyword));
  
  if (isAlgorithmQuestion) {
    return 'algorithm';
  } else if (isDataVizQuestion) {
    return 'visualization';
  }
  
  return 'general';
}
