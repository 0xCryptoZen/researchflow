// Citation Service - DOI 解析与引用格式化

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface DoiMetadata {
  doi: string;
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  abstract?: string;
  type: 'article' | 'conference' | 'book' | 'thesis' | 'misc';
  issn?: string;
  isbn?: string;
  publisher?: string;
}

// DOI 解析 - 从 DOI 获取完整元数据
export async function resolveDoi(doi: string): Promise<DoiMetadata | null> {
  if (!doi.trim()) return null;
  
  try {
    const response = await fetch(
      `${API_BASE}/doi/resolve?doi=${encodeURIComponent(doi)}`
    );
    
    if (!response.ok) {
      console.error('DOI resolve failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.metadata;
  } catch (error) {
    console.error('DOI resolve error:', error);
    return null;
  }
}

// 批量解析 DOI
export async function resolveDoiBatch(dois: string[]): Promise<DoiMetadata[]> {
  if (!dois.length) return [];
  
  try {
    const response = await fetch(`${API_BASE}/doi/resolve-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dois }),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.results.filter((r: any) => !r.error);
  } catch (error) {
    console.error('DOI batch resolve error:', error);
    return [];
  }
}

// 引用格式化
export type CitationStyle = 'bibtex' | 'apa' | 'ieee' | 'mla' | 'chicago';

// 格式化单条引用
export async function formatCitation(
  metadata: Partial<DoiMetadata>,
  style: CitationStyle = 'bibtex'
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/citations/format`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata, style }),
    });
    
    if (!response.ok) return '';
    
    const data = await response.json();
    return data.citation;
  } catch (error) {
    console.error('Citation format error:', error);
    return '';
  }
}

// 批量格式化引用
export async function formatCitationsBatch(
  references: Partial<DoiMetadata>[],
  style: CitationStyle = 'bibtex'
): Promise<string[]> {
  if (!references.length) return [];
  
  try {
    const response = await fetch(`${API_BASE}/citations/format-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ references, style }),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.results.map((r: any) => r.citation);
  } catch (error) {
    console.error('Citation batch format error:', error);
    return [];
  }
}

// 客户端本地格式化 (离线时使用)
export function formatCitationLocal(
  ref: Partial<DoiMetadata>,
  style: CitationStyle = 'bibtex'
): string {
  switch (style) {
    case 'bibtex':
      return formatBibTeXLocal(ref);
    case 'apa':
      return formatAPALocal(ref);
    case 'ieee':
      return formatIEEELocal(ref);
    case 'mla':
      return formatMLALocal(ref);
    case 'chicago':
      return formatChicagoLocal(ref);
    default:
      return formatBibTeXLocal(ref);
  }
}

function formatBibTeXLocal(ref: Partial<DoiMetadata>): string {
  const type = ref.type === 'article' ? 'article' :
               ref.type === 'conference' ? 'inproceedings' :
               ref.type === 'book' ? 'book' : 'misc';
  
  const key = `${ref.authors?.[0]?.split(' ').pop() || 'unknown'}${ref.year || ''}`.toLowerCase();
  
  let bibtex = `@${type}{${key},\n`;
  bibtex += `  title = {${ref.title || ''}},\n`;
  
  if (ref.authors?.length) {
    bibtex += `  author = {${ref.authors.join(' and ')}},\n`;
  }
  
  if (ref.year) bibtex += `  year = {${ref.year}},\n`;
  if (ref.journal) bibtex += `  journal = {${ref.journal}},\n`;
  if (ref.volume) bibtex += `  volume = {${ref.volume}},\n`;
  if (ref.issue) bibtex += `  number = {${ref.issue}},\n`;
  if (ref.pages) bibtex += `  pages = {${ref.pages}},\n`;
  if (ref.doi) bibtex += `  doi = {${ref.doi}},\n`;
  if (ref.url) bibtex += `  url = {${ref.url}},\n`;
  
  return bibtex.replace(/,\n$/, '\n') + `}`;
}

function formatAPALocal(ref: Partial<DoiMetadata>): string {
  const authors = ref.authors?.length 
    ? ref.authors.length === 1 
      ? ref.authors[0]
      : ref.authors.length === 2
        ? `${ref.authors[0]} & ${ref.authors[1]}`
        : `${ref.authors.slice(0, -1).join(', ')}, & ${ref.authors[ref.authors.length - 1]}`
    : 'Unknown Author';
  
  const year = ref.year ? `(${ref.year})` : '(n.d.)';
  const title = ref.title || 'Untitled';
  
  let citation = `${authors} ${year}. ${title}.`;
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`;
    if (ref.volume) citation += `, *${ref.volume}*`;
    if (ref.issue) citation += `(${ref.issue})`;
    if (ref.pages) citation += `, ${ref.pages}`;
    citation += '.';
  } else if (ref.url) {
    citation += ` ${ref.url}`;
  }
  
  return citation;
}

function formatIEEELocal(ref: Partial<DoiMetadata>): string {
  const authors = ref.authors?.length 
    ? ref.authors.map((name, i) => {
        const parts = name.split(' ');
        return parts.length > 1 
          ? `${parts.slice(0, -1).map(p => p[0] + '.').join(' ')} ${parts[parts.length - 1]}`
          : name;
      }).join(', ')
    : 'Unknown Author';
  
  const title = ref.title || 'Untitled';
  let citation = `${authors}, "${title},"`;
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`;
    if (ref.volume) citation += `, vol. ${ref.volume}`;
    if (ref.issue) citation += `, no. ${ref.issue}`;
    if (ref.pages) citation += `, pp. ${ref.pages}`;
    if (ref.year) citation += `, ${ref.year}`;
    citation += '.';
  } else if (ref.year) {
    citation += ` ${ref.year}.`;
  }
  
  return citation;
}

function formatMLALocal(ref: Partial<DoiMetadata>): string {
  const authors = ref.authors?.length
    ? ref.authors.length === 1 
      ? ref.authors[0]
      : ref.authors.length === 2
        ? `${ref.authors[0]} and ${ref.authors[1]}`
        : `${ref.authors[0]}, et al`
    : 'Unknown Author';
  
  const title = ref.title ? `"${ref.title}."` : '"Untitled."';
  let citation = `${authors}. ${title}`;
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`;
    if (ref.volume) citation += `, vol. ${ref.volume}`;
    if (ref.issue) citation += `, no. ${ref.issue}`;
    if (ref.year) citation += `, ${ref.year}`;
    if (ref.pages) citation += `, pp. ${ref.pages}`;
    citation += '.';
  }
  
  return citation;
}

function formatChicagoLocal(ref: Partial<DoiMetadata>): string {
  const authors = ref.authors?.length ? ref.authors.join(', ') : 'Unknown Author';
  const title = ref.title ? `"${ref.title}."` : '"Untitled."';
  let citation = `${authors}. ${title}`;
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`;
    if (ref.volume) citation += ` ${ref.volume}`;
    if (ref.issue) citation += `, no. ${ref.issue}`;
    if (ref.year) citation += ` (${ref.year})`;
    if (ref.pages) citation += `: ${ref.pages}`;
    citation += '.';
  }
  
  if (ref.doi) {
    citation += ` https://doi.org/${ref.doi}.`;
  }
  
  return citation;
}

export default {
  resolveDoi,
  resolveDoiBatch,
  formatCitation,
  formatCitationsBatch,
  formatCitationLocal,
};
