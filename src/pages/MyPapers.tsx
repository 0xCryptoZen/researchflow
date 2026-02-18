import { useState, useEffect } from 'react';
import { type SavedPaper, papersRepository } from '../repositories/papersRepository';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
      arxiv: { bg: 'bg-[rgba(249,115,22,0.15)]', text: 'text-[#FB923C]' },
      dblp: { bg: 'bg-[rgba(168,85,247,0.15)]', text: 'text-[#A855F7]' },
    };
    return badges[source] || { bg: 'bg-[rgba(161,161,170,0.15)]', text: 'text-[#A1A1AA]' };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-[#EDEDEF]">我的论文库</h1>
          <p className="text-[12px] text-[#71717A]">{papers.length} 篇论文</p>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant={filter === 'all' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-[12px] h-7"
          >
            全部
          </Button>
          <Button
            variant={filter === 'favorite' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter('favorite')}
            className="text-[12px] h-7"
          >
            ♥ 收藏
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="搜索论文标题或作者..."
        className="h-9"
      />

      {/* Papers List */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-12 text-[#52525B]">
          {papers.length === 0 ? '还没有收藏的论文，去搜索添加吧' : '没有找到匹配的论文'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPapers.map(paper => (
            <div 
              key={paper.id} 
              className="bg-[#18181B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 hover:border-[rgba(255,255,255,0.1)] transition-all duration-200 animate-fade-in"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getSourceBadge(paper.source).bg} ${getSourceBadge(paper.source).text}`}>
                      {paper.source.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-[#52525B]">{paper.publishedDate}</span>
                    <button
                      onClick={() => {
                        papersRepository.toggleFavorite(paper.id);
                        setPapers(papersRepository.getAll());
                      }}
                      className={`text-sm transition-colors ${paper.isFavorite ? 'text-[#FB7185]' : 'text-[#3F3F46] hover:text-[#FB7185]'}`}
                    >
                      ♥
                    </button>
                  </div>
                  
                  <h3 className="font-medium text-[#EDEDEF] mb-1.5 text-[14px] leading-snug">
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#A5B4FC] transition-colors">
                      {paper.title}
                    </a>
                  </h3>
                  
                  <p className="text-[12px] text-[#71717A] mb-3 leading-relaxed">
                    {paper.authors.join(', ')}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {paper.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-[#27272A] text-[#A1A1AA] rounded text-[11px] flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(paper.id, tag)} className="text-[#52525B] hover:text-[#FB7185] transition-colors">×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+标签"
                      className="px-2 py-0.5 bg-transparent border border-[rgba(255,255,255,0.06)] rounded text-[11px] w-14 text-[#A1A1AA] focus:outline-none focus:border-[rgba(94,106,210,0.4)]"
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
                    <div className="mt-3">
                      <textarea
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        placeholder="添加笔记..."
                        className="w-full px-3 py-2 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px] text-[#EDEDEF] focus:outline-none focus:border-[rgba(94,106,210,0.4)] focus:ring-2 focus:ring-[rgba(94,106,210,0.1)]"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => updateNotes(paper.id, noteContent)}
                          className="text-[11px] h-7"
                        >
                          保存
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingNotes(null)}
                          className="text-[11px] h-7"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        setEditingNotes(paper.id);
                        setNoteContent(paper.notes || '');
                      }}
                      className="mt-3 p-2.5 bg-[#121212] rounded-lg text-[12px] text-[#71717A] cursor-pointer hover:bg-[#1A1A1E] transition-colors border border-[rgba(255,255,255,0.04)]"
                    >
                      {paper.notes || '点击添加笔记...'}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => deletePaper(paper.id)}
                  className="p-1.5 text-[#52525B] hover:text-[#FB7185] transition-colors ml-2"
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
