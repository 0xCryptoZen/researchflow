// ResearchFlow 论文搜索后端
// 支持: ArXiv, DBLP, Semantic Scholar, PubMed

import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3002;

app.use(express.json());

// 搜索 ArXiv
async function searchArxiv(query: string, limit = 10) {
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}`;
  const response = await fetch(url);
  const text = await response.text();
  
  // 解析 XML
  const results: any[] = [];
  const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  
  for (const entry of entries) {
    const id = entry.match(/<id>(.*?)<\/id>/)?.[1] || '';
    const title = entry.match(/<title>(.*?)<\/title>/s)?.[1]?.replace(/\s+/g, ' ').trim() || '';
    const abstract = entry.match(/<summary>(.*?)<\/summary>/s)?.[1]?.replace(/\s+/g, ' ').trim() || '';
    const authors = (entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g) || [])
      .map((a: string) => a.match(/<name>(.*?)<\/name>/)?.[1] || '').filter(Boolean);
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1]?.slice(0, 10) || '';
    const categories = (entry.match(/<category term="(.*?)"/g) || [])
      .map((c: string) => c.match(/term="(.*?)"/)?.[1]).filter(Boolean);
    
    results.push({
      id: id.replace('http://arxiv.org/abs/', ''),
      title,
      authors,
      abstract: abstract.slice(0, 500),
      source: 'arxiv',
      url: id,
      year: published ? parseInt(published.slice(0, 4)) : undefined,
      publishedDate: published,
      categories,
    });
  }
  
  return results;
}

// 搜索 DBLP
async function searchDBLP(query: string, limit = 10) {
  // DBLP XML API
  const url = `https://dblp.org/search/publ/api?q=${encodeURIComponent(query)}&h=${limit}&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  
  const results: any[] = [];
  const hits = data.result?.hits?.hit || [];
  
  for (const hit of hits) {
    const info = hit.info || {};
    results.push({
      id: info.key || '',
      title: info.title || '',
      authors: info.authors?.author?.map((a: any) => a.text || a) || [],
      abstract: '',
      source: 'dblp',
      url: `https://dblp.org/rec/${info.key}.html`,
      year: parseInt(info.year) || undefined,
      venue: info.venue?.text || info.venue || '',
    });
  }
  
  return results;
}

// 搜索 Semantic Scholar
async function searchSemantic(query: string, limit = 10) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,abstract,year,venue,url,citationCount`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) {
    console.error('Semantic Scholar API error:', response.status);
    return [];
  }
  
  const data = await response.json();
  const results: any[] = [];
  
  for (const paper of data.data || []) {
    results.push({
      id: paper.paperId || '',
      title: paper.title || '',
      authors: paper.authors?.map((a: any) => a.name) || [],
      abstract: paper.abstract || '',
      source: 'semantic',
      url: paper.url || '',
      year: paper.year,
      venue: paper.venue || '',
      citations: paper.citationCount,
    });
  }
  
  return results;
}

// 搜索 PubMed
async function searchPubMed(query: string, limit = 10) {
  // 先搜索获取 IDs
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;
  const searchResp = await fetch(searchUrl);
  const searchData = await searchResp.json();
  
  const ids = searchData.esearchresult?.idlist?.join(',') || '';
  if (!ids) return [];
  
  // 获取详情
  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
  const fetchResp = await fetch(fetchUrl);
  const fetchData = await fetchResp.json();
  
  const results: any[] = [];
  const docs = fetchData.result || {};
  
  for (const id of ids.split(',')) {
    const doc = docs[id];
    if (doc && doc.uid) {
      results.push({
        id: doc.uid,
        title: doc.title || '',
        authors: doc.authors?.map((a: any) => a.name) || [],
        abstract: '',
        source: 'pubmed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${doc.uid}/`,
        year: doc.pubdate?.slice(0, 4) ? parseInt(doc.pubdate.slice(0, 4)) : undefined,
        venue: doc.source || '',
      });
    }
  }
  
  return results;
}

// 统一搜索接口
app.get('/search', async (req, res) => {
  const { q, source = 'all', limit = 10 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter: q' });
  }
  
  const query = q as string;
  const numLimit = parseInt(limit as string) || 10;
  
  try {
    let results: any[] = [];
    
    if (source === 'all') {
      // 并行搜索多个源
      const [arxiv, dblp, semantic] = await Promise.allSettled([
        searchArxiv(query, numLimit),
        searchDBLP(query, numLimit),
        searchSemantic(query, numLimit),
      ]);
      
      if (arxiv.status === 'fulfilled') results.push(...arxiv.value);
      if (dblp.status === 'fulfilled') results.push(...dblp.value);
      if (semantic.status === 'fulfilled') results.push(...semantic.value);
    } else {
      switch (source) {
        case 'arxiv':
          results = await searchArxiv(query, numLimit);
          break;
        case 'dblp':
          results = await searchDBLP(query, numLimit);
          break;
        case 'semantic':
          results = await searchSemantic(query, numLimit);
          break;
        case 'pubmed':
          results = await searchPubMed(query, numLimit);
          break;
        default:
          return res.status(400).json({ error: `Unknown source: ${source}` });
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 健康检查
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`ResearchFlow Search API running on http://localhost:${PORT}`);
});
