import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

interface Milestone {
  id: string;
  name: string;
  deadline: string;
  completed: boolean;
}

interface WritingProgress {
  id: string;
  paperTitle: string;
  submissionDeadline: string;
  milestones: Milestone[];
}

const defaultProgress: WritingProgress[] = [
  {
    id: '1',
    paperTitle: 'Blockchain Security Paper',
    submissionDeadline: '2026-03-15',
    milestones: [
      { id: '1', name: '文献调研', deadline: '2026-02-01', completed: true },
      { id: '2', name: '实验完成', deadline: '2026-02-15', completed: true },
      { id: '3', name: '初稿完成', deadline: '2026-02-28', completed: false },
      { id: '4', name: '最终稿', deadline: '2026-03-10', completed: false },
    ],
  },
];

export default function WritingProgress() {
  const [progress, setProgress] = useState<WritingProgress[]>(() => {
    return readJSON<WritingProgress[]>(STORAGE_KEYS.WRITING_PROGRESS, defaultProgress);
  });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.WRITING_PROGRESS, progress);
  }, [progress]);

  const toggleMilestone = (paperId: string, milestoneId: string) => {
    setProgress(progress.map(p => {
      if (p.id === paperId) {
        return {
          ...p,
          milestones: p.milestones.map(m => 
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        };
      }
      return p;
    }));
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getProgress = (milestones: Milestone[]) => {
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">写作进度提醒</h1>
          <p className="text-gray-600 mt-1">{progress.length} 篇论文进度追踪</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          ➕ 添加论文
        </button>
      </div>

      <div className="space-y-6">
        {progress.map(p => {
          const daysRemaining = getDaysRemaining(p.submissionDeadline);
          const progressPercent = getProgress(p.milestones);
          
          return (
            <div key={p.id} className="bg-white rounded-lg border p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{p.paperTitle}</h3>
                  <p className="text-gray-500 text-sm">
                    截稿日期: {p.submissionDeadline} 
                    <span className={`ml-2 ${daysRemaining < 7 ? 'text-red-600' : daysRemaining < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                      ({daysRemaining} 天后截稿)
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{progressPercent}%</div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>

              {/* 里程碑 */}
              <div className="space-y-2">
                {p.milestones.map(m => {
                  const milestoneDays = getDaysRemaining(m.deadline);
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => toggleMilestone(p.id, m.id)}
                        className="w-5 h-5 rounded"
                      />
                      <span className={`flex-1 ${m.completed ? 'line-through text-gray-400' : ''}`}>{m.name}</span>
                      <span className={`text-sm ${milestoneDays < 0 ? 'text-red-600' : milestoneDays < 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {m.deadline}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {progress.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">✍️</p>
          <p>暂无写作进度</p>
          <button onClick={() => setShowAddModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">添加论文</button>
        </div>
      )}

      {showAddModal && <AddModal onAdd={(p) => { setProgress([...progress, { ...p, id: Date.now().toString() }]); setShowAddModal(false); }} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddModal({ onAdd, onClose }: { onAdd: (p: Omit<WritingProgress, 'id'>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ paperTitle: '', submissionDeadline: '', milestones: [] as Milestone[] });
  const [newMilestone, setNewMilestone] = useState('');

  const addMilestone = () => {
    if (newMilestone) {
      setForm({ ...form, milestones: [...form.milestones, { id: Date.now().toString(), name: newMilestone, deadline: form.submissionDeadline, completed: false }] });
      setNewMilestone('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">添加写作进度</h2>
        <div className="space-y-4">
          <input type="text" placeholder="论文标题" value={form.paperTitle} onChange={e => setForm({...form, paperTitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          <input type="date" value={form.submissionDeadline} onChange={e => setForm({...form, submissionDeadline: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex gap-2">
            <input type="text" placeholder="添加里程碑" value={newMilestone} onChange={e => setNewMilestone(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
            <button onClick={addMilestone} className="px-4 py-2 bg-gray-200 rounded-lg">+</button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">取消</button>
            <button onClick={() => form.paperTitle && form.submissionDeadline && onAdd(form)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">添加</button>
          </div>
        </div>
      </div>
    </div>
  );
}
