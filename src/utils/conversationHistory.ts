export interface ConversationMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  documentId: string;
  questionType: 'general' | 'algorithm' | 'visualization';
  useGeminiBackup: boolean;
  keywords: string[];
}

export interface ConversationThread {
  id: string;
  documentName: string;
  documentId: string;
  messages: ConversationMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

export class ConversationHistoryManager {
  private static readonly STORAGE_KEY = 'pdf_qa_conversations';
  private static readonly MAX_THREADS = 50;
  private static readonly MAX_MESSAGES_PER_THREAD = 100;

  /**
   * Get all conversation threads
   */
  static getThreads(): ConversationThread[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const threads = JSON.parse(stored);
      return threads.map((thread: any) => ({
        ...thread,
        createdAt: new Date(thread.createdAt),
        lastUpdated: new Date(thread.lastUpdated),
        messages: thread.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  /**
   * Get specific thread by document ID
   */
  static getThreadByDocumentId(documentId: string): ConversationThread | null {
    const threads = this.getThreads();
    return threads.find(thread => thread.documentId === documentId) || null;
  }

  /**
   * Create new thread
   */
  static createThread(documentName: string, documentId: string): ConversationThread {
    const thread: ConversationThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentName,
      documentId,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.saveThread(thread);
    return thread;
  }

  /**
   * Add message to thread
   */
  static addMessage(
    documentId: string,
    question: string,
    answer: string,
    questionType: ConversationMessage['questionType'],
    useGeminiBackup: boolean,
    keywords: string[] = []
  ): ConversationMessage {
    const threads = this.getThreads();
    let thread = threads.find(t => t.documentId === documentId);

    if (!thread) {
      throw new Error('Thread not found for document');
    }

    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      answer,
      timestamp: new Date(),
      documentId,
      questionType,
      useGeminiBackup,
      keywords
    };

    thread.messages.unshift(message);
    thread.lastUpdated = new Date();

    // Limit messages per thread
    if (thread.messages.length > this.MAX_MESSAGES_PER_THREAD) {
      thread.messages = thread.messages.slice(0, this.MAX_MESSAGES_PER_THREAD);
    }

    this.saveThread(thread);
    return message;
  }

  /**
   * Get conversation context for better AI responses
   */
  static getConversationContext(documentId: string, limit: number = 3): string {
    const thread = this.getThreadByDocumentId(documentId);
    if (!thread || thread.messages.length === 0) return '';

    const recentMessages = thread.messages.slice(0, limit);
    
    return recentMessages
      .reverse() // Show chronological order
      .map(msg => `Q: ${msg.question}\nA: ${msg.answer.substring(0, 200)}...`)
      .join('\n\n');
  }

  /**
   * Search messages by keywords
   */
  static searchMessages(query: string, documentId?: string): ConversationMessage[] {
    const threads = this.getThreads();
    const allMessages = threads
      .filter(thread => !documentId || thread.documentId === documentId)
      .flatMap(thread => thread.messages);

    const queryLower = query.toLowerCase();
    
    return allMessages.filter(msg =>
      msg.question.toLowerCase().includes(queryLower) ||
      msg.answer.toLowerCase().includes(queryLower) ||
      msg.keywords.some(keyword => keyword.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Delete old threads to manage storage
   */
  static cleanupOldThreads(): void {
    const threads = this.getThreads();
    
    if (threads.length <= this.MAX_THREADS) return;

    // Sort by last updated and keep only recent ones
    const sorted = threads.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
    const threadsToKeep = sorted.slice(0, this.MAX_THREADS);
    
    this.saveAllThreads(threadsToKeep);
  }

  /**
   * Export conversation history
   */
  static exportHistory(): string {
    const threads = this.getThreads();
    return JSON.stringify(threads, null, 2);
  }

  /**
   * Import conversation history
   */
  static importHistory(jsonData: string): boolean {
    try {
      const threads = JSON.parse(jsonData);
      this.saveAllThreads(threads);
      return true;
    } catch (error) {
      console.error('Error importing conversation history:', error);
      return false;
    }
  }

  private static saveThread(thread: ConversationThread): void {
    const threads = this.getThreads();
    const existingIndex = threads.findIndex(t => t.id === thread.id);
    
    if (existingIndex >= 0) {
      threads[existingIndex] = thread;
    } else {
      threads.unshift(thread);
    }

    this.saveAllThreads(threads);
  }

  private static saveAllThreads(threads: ConversationThread[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(threads));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }
}
