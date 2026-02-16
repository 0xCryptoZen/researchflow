import { useState, useEffect } from 'react';
import { type SavedPaper, papersRepository } from '../repositories/papersRepository';

export default function MyPapers() {
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorite'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    setPapers(papersRepository.getAll());
  }, []);

  const deletePaper = (id: string) => {
    papersRepository.deleteById(id);
    setPapers(papersRepository.getAll());
  };

  const updateNotes = (id: string, notes: string) => {
    papersRepository.updateNotes(id, notes);
    setPapers(papersRepository.getAll());
    setEditingNotes(null);
  };

  const addTag = (id: string, tag: string) => {
    papersRepository.addTag(id, tag);
    setPapers(papersRepository.getAll());
  };

  const removeTag = (id: string, tag: string) => {
    papersRepository.removeTag(id, tag);
    setPapers(papersRepository.getAll());
  };

  const filteredPapers = papers.filter(p => {
    const matchesFilter = filter === 'all' || p.isFavorite;
    const matchesSearch = !searchTerm || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      arxiv: { bg: 'bg-orange-100', text: 'text-orange-700' },
      dblp: { bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    return badges[source] || { bg: 'bg-slate-100', text: 'text-slate-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">我的论文库</h1>
          <p className="text-slate-600">{papers.length} 篇论文</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('favorite')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'favorite' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            ♥ 收藏
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="搜索论文标题或作者..."
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {papers.length === 0 ? '还没有收藏的论文，去搜索添加吧' : '没有找到匹配的论文'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPapers.map(paper => (
            <div key={paper.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSourceBadge(paper.source).bg} ${getSourceBadge(paper.source).text}`}>
                      {paper.source.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-500">{paper.publishedDate}</span>
                    <button
                      onClick={() => {
                        papersRepository.toggleFavorite(paper.id);
                        setPapers(papersRepository.getAll());
                      }}
                      className={`text-lg ${paper.isFavorite ? 'text-red-500' : 'text-slate-300'}`}
                    >
                      ♥
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 mb-1">
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {paper.title}
                    </a>
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-2">
                    {paper.authors.join(', ')}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {paper.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(paper.id, tag)} className="text-slate-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+标签"
                      className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          addTag(paper.id, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Notes */}
                  {editingNotes === paper.id ? (
                    <div className="mt-2">
                      <textarea
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        placeholder="添加笔记..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => updateNotes(paper.id, noteContent)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        setEditingNotes(paper.id);
                        setNoteContent(paper.notes || '');
                      }}
                      className="mt-2 p-2 bg-slate-50 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-slate-100"
                    >
                      {paper.notes || '点击添加笔记...'}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => deletePaper(paper.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
