import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

interface OutlineSection {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'writing' | 'completed';
}

interface Outline {
  id: string;
  title: string;
  conference: string;
  sections: OutlineSection[];
  createdAt: string;
  updatedAt: string;
}

const defaultOutlines: Outline[] = [
  {
    id: '1',
    title: '基于深度学习的区块链安全研究',
    conference: 'IEEE S&P',
    sections: [
      { id: '1-1', title: 'Abstract', content: '', status: 'pending' },
      { id: '1-2', title: 'Introduction', content: '', status: 'pending' },
      { id: '1-3', title: 'Related Work', content: '', status: 'pending' },
      { id: '1-4', title: 'Methodology', content: '', status: 'pending' },
      { id: '1-5', title: 'Experiment', content: '', status: 'pending' },
      { id: '1-6', title: 'Conclusion', content: '', status: 'pending' },
    ],
    createdAt: '2026-02-10',
    updatedAt: '2026-02-15',
  },
];

const templateStructures = {
  'standard': {
    name: '标准学术论文结构',
    sections: ['Abstract', 'Introduction', 'Background', 'Related Work', 'Methodology', 'Experiment', 'Discussion', 'Conclusion', 'References'],
  },
  'security': {
    name: '安全/区块链论文结构',
    sections: ['Abstract', 'Introduction', 'Preliminaries', 'System Model', 'Threat Model', 'Proposed Scheme', 'Security Analysis', 'Performance Evaluation', 'Conclusion', 'References'],
  },
  'ai': {
    name: 'AI/ML 论文结构',
    sections: ['Abstract', 'Introduction', 'Related Work', 'Method', 'Experiments', 'Results', 'Discussion', 'Conclusion', 'Appendix'],
  },
  'short': {
    name: '短论文结构',
    sections: ['Abstract', 'Introduction', 'Technical Approach', 'Experiments', 'Conclusion', 'References'],
  },
};

export default function Outline() {
  const [outlines, setOutlines] = useState<Outline[]>(() => {
    return readJSON<Outline[]>(STORAGE_KEYS.OUTLINES, defaultOutlines);
  });
  const [selectedOutline, setSelectedOutline] = useState<Outline | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');

  useEffect(() => {
    writeJSON(STORAGE_KEYS.OUTLINES, outlines);
  }, [outlines]);

  const createOutline = (title: string, conference: string, templateKey: string) => {
    const template = templateStructures[templateKey as keyof typeof templateStructures];
    const newOutline: Outline = {
      id: Date.now().toString(),
      title,
      conference,
      sections: template.sections.map((section, index) => ({
        id: `${Date.now()}-${index}`,
        title: section,
        content: '',
        status: 'pending' as const,
      })),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setOutlines([newOutline, ...outlines]);
    setShowNewModal(false);
  };

  const updateSection = (outlineId: string, sectionId: string, content: string) => {
    setOutlines(outlines.map(outline => {
      if (outline.id === outlineId) {
        return {
          ...outline,
          sections: outline.sections.map(section =>
            section.id === sectionId ? { ...section, content } : section
          ),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return outline;
    }));
    if (selectedOutline?.id === outlineId) {
      setSelectedOutline(prev => prev ? {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId ? { ...section, content } : section
        ),
      } : null);
    }
  };

  const updateSectionStatus = (outlineId: string, sectionId: string, status: OutlineSection['status']) => {
    setOutlines(outlines.map(outline => {
      if (outline.id === outlineId) {
        return {
          ...outline,
          sections: outline.sections.map(section =>
            section.id === sectionId ? { ...section, status } : section
          ),
        };
      }
      return outline;
    }));
  };

  const exportOutline = (outline: Outline) => {
    const content = outline.sections.map(section => 
      `## ${section.title}\n\n${section.content || '(待填写)'}\n`
    ).join('\n');
    
    const blob = new Blob([`# ${outline.title}\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outline.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProgress = (outline: Outline) => {
    const completed = outline.sections.filter(s => s.status === 'completed').length;
    return Math.round((completed / outline.sections.length) * 100);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">论文大纲</h1>
          <p className="text-gray-600 mt-1">管理和生成论文大纲</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span>📋</span> 使用模板
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span> 新建大纲
          </button>
        </div>
      </div>

      {/* 大纲列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {outlines.map(outline => (
            <div
              key={outline.id}
              onClick={() => setSelectedOutline(outline)}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                selectedOutline?.id === outline.id
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">{outline.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span>📅 {outline.conference}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">进度</span>
                  <span className="text-blue-600 font-medium">{getProgress(outline)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getProgress(outline)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 大纲详情 */}
        <div className="lg:col-span-2">
          {selectedOutline ? (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedOutline.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedOutline.conference} · 更新于 {selectedOutline.updatedAt}
                  </p>
                </div>
                <button
                  onClick={() => exportOutline(selectedOutline)}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  📤 导出 Markdown
                </button>
              </div>

              <div className="space-y-4">
                {selectedOutline.sections.map((section, index) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">{index + 1}</span>
                        <h3 className="font-medium text-gray-900">{section.title}</h3>
                        <select
                          value={section.status}
                          onChange={(e) => updateSectionStatus(selectedOutline.id, section.id, e.target.value as OutlineSection['status'])}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            section.status === 'completed' ? 'bg-green-100 text-green-800' :
                            section.status === 'writing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="pending">待开始</option>
                          <option value="writing">进行中</option>
                          <option value="completed">已完成</option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(selectedOutline.id, section.id, e.target.value)}
                      placeholder={`撰写 ${section.title} 内容...`}
                      className="w-full px-3 py-2 border rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
              <p className="text-4xl mb-4">📝</p>
              <p>选择一个大纲进行编辑</p>
              <p className="text-sm mt-2">或创建新大纲</p>
            </div>
          )}
        </div>
      </div>

      {/* 新建大纲弹窗 */}
      {showNewModal && (
        <NewOutlineModal
          onSave={createOutline}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {/* 模板选择弹窗 */}
      {showTemplateModal && (
        <TemplateModal
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          onConfirm={() => {
            setShowTemplateModal(false);
            setShowNewModal(true);
          }}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}

function NewOutlineModal({ onSave, onClose }: { onSave: (title: string, conference: string, template: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [conference, setConference] = useState('');
  const [template, setTemplate] = useState('standard');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">新建大纲</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">论文标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="输入论文标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目标会议/期刊</label>
            <input
              type="text"
              value={conference}
              onChange={(e) => setConference(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="如: IEEE S&P, NDSS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模板结构</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(templateStructures).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={() => title && conference && onSave(title, conference, template)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateModal({
  selectedTemplate,
  onSelectTemplate,
  onConfirm,
  onClose,
}: {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">选择模板结构</h2>
        <div className="space-y-3">
          {Object.entries(templateStructures).map(([key, template]) => (
            <div
              key={key}
              onClick={() => onSelectTemplate(key)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate === key ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{template.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {template.sections.join(' → ')}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            确认并创建
          </button>
        </div>
      </div>
    </div>
  );
}
