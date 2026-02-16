import { useState, useEffect } from 'react';

interface Conference {
  id: string;
  name: string;
  shortName: string;
  year: number;
  deadline: string;
  notificationDate?: string;
  conferenceDate?: string;
  website: string;
  category: string;
}

const defaultConferences: Conference[] = [
  { id: '1', name: 'Eurocrypt 2026', shortName: 'Eurocrypt', year: 2026, deadline: '2026-05-06', category: 'blockchain', website: 'https://eurocrypt.iacr.org/2026/' },
  { id: '2', name: 'IEEE Blockchain 2026', shortName: 'IEEE Blockchain', year: 2026, deadline: '2026-07-15', category: 'blockchain', website: 'https://ieee-blockchain.org/2026/' },
  { id: '3', name: 'ACM CCS 2026', shortName: 'CCS', year: 2026, deadline: '2026-05-01', category: 'security', website: 'https://www.sigsac.org/ccs/CCS2026/' },
  { id: '4', name: 'USENIX Security 2026', shortName: 'USENIX Security', year: 2026, deadline: '2026-05-07', category: 'security', website: 'https://www.usenix.org/security2026/' },
  { id: '5', name: 'IEEE S&P 2026', shortName: 'IEEE S&P', year: 2026, deadline: '2026-08-15', category: 'security', website: 'https://sp2026.ieee-security.org/' },
  { id: '6', name: 'NeurIPS 2026', shortName: 'NeurIPS', year: 2026, deadline: '2026-05-19', category: 'ai', website: 'https://neurips.cc/' },
  { id: '7', name: 'ICML 2026', shortName: 'ICML', year: 2026, deadline: '2026-01-27', category: 'ai', website: 'https://icml.cc/2026/' },
  { id: '8', name: 'SIGCOMM 2026', shortName: 'SIGCOMM', year: 2026, deadline: '2026-02-03', category: 'network', website: 'https://sigcomm.org/' },
  { id: '9', name: 'AFT 2026', shortName: 'AFT', year: 2026, deadline: '2026-02-15', category: 'blockchain', website: 'https://aft.math Satoshi/' },
];

const STORAGE_KEY = 'researchflow_conferences';

export default function Conferences() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConf, setNewConf] = useState({ name: '', shortName: '', deadline: '', category: 'other' });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setConferences(JSON.parse(saved));
    } else {
      setConferences(defaultConferences);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConferences));
    }
  }, []);

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'bg-slate-200 text-slate-500';
    if (days <= 7) return 'bg-red-500 text-white';
    if (days <= 30) return 'bg-orange-500 text-white';
    if (days <= 60) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      blockchain: 'bg-blue-100 text-blue-700',
      security: 'bg-red-100 text-red-700',
      ai: 'bg-purple-100 text-purple-700',
      network: 'bg-green-100 text-green-700',
      other: 'bg-slate-100 text-slate-700',
    };
    return colors[category] || colors.other;
  };

  const addConference = () => {
    if (!newConf.name || !newConf.deadline) return;
    const conf: Conference = {
      id: Date.now().toString(),
      ...newConf,
      year: new Date(newConf.deadline).getFullYear(),
      website: '',
    };
    const updated = [...conferences, conf];
    setConferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowAddForm(false);
    setNewConf({ name: '', shortName: '', deadline: '', category: 'other' });
  };

  const deleteConference = (id: string) => {
    const updated = conferences.filter(c => c.id !== id);
    setConferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const categories = ['all', 'blockchain', 'security', 'ai', 'network', 'other'];
  
  const filteredConfs = selectedCategory === 'all' 
    ? conferences 
    : conferences.filter(c => c.category === selectedCategory);

  const sortedConfs = [...filteredConfs].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会议截稿倒计时</h1>
          <p className="text-slate-600">{conferences.length} 个会议</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 添加会议
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-3">添加新会议</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="会议名称"
              value={newConf.name}
              onChange={e => setNewConf({...newConf, name: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="简称"
              value={newConf.shortName}
              onChange={e => setNewConf({...newConf, shortName: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="date"
              value={newConf.deadline}
              onChange={e => setNewConf({...newConf, deadline: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />
            <select
              value={newConf.category}
              onChange={e => setNewConf({...newConf, category: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="blockchain">区块链</option>
              <option value="security">安全</option>
              <option value="ai">AI</option>
              <option value="network">网络</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addConference} className="px-4 py-2 bg-blue-600 text-white rounded-lg">添加</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">取消</button>
          </div>
        </div>
      )}

      {/* Conferences List */}
      <div className="space-y-3">
        {sortedConfs.map(conf => {
          const days = getDaysUntil(conf.deadline);
          const isPast = days < 0;
          
          return (
            <div key={conf.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(conf.category)}`}>
                    {conf.category}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800">{conf.shortName} {conf.year}</h3>
                <p className="text-sm text-slate-500">截稿: {conf.deadline}</p>
              </div>
              
              <div className="text-center mx-4">
                <div className={`px-4 py-2 rounded-lg font-bold ${getStatusColor(days)}`}>
                  {isPast ? '已截稿' : days}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {isPast ? '' : '天'}
                </div>
              </div>
              
              <button
                onClick={() => deleteConference(conf.id)}
                className="p-2 text-slate-400 hover:text-red-500"
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
