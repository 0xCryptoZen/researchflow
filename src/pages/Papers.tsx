import { useState } from 'react';
import { searchAll, type SearchResult } from '../services/papers';

export default function Papers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const sources = selectedSource === 'all' 
        ? ['arxiv', 'dblp'] 
        : [selectedSource];
      const data = await searchAll(query, sources);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      arxiv: { bg: 'bg-orange-100', text: 'text-orange-700' },
      scholar: { bg: 'bg-blue-100', text: 'text-blue-700' },
      dblp: { bg: 'bg-purple-100', text: 'text-purple-700' },
      ieee: { bg: 'bg-teal-100', text: 'text-teal-700' },
      acm: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    return badges[source] || { bg: 'bg-slate-100', text: 'text-slate-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">论文搜索</h1>
        <p className="text-slate-600">搜索 arXiv、Google Scholar、DBLP、IEEE、ACM</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索论文关键词..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部来源</option>
            <option value="arxiv">arXiv</option>
            <option value="dblp">DBLP</option>
            <option value="ieee">IEEE</option>
            <option value="acm">ACM</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500">
            输入关键词搜索论文
          </div>
        )}

        {results.map((paper) => (
          <div key={paper.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSourceBadge(paper.source).bg} ${getSourceBadge(paper.source).text}`}>
                    {paper.source.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-500">{paper.publishedDate}</span>
                </div>
                
                <h3 className="font-semibold text-slate-800 mb-2 hover:text-blue-600 cursor-pointer">
                  <a href={paper.url} target="_blank" rel="noopener noreferrer">
                    {paper.title}
                  </a>
                </h3>
                
                <p className="text-sm text-slate-600 mb-2">
                  {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? '...' : ''}
                </p>
                
                {paper.abstract && (
                  <p className="text-sm text-slate-500 line-clamp-2">{paper.abstract}</p>
                )}
                
                {paper.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {paper.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => toggleFavorite(paper.id)}
                className={`p-2 rounded-lg transition-colors ${
                  favorites.includes(paper.id) 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                ♥
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="text-sm text-slate-500 text-center">
          找到 {results.length} 篇论文
          {favorites.length > 0 && ` · ${favorites.length} 篇收藏`}
        </div>
      )}
    </div>
  );
}
