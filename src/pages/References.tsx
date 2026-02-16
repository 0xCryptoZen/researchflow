import { useState, useEffect } from 'react';

interface Reference {
  id: string;
  type: 'article' | 'conference' | 'book' | 'thesis' | 'misc';
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  conference?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  tags: string[];
  notes?: string;
}

const defaultReferences: Reference[] = [
  {
    id: '1',
    type: 'conference',
    title: 'A Secure Routing Protocol for Ad Hoc Networks',
    authors: ['John Smith', 'Jane Doe'],
    year: 2024,
    conference: 'IEEE ICC',
    pages: '123-134',
    doi: '10.1109/ICC.2024.10001234',
    tags: ['routing', 'security', 'ad hoc'],
    notes: 'Important reference for chapter 2',
  },
  {
    id: '2',
    type: 'article',
    title: 'Blockchain Technology: A Comprehensive Survey',
    authors: ['Alice Johnson', 'Bob Williams'],
    year: 2023,
    journal: 'IEEE Communications Surveys & Tutorials',
    volume: '25',
    issue: '2',
    pages: '1-37',
    doi: '10.1109/CST.2023.1234567',
    tags: ['blockchain', 'survey', 'distributed systems'],
  },
];

export default function References() {
  const [references, setReferences] = useState<Reference[]>(() => {
    const saved = localStorage.getItem('references');
    return saved ? JSON.parse(saved) : defaultReferences;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('references', JSON.stringify(references));
  }, [references]);

  const filteredRefs = references.filter(ref => {
    const matchesSearch = ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ref.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || ref.type === selectedType;
    return matchesSearch && matchesType;
  });

  const deleteReference = (id: string) => {
    setReferences(references.filter(r => r.id !== id));
  };

  const importBibTeX = (bibtex: string) => {
    // Parse simple BibTeX format
    const newRefs: Reference[] = [];
    const entries = bibtex.match(/@\w+\{[^@]+\}/g) || [];
    
    for (const entry of entries) {
      const typeMatch = entry.match(/@(\w+)\{/);
      const idMatch = entry.match(/@\w+\{(\w+),/);
      const titleMatch = entry.match(/title\s*=\s*\{([^}]+)\}/);
      const authorMatch = entry.match(/author\s*=\s*\{([^}]+)\}/);
      const yearMatch = entry.match(/year\s*=\s*\{?(\d{4})\}?/);
      const journalMatch = entry.match(/journal\s*=\s*\{([^}]+)\}/);
      const doiMatch = entry.match(/doi\s*=\s*\{([^}]+)\}/);

      if (titleMatch) {
        newRefs.push({
          id: idMatch?.[1] || Date.now().toString(),
          type: (typeMatch?.[1]?.toLowerCase() as Reference['type']) || 'misc',
          title: titleMatch[1],
          authors: authorMatch?.[1]?.split(' and ').map(a => a.trim()) || [],
          year: parseInt(yearMatch?.[1] || '2024'),
          journal: journalMatch?.[1],
          doi: doiMatch?.[1],
          tags: [],
        });
      }
    }

    setReferences([...references, ...newRefs]);
    setShowImportModal(false);
  };

  const exportBibTeX = (ref: Reference) => {
    const bibtex = `@${ref.type === 'article' ? 'article' : 'conference'}{${ref.id},
  title = {${ref.title}},
  author = {${ref.authors.join(' and ')}},
  year = {${ref.year}},
${ref.journal ? `  journal = {${ref.journal}},\n` : ''}${ref.doi ? `  doi = {${ref.doi}},\n` : ''}
}`;
    return bibtex;
  };

  const exportAllBibTeX = () => {
    const bibtex = references.map(exportBibTeX).join('\n');
    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeLabel = (type: Reference['type']) => {
    const labels = { article: '期刊', conference: '会议', book: '书籍', thesis: '论文', misc: '其他' };
    return labels[type] || type;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">参考文献管理</h1>
          <p className="text-gray-600 mt-1">{references.length} 篇参考文献</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            📥 导入 BibTeX
          </button>
          <button
            onClick={exportAllBibTeX}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            📤 导出 BibTeX
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 搜索参考文献..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">所有类型</option>
            <option value="article">期刊</option>
            <option value="conference">会议</option>
            <option value="book">书籍</option>
            <option value="thesis">论文</option>
            <option value="misc">其他</option>
          </select>
        </div>
      </div>

      {/* 参考文献列表 */}
      <div className="space-y-4">
        {filteredRefs.map(ref => (
          <div key={ref.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                    {getTypeLabel(ref.type)}
                  </span>
                  <span className="text-gray-500 text-sm">{ref.year}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{ref.title}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {ref.authors.join(', ')}
                </p>
                {ref.journal && (
                  <p className="text-gray-500 text-sm mt-1">{ref.journal}</p>
                )}
                {ref.doi && (
                  <p className="text-blue-600 text-sm mt-1">DOI: {ref.doi}</p>
                )}
                <div className="flex gap-1 mt-2">
                  {ref.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {/* TODO: Edit reference */}}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  📝
                </button>
                <button
                  onClick={() => deleteReference(ref.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRefs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📚</p>
          <p>没有找到参考文献</p>
          <button
            onClick={() => setShowImportModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            导入 BibTeX
          </button>
        </div>
      )}

      {/* 导入弹窗 */}
      {showImportModal && (
        <ImportModal
          onImport={importBibTeX}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

function ImportModal({ onImport, onClose }: { onImport: (bibtex: string) => void; onClose: () => void }) {
  const [bibtex, setBibtex] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">导入 BibTeX</h2>
        <textarea
          value={bibtex}
          onChange={(e) => setBibtex(e.target.value)}
          placeholder="@article{key,
  title = {Title},
  author = {Author},
  year = {2024},
}"
          className="w-full px-3 py-2 border rounded-lg font-mono text-sm min-h-[200px]"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={() => onImport(bibtex)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            导入
          </button>
        </div>
      </div>
    </div>
  );
}
