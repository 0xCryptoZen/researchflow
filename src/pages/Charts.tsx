import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

interface Chart {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'figure' | 'table' | 'image' | 'diagram';
  tags: string[];
  paperId?: string;
  createdAt: string;
  updatedAt: string;
}

const defaultCharts: Chart[] = [
  {
    id: '1',
    name: 'System Architecture',
    description: 'Overall system architecture diagram',
    imageUrl: '',
    type: 'diagram',
    tags: ['architecture', 'system'],
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10',
  },
  {
    id: '2',
    name: 'Experiment Results',
    description: 'Performance comparison results',
    imageUrl: '',
    type: 'figure',
    tags: ['experiment', 'results'],
    createdAt: '2026-02-12',
    updatedAt: '2026-02-12',
  },
];

export default function Charts() {
  const [charts, setCharts] = useState<Chart[]>(() => {
    return readJSON<Chart[]>(STORAGE_KEYS.CHARTS, defaultCharts);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.CHARTS, charts);
  }, [charts]);

  const filteredCharts = charts.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chart.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || chart.type === selectedType;
    return matchesSearch && matchesType;
  });

  const deleteChart = (id: string) => {
    setCharts(charts.filter(c => c.id !== id));
  };

  const handleUpload = (chart: Chart) => {
    setCharts([...charts, { ...chart, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    setShowUploadModal(false);
  };

  const getTypeLabel = (type: Chart['type']) => {
    const labels = { figure: '图表', table: '表格', image: '图片', diagram: '图表' };
    return labels[type] || type;
  };

  const getTypeIcon = (type: Chart['type']) => {
    const icons = { figure: '📊', table: '📋', image: '🖼️', diagram: '📈' };
    return icons[type] || '📁';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">图表管理</h1>
          <p className="text-gray-600 mt-1">{charts.length} 个图表</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span> 上传图表
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 搜索图表..."
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
            <option value="figure">图表</option>
            <option value="table">表格</option>
            <option value="image">图片</option>
            <option value="diagram">流程图</option>
          </select>
        </div>
      </div>

      {/* 图表列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharts.map(chart => (
          <div key={chart.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
              {chart.imageUrl ? (
                <img src={chart.imageUrl} alt={chart.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-4xl text-gray-400">{getTypeIcon(chart.type)}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                {getTypeLabel(chart.type)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{chart.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{chart.description}</p>
            <div className="flex gap-1 mt-2">
              {chart.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => deleteChart(chart.id)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCharts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📊</p>
          <p>没有找到图表</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            上传图表
          </button>
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}

function UploadModal({ onUpload, onClose }: { onUpload: (chart: Chart) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'figure' as Chart['type'],
    tags: '',
    imageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload({
      id: '',
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: '',
      updatedAt: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">上传图表</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as Chart['type']})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="figure">图表</option>
              <option value="table">表格</option>
              <option value="image">图片</option>
              <option value="diagram">流程图</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="experiment, results"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              取消
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              上传
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
