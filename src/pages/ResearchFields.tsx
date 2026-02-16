import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../services/auth';

const researchFields = [
  { id: 'blockchain', name: '区块链 Blockchain', icon: '⛓️', keywords: ['cryptocurrency', 'smart contract', 'consensus'], color: 'bg-blue-500' },
  { id: 'security', name: '网络安全 Security', icon: '🔒', keywords: ['network security', 'cryptography', 'privacy'], color: 'bg-red-500' },
  { id: 'ai', name: '人工智能 AI', icon: '🤖', keywords: ['machine learning', 'deep learning', 'NLP'], color: 'bg-purple-500' },
  { id: 'network', name: '网络技术 Networking', icon: '🌐', keywords: ['distributed systems', 'protocols', '5G'], color: 'bg-green-500' },
  { id: 'system', name: '系统架构 Systems', icon: '💻', keywords: ['operating systems', 'databases', 'compilers'], color: 'bg-orange-500' },
  { id: 'software', name: '软件工程 Software', icon: '📦', keywords: ['software engineering', 'programming languages', 'formal methods'], color: 'bg-teal-500' },
];

const recommendedConferences: Record<string, string[]> = {
  blockchain: ['Crypto 2026', 'IEEE Blockchain 2026', 'Eurocrypt 2026'],
  security: ['USENIX Security 2026', 'ACM CCS 2026', 'IEEE S&P 2026'],
  ai: ['NeurIPS 2026', 'ICML 2026', 'ICLR 2026'],
  network: ['SIGCOMM 2026', 'INFOCOM 2026', 'NSDI 2026'],
  system: ['SOSP 2026', 'OSDI 2026', 'PLDI 2026'],
  software: ['ICSE 2026', 'FSE 2026', 'ASE 2026'],
};

export default function ResearchFields() {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();
  const [selectedFields, setSelectedFields] = useState<string[]>(user?.researchFields || []);
  const [customField, setCustomField] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSave = async () => {
    if (user) {
      await auth.updateProfile({ researchFields: selectedFields });
    }
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">选择研究领域</h1>
        <p className="text-slate-600">选择您感兴趣的研究领域，我们将为您推荐相关的论文和会议</p>
      </div>

      {/* Research Fields Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {researchFields.map(field => {
          const isSelected = selectedFields.includes(field.id);
          return (
            <button
              key={field.id}
              onClick={() => toggleField(field.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">{field.icon}</div>
              <div className="font-medium text-slate-800">{field.name}</div>
              <div className="text-sm text-slate-500 mt-1">
                {field.keywords.slice(0, 2).join(', ')}
              </div>
              {isSelected && (
                <div className="mt-2 text-blue-600 text-sm">✓ 已选择</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Fields & Conferences */}
      {selectedFields.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">推荐会议</h2>
          <div className="space-y-4">
            {selectedFields.map(fieldId => {
              const field = researchFields.find(f => f.id === fieldId);
              const confs = recommendedConferences[fieldId] || [];
              return (
                <div key={fieldId}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{field?.icon}</span>
                    <span className="font-medium text-slate-700">{field?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-8">
                    {confs.map(conf => (
                      <span key={conf} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                        {conf}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Field */}
      <div className="mb-8">
        <button 
          onClick={() => setShowCustom(!showCustom)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + 添加自定义领域
        </button>
        {showCustom && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customField}
              onChange={e => setCustomField(e.target.value)}
              placeholder="输入自定义领域名称"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (customField.trim()) {
                  setSelectedFields(prev => [...prev, customField.trim()]);
                  setCustomField('');
                  setShowCustom(false);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              添加
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={selectedFields.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存并继续
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
        >
          跳过
        </button>
      </div>
    </div>
  );
}
