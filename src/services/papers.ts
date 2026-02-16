// Paper API Service - ArXiv, Google Scholar, DBLP, IEEE/ACM integration

export interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  source: 'arxiv' | 'scholar' | 'dblp' | 'ieee' | 'acm';
  url: string;
  publishedDate: string;
  tags: string[];
}

// ArXiv API
export async function searchArxiv(query: string, maxResults = 10): Promise<SearchResult[]> {
  const response = await fetch(
    `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`
  );
  
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  
  const entries = xml.querySelectorAll('entry');
  const results: SearchResult[] = [];
  
  entries.forEach((entry, index) => {
    const id = entry.querySelector('id')?.textContent || `arxiv-${index}`;
    const title = entry.querySelector('title')?.textContent?.replace(/\n/g, ' ') || '';
    const summary = entry.querySelector('summary')?.textContent?.replace(/\n/g, ' ') || '';
    const published = entry.querySelector('published')?.textContent?.split('T')[0] || '';
    const link = entry.querySelector('link[title="pdf"]')?.getAttribute('href') || '';
    
    const authors: string[] = [];
    entry.querySelectorAll('author > name').forEach(author => {
      authors.push(author.textContent || '');
    });
    
    const categories: string[] = [];
    entry.querySelectorAll('category').forEach(cat => {
      const term = cat.getAttribute('term');
      if (term) categories.push(term);
    });
    
    results.push({
      id,
      title,
      authors,
      abstract: summary,
      source: 'arxiv',
      url: link,
      publishedDate: published,
      tags: categories
    });
  });
  
  return results;
}

// DBLP API
export async function searchDBLP(query: string, _maxResults = 10): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://dblp.org/search/publ/api?q=${encodeURIComponent(query)}&h=10&format=json`
    );
    const data = await response.json();
    
    return (data.result?.hits?.hit || []).map((hit: Record<string, unknown>, index: number) => ({
      id: `dblp-${index}`,
      title: (hit.info as Record<string, unknown>)?.title as string || '',
      authors: ((hit.info as Record<string, unknown>)?.authors as Record<string, unknown>)?.author ? 
        ((hit.info as Record<string, unknown>).authors as Record<string, unknown>[]).map((a: Record<string, unknown>) => a.text as string) : [],
      abstract: '',
      source: 'dblp' as const,
      url: (hit.info as Record<string, unknown>)?.url as string || '',
      publishedDate: (hit.info as Record<string, unknown>)?.year as string || '',
      tags: (hit.info as Record<string, unknown>)?.venue ? [(hit.info as Record<string, unknown>).venue as string] : []
    }));
  } catch {
    return [];
  }
}

// Mock functions for other sources
export async function searchGoogleScholar(_query: string): Promise<SearchResult[]> {
  return [];
}

export async function searchIEEE(_query: string): Promise<SearchResult[]> {
  return [];
}

export async function searchACM(_query: string): Promise<SearchResult[]> {
  return [];
}

// Unified search
export async function searchAll(query: string, sources: string[] = ['arxiv', 'dblp']): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  const sourceMap: Record<string, () => Promise<SearchResult[]>> = {
    arxiv: () => searchArxiv(query),
    scholar: () => searchGoogleScholar(query),
    dblp: () => searchDBLP(query),
    ieee: () => searchIEEE(query),
    acm: () => searchACM(query),
  };
  
  const promises = sources.map(source => sourceMap[source]?.() || Promise.resolve([]));
  const allResults = await Promise.all(promises);
  
  allResults.forEach(r => results.push(...r));
  
  return results.sort((a, b) => 
    new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
}

export default {
  searchArxiv,
  searchGoogleScholar,
  searchDBLP,
  searchIEEE,
  searchACM,
  searchAll
};
