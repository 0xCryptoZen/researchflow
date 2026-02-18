import { useState } from 'react';
import { searchPapers, type SearchResult } from '../services/papers';
import { papersRepository } from '../repositories/papersRepository';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Papers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [savedIds, setSavedIds] = useState<string[]>(() => papersRepository.getSavedIds());

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await searchPapers(query, selectedSource as any, 20);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePaper = (paper: SearchResult) => {
    const isSaved = papersRepository.addFromSearchResult(paper);
    if (isSaved) {
      setSavedIds([...savedIds, paper.id]);
    } 
  };

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      arxiv: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-100' },
      scholar: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-100' },
      dblp: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-100' },
      ieee: { bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-700 dark:text-teal-100' },
      acm: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-100' },
    };
    return badges[source] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">论文搜索</h1>
        <p className="text-muted-foreground">搜索 arXiv、Google Scholar、DBLP、IEEE、ACM</p>
      </div>

      {/* Search Box */}
      <Card className="p-4">
        <div className="flex gap-3">
          <Input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索论文关键词..."
            className="flex-1"
          />
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择来源" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              <SelectItem value="arxiv">arXiv</SelectItem>
              <SelectItem value="dblp">DBLP</SelectItem>
              <SelectItem value="scholar">Google Scholar</SelectItem>
              <SelectItem value="ieee">IEEE Xplore</SelectItem>
              <SelectItem value="acm">ACM DL</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? '搜索中...' : '搜索'}
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            输入关键词搜索论文
          </div>
        )}

        {results.map((paper) => (
          <Card key={paper.id} className="p-4 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSourceBadge(paper.source).bg} ${getSourceBadge(paper.source).text}`}>
                      {paper.source.toUpperCase()}
                    </span>
                    {paper.year && <span className="text-sm text-muted-foreground">{paper.year}</span>}
                    {paper.venue && <span className="text-sm text-muted-foreground">• {paper.venue}</span>}
                  </div>
                  
                  <h3 className="font-semibold mb-2 hover:text-primary cursor-pointer">
                    <a href={paper.url} target="_blank" rel="noopener noreferrer">
                      {paper.title}
                    </a>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? '...' : ''}
                  </p>
                  
                  {paper.abstract && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{paper.abstract}</p>
                  )}
                  
                  {paper.tags && paper.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {paper.tags.slice(0, 5).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button
                  variant={savedIds.includes(paper.id) ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={() => savePaper(paper)}
                  disabled={savedIds.includes(paper.id)}
                  title="保存到我的论文库"
                >
                  {savedIds.includes(paper.id) ? '✓' : '+'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          找到 {results.length} 篇论文
          {savedIds.length > 0 && ` · ${savedIds.length} 篇已保存`}
        </div>
      )}
    </div>
  );
}
