// Paper API Service - 支持多源学术搜索
// 包含: ArXiv, DBLP, Google Scholar, IEEE Xplore, ACM DL

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  source: 'arxiv' | 'dblp' | 'scholar' | 'ieee' | 'acm';
  url: string;
  pdfUrl?: string;
  year?: number;
  venue?: string;
  citations?: number;
  categories?: string[];
  publishedDate?: string;
  tags?: string[];
}

// 统一搜索接口
export async function searchPapers(
  query: string,
  source: 'all' | 'arxiv' | 'dblp' | 'scholar' | 'ieee' | 'acm' = 'all',
  limit = 10
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}&source=${source}&limit=${limit}`
    );
    
    if (!response.ok) {
      console.error(`Search API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

// 各源搜索
export const searchArxiv = (query: string, maxResults = 10) => 
  searchPapers(query, 'arxiv', maxResults);
export const searchDBLP = (query: string, maxResults = 10) => 
  searchPapers(query, 'dblp', maxResults);
export const searchGoogleScholar = (query: string, maxResults = 10) => 
  searchPapers(query, 'scholar', maxResults);
export const searchIEEE = (query: string, maxResults = 10) => 
  searchPapers(query, 'ieee', maxResults);
export const searchACM = (query: string, maxResults = 10) => 
  searchPapers(query, 'acm', maxResults);

// 本地搜索 (fallback - 使用统一 API)
export async function searchAll(query: string, sources: string[] = ['arxiv', 'dblp']): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  for (const source of sources) {
    try {
      const r = await searchPapers(query, source as any, 10);
      results.push(...r);
    } catch (error) {
      console.error(`Search error for ${source}:`, error);
    }
  }
  
  return results;
}

export default {
  searchArxiv,
  searchGoogleScholar,
  searchDBLP,
  searchIEEE,
  searchACM,
  searchAll,
  searchPapers,
};
