// Paper API Service - 支持多源学术搜索
// 包含: ArXiv, DBLP, Semantic Scholar, PubMed

const SEARCH_API = 'http://localhost:3002';

export interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  source: 'arxiv' | 'dblp' | 'semantic' | 'pubmed';
  url: string;
  year?: number;
  venue?: string;
  citations?: number;
  categories?: string[];
  publishedDate?: string;
  tags?: string[];
}

// 统一搜索接口
export async function searchPapers(query: string, source: 'all' | 'arxiv' | 'dblp' | 'semantic' | 'pubmed' = 'all', limit = 10): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${SEARCH_API}/search?q=${encodeURIComponent(query)}&source=${source}&limit=${limit}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

// 各源搜索 (调用统一接口)
export const searchArxiv = (query: string, maxResults = 10) => searchPapers(query, 'arxiv', maxResults);
export const searchDBLP = (query: string, maxResults = 10) => searchPapers(query, 'dblp', maxResults);
export const searchSemanticScholar = (query: string, maxResults = 10) => searchPapers(query, 'semantic', maxResults);
export const searchPubMed = (query: string, maxResults = 10) => searchPapers(query, 'pubmed', maxResults);

// 本地搜索 (使用 searchPapers)
export async function searchGoogleScholar(_query: string): Promise<SearchResult[]> {
  return searchPapers(_query, 'all', 5);
}

export async function searchIEEE(_query: string): Promise<SearchResult[]> {
  return [];
}

export async function searchACM(_query: string): Promise<SearchResult[]> {
  return [];
}

// 统一搜索
export async function searchAll(query: string, sources: string[] = ['arxiv', 'dblp']): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  for (const source of sources) {
    const r = await searchPapers(query, source as any, 10);
    results.push(...r);
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
