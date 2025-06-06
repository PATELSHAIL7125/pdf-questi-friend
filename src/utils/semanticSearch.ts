
import { DocumentSection } from './documentProcessor';

export interface SearchResult {
  section: DocumentSection;
  relevanceScore: number;
  matchedTerms: string[];
}

export class SemanticSearch {
  /**
   * Search through document sections for relevant content
   */
  static searchSections(
    sections: DocumentSection[],
    query: string,
    limit: number = 5
  ): SearchResult[] {
    const queryTerms = this.extractTerms(query.toLowerCase());
    const results: SearchResult[] = [];

    for (const section of sections) {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      const sectionTerms = this.extractTerms(sectionText);
      
      const relevanceScore = this.calculateRelevance(queryTerms, sectionTerms, sectionText);
      const matchedTerms = queryTerms.filter(term => sectionText.includes(term));

      if (relevanceScore > 0) {
        results.push({
          section,
          relevanceScore,
          matchedTerms
        });
      }
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Find the most relevant sections for a question
   */
  static findRelevantContext(
    sections: DocumentSection[],
    question: string,
    maxLength: number = 3000
  ): string {
    const searchResults = this.searchSections(sections, question, 10);
    
    if (searchResults.length === 0) {
      // Fallback to first few sections if no matches
      return sections
        .slice(0, 3)
        .map(section => `${section.title}\n${section.content}`)
        .join('\n\n')
        .substring(0, maxLength);
    }

    let context = '';
    let currentLength = 0;

    for (const result of searchResults) {
      const sectionText = `${result.section.title}\n${result.section.content}\n\n`;
      
      if (currentLength + sectionText.length > maxLength) {
        break;
      }
      
      context += sectionText;
      currentLength += sectionText.length;
    }

    return context || sections[0]?.content.substring(0, maxLength) || '';
  }

  /**
   * Extract meaningful terms from text
   */
  private static extractTerms(text: string): string[] {
    // Remove common words and extract meaningful terms
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
      'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
      'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
      'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when',
      'why', 'how', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'shall'
    ]);

    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 50); // Limit for performance
  }

  /**
   * Calculate relevance score between query and section
   */
  private static calculateRelevance(
    queryTerms: string[],
    sectionTerms: string[],
    sectionText: string
  ): number {
    if (queryTerms.length === 0) return 0;

    let score = 0;
    const sectionTermSet = new Set(sectionTerms);

    // Exact term matches
    const exactMatches = queryTerms.filter(term => sectionTermSet.has(term));
    score += exactMatches.length * 2;

    // Partial matches
    const partialMatches = queryTerms.filter(term => 
      sectionTerms.some(secTerm => 
        secTerm.includes(term) || term.includes(secTerm)
      )
    );
    score += partialMatches.length;

    // Phrase matches (higher weight)
    const queryPhrase = queryTerms.join(' ');
    if (sectionText.includes(queryPhrase)) {
      score += 5;
    }

    // Title boost
    const titleText = sectionText.split('\n')[0];
    const titleMatches = queryTerms.filter(term => titleText.includes(term));
    score += titleMatches.length * 1.5;

    return score;
  }
}
