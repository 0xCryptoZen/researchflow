import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';
import { reminderService } from '../services/writingReminder';

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
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState('7,3,1');

  // Load reminder settings
  useEffect(() => {
    const config = reminderService.getConfig();
    setReminderEnabled(config.enabled);
    setReminderDays(config.advanceDays.join(','));
    setUpcomingReminders(reminderService.getUpcomingReminders());
  }, []);

  // Refresh upcoming reminders when progress changes
  useEffect(() => {
    setUpcomingReminders(reminderService.getUpcomingReminders());
  }, [progress]);

  const saveReminderSettings = () => {
    const days = reminderDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    reminderService.configure({
      enabled: reminderEnabled,
      advanceDays: days,
    });
    setShowReminderSettings(false);
    alert('提醒设置已保存');
  };

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
        <div className="flex gap-2">
          <button 
            onClick={() => setShowReminderSettings(true)} 
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <span>🔔</span> 提醒设置
          </button>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            ➕ 添加论文
          </button>
        </div>
      </div>

      {/* 即将到来的提醒 */}
      {upcomingReminders.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <span>🔔</span> 即将到来的提醒
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingReminders.slice(0, 6).map((reminder, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  reminder.daysRemaining <= 1 ? 'bg-red-50 border-red-200' :
                  reminder.daysRemaining <= 3 ? 'bg-orange-50 border-orange-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{reminder.paperTitle}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {reminder.type === 'milestone' ? `里程碑: ${reminder.milestoneName}` : '截稿日期'}
                </div>
                <div className={`text-sm font-medium mt-1 ${
                  reminder.daysRemaining <= 1 ? 'text-red-600' :
                  reminder.daysRemaining <= 3 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {reminder.daysRemaining} 天后
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
      
      {showReminderSettings && (
        <ReminderSettingsModal
          enabled={reminderEnabled}
          days={reminderDays}
          onSave={(enabled, days) => {
            setReminderEnabled(enabled);
            setReminderDays(days);
            saveReminderSettings();
          }}
          onClose={() => setShowReminderSettings(false)}
        />
      )}
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

function ReminderSettingsModal({
  enabled,
  days,
  onSave,
  onClose,
}: {
  enabled: boolean;
  days: string;
  onSave: (enabled: boolean, days: string) => void;
  onClose: () => void;
}) {
  const [reminderEnabled, setReminderEnabled] = useState(enabled);
  const [reminderDays, setReminderDays] = useState(days);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">🔔 写作进度提醒设置</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">启用自动提醒</span>
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                reminderEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              提前提醒天数
            </label>
            <input
              type="text"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="7,3,1"
            />
            <p className="text-xs text-gray-500 mt-1">
              多个天数用逗号分隔，如: 7,3,1 表示提前7天、3天、1天提醒
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              提醒将通过已配置的渠道发送 (Telegram/飞书/邮件)
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={() => onSave(reminderEnabled, reminderDays)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
