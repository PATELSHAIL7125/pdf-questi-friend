
export interface DocumentSection {
  title: string;
  content: string;
  level: number;
  startIndex: number;
  endIndex: number;
}

export interface ProcessedDocument {
  cleanedText: string;
  sections: DocumentSection[];
  keywords: string[];
  summary: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: 'low' | 'medium' | 'high';
  };
}

export class DocumentProcessor {
  /**
   * Clean and structure document text
   */
  static cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page numbers and headers/footers
      .replace(/\b(page|Page)\s*\d+\b/g, '')
      // Remove special characters and formatting artifacts
      .replace(/[^\w\s.,!?;:()\-"']/g, ' ')
      // Fix sentence spacing
      .replace(/\.\s+/g, '. ')
      // Remove multiple spaces
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Extract document sections based on headers and structure
   */
  static extractSections(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = text.split('\n');
    let currentSection: DocumentSection | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect headers (lines that are short, capitalized, or numbered)
      const isHeader = this.isLikelyHeader(line);
      
      if (isHeader && line.length > 0) {
        // Save previous section
        if (currentSection) {
          currentSection.endIndex = i;
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: line,
          content: '',
          level: this.getHeaderLevel(line),
          startIndex: i,
          endIndex: i
        };
      } else if (currentSection && line.length > 0) {
        currentSection.content += line + ' ';
      }
    }
    
    // Add last section
    if (currentSection) {
      currentSection.endIndex = lines.length;
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Extract keywords from document
   */
  static extractKeywords(text: string): string[] {
    const cleanText = text.toLowerCase();
    const words = cleanText.split(/\s+/);
    
    // Filter out common words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
      'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves'
    ]);
    
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '');
      if (cleaned.length > 3 && !stopWords.has(cleaned)) {
        wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
      }
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Generate document summary
   */
  static generateSummary(text: string, sections: DocumentSection[]): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length <= 3) return text;
    
    // Take first sentence, middle sentence, and last sentence
    const summary = [
      sentences[0]?.trim(),
      sentences[Math.floor(sentences.length / 2)]?.trim(),
      sentences[sentences.length - 1]?.trim()
    ].filter(Boolean).join('. ') + '.';
    
    return summary;
  }

  /**
   * Calculate document metadata
   */
  static calculateMetadata(text: string): ProcessedDocument['metadata'] {
    const words = text.split(/\s+/).length;
    const avgWordsPerMinute = 200;
    const readingTime = Math.ceil(words / avgWordsPerMinute);
    
    // Simple complexity scoring
    const complexWords = text.split(/\s+/).filter(word => word.length > 7).length;
    const complexityRatio = complexWords / words;
    
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (complexityRatio > 0.3) complexity = 'high';
    else if (complexityRatio > 0.15) complexity = 'medium';
    
    return {
      wordCount: words,
      readingTime,
      complexity
    };
  }

  /**
   * Main processing function
   */
  static processDocument(text: string): ProcessedDocument {
    const cleanedText = this.cleanText(text);
    const sections = this.extractSections(cleanedText);
    const keywords = this.extractKeywords(cleanedText);
    const summary = this.generateSummary(cleanedText, sections);
    const metadata = this.calculateMetadata(cleanedText);
    
    return {
      cleanedText,
      sections,
      keywords,
      summary,
      metadata
    };
  }

  private static isLikelyHeader(line: string): boolean {
    if (line.length === 0 || line.length > 100) return false;
    
    // Check for numbered headers (1., 1.1, Chapter 1, etc.)
    if (/^\d+\.|\bchapter\s+\d+\b|\bsection\s+\d+\b/i.test(line)) return true;
    
    // Check for ALL CAPS headers
    if (line === line.toUpperCase() && line.length > 2) return true;
    
    // Check for title case headers
    const words = line.split(/\s+/);
    const titleCase = words.every(word => 
      word.length === 0 || word[0] === word[0].toUpperCase()
    );
    if (titleCase && words.length <= 8) return true;
    
    return false;
  }

  private static getHeaderLevel(line: string): number {
    // Simple header level detection
    if (/^\d+\.\d+\.\d+/.test(line)) return 3;
    if (/^\d+\.\d+/.test(line)) return 2;
    if (/^\d+\./.test(line)) return 1;
    if (line === line.toUpperCase()) return 1;
    return 2;
  }
}
