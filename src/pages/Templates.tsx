interface Template {
  id: string;
  name: string;
  conference: string;
  format: string;
  downloads: number;
  description: string;
  lastUpdated: string;
  content?: string;  // LaTeX source for preview
  url?: string;      // Download URL
}

const templates: Template[] = [
  {
    id: '1',
    name: 'IEEE Conference Template',
    conference: 'IEEE',
    format: 'LaTeX',
    downloads: 15420,
    description: 'Official IEEE conference paper template with proper formatting guidelines',
    lastUpdated: '2026-01-15',
    url: 'https://www.ieee.org/publications/latex-templates/ieeeconf-latex.zip',
    content: `\\documentclass[conference]{IEEEtran}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{amsmath}

\\title{Your Paper Title Here}
\\author{Author Name}

\\begin{document}
\\maketitle

\\begin{abstract}
This is the abstract of your paper.
\\end{abstract}

\\section{Introduction}
Your introduction goes here.

\\section{Conclusion}
Your conclusion goes here.

\\bibliography{references}
\\end{document}`,
  },
  {
    id: '2',
    name: 'ACM SIGCHI Template',
    conference: 'ACM',
    format: 'LaTeX',
    downloads: 8932,
    description: 'ACM SIGCHI proceedings template for human-computer interaction',
    lastUpdated: '2026-01-20',
    url: 'https://www.acm.org/publications/proceedings-template',
    content: `\\documentclass[sigchi]{acmart}
\\usepackage{graphicx}

\\title{Your Paper Title}
\\author{Author Name}

\\begin{document}
\\maketitle

\\section{Introduction}
Your content here.

\\section{Conclusion}
Your conclusion here.
\\end{document}`,
  },
  {
    id: '3',
    name: 'IEEE Transactions Template',
    conference: 'IEEE',
    format: 'LaTeX',
    downloads: 12450,
    description: 'IEEE Transactions journal template with two-column format',
    lastUpdated: '2026-02-01',
    url: 'https://www.ieee.org/publications/latex-templates/',
  },
  {
    id: '4',
    name: 'USENIX Security Template',
    conference: 'USENIX',
    format: 'LaTeX',
    downloads: 5621,
    description: 'USENIX Security Symposium template',
    lastUpdated: '2026-01-10',
    url: 'https://www.usenix.org//publications/templates',
  },
  {
    id: '5',
    name: 'NDSS Template',
    conference: 'NDSS',
    format: 'LaTeX',
    downloads: 3210,
    description: 'Network and Distributed System Security Symposium template',
    lastUpdated: '2026-01-25',
    url: 'https://ndss-symposium.org/submissions/',
  },
  {
    id: '6',
    name: 'arXiv Preprint Template',
    conference: 'arXiv',
    format: 'LaTeX',
    downloads: 25000,
    description: 'Standard arXiv preprint template',
    lastUpdated: '2026-02-05',
    url: 'https://arxiv.org/help/latex',
    content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{amsmath}

\\title{Your Title Here}
\\author{Author Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\section{Introduction}
Your introduction.

\\section{Conclusion}
Your conclusion.

\\bibliographystyle{plain}
\\bibliography{references}
\\end{document}`,
  },
];

import { useState } from 'react';

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedConference, setSelectedConference] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.conference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'all' || template.format === selectedFormat;
    const matchesConference = selectedConference === 'all' || template.conference === selectedConference;
    return matchesSearch && matchesFormat && matchesConference;
  });

  const conferences = [...new Set(templates.map(t => t.conference))];

  // Handle download
  const handleDownload = (template: Template) => {
    if (template.url) {
      window.open(template.url, '_blank');
    } else {
      // Generate and download LaTeX file
      const content = template.content || '';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '_')}.tex`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle clone (copy to clipboard)
  const handleClone = async (template: Template) => {
    const content = template.content || '';
    try {
      await navigator.clipboard.writeText(content);
      alert('模板已复制到剪贴板！');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">LaTeX 模板库</h1>
        <p className="text-gray-600 mt-1">选择适合你目标会议的 LaTeX 模板</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 搜索模板..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">所有格式</option>
            <option value="LaTeX">LaTeX</option>
            <option value="Word">Word</option>
          </select>
          <select
            value={selectedConference}
            onChange={(e) => setSelectedConference(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">所有会议/期刊</option>
            {conferences.map(conf => (
              <option key={conf} value={conf}>{conf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className="text-sm text-blue-600">{template.conference}</span>
              </div>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                {template.format}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>📥 {template.downloads.toLocaleString()} 次下载</span>
              <span>🕐 {template.lastUpdated}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDownload(template)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                📥 下载
              </button>
              <button 
                onClick={() => handleClone(template)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                title="复制到剪贴板"
              >
                📋 克隆
              </button>
              {template.content && (
                <button 
                  onClick={() => setPreviewTemplate(template)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  👁️ 预览
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📝</p>
          <p>没有找到匹配的模板</p>
          <p className="text-sm mt-2">尝试调整搜索条件</p>
        </div>
      )}

      {/* 添加自定义模板 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">➕ 添加自定义模板</h3>
        <p className="text-sm text-gray-600 mb-4">
          如果你有自己的模板，可以上传分享给其他用户
        </p>
        <button className="px-4 py-2 border rounded-lg hover:bg-white transition-colors">
          上传模板
        </button>
      </div>

      {/* 模板预览弹窗 */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-500">{previewTemplate.conference}</p>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              <pre className="text-sm font-mono whitespace-pre-wrap bg-white p-4 rounded border">
                {previewTemplate.content || '预览内容不可用'}
              </pre>
            </div>
            <div className="flex gap-2 p-4 border-t">
              <button 
                onClick={() => handleDownload(previewTemplate)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📥 下载
              </button>
              <button 
                onClick={() => handleClone(previewTemplate)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                📋 克隆到剪贴板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
