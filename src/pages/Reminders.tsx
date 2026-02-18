import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  type NotificationSettings 
} from '../services/notifications';

interface Reminder {
  id: string;
  type: 'paper' | 'conference' | 'task' | 'custom';
  title: string;
  description: string;
  date: string;
  time: string;
  enabled: boolean;
  notifyVia: ('email' | 'feishu' | 'telegram')[];
}

const defaultReminders: Reminder[] = [
  {
    id: '1',
    type: 'conference',
    title: '会议截稿提醒',
    description: 'IEEE S&P 2026 截稿日期临近',
    date: '2026-03-01',
    time: '09:00',
    enabled: true,
    notifyVia: ['email', 'feishu'],
  },
  {
    id: '2',
    type: 'paper',
    title: '每日论文推荐',
    description: '基于您的研究领域推荐新论文',
    date: '2026-02-17',
    time: '08:00',
    enabled: true,
    notifyVia: ['email'],
  },
  {
    id: '3',
    type: 'task',
    title: '任务截止提醒',
    description: '阅读论文 "Understanding..."',
    date: '2026-02-20',
    time: '10:00',
    enabled: false,
    notifyVia: ['telegram'],
  },
];

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    return readJSON<Reminder[]>(STORAGE_KEYS.REMINDERS, defaultReminders);
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => 
    getNotificationSettings()
  );

  useEffect(() => {
    writeJSON(STORAGE_KEYS.REMINDERS, reminders);
  }, [reminders]);

  // Save notification settings
  const handleSaveSettings = (settings: NotificationSettings) => {
    saveNotificationSettings(settings);
    setNotificationSettings(settings);
    setShowSettings(false);
  };

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'paper': return '📄';
      case 'conference': return '📅';
      case 'task': return '✅';
      case 'custom': return '🔔';
    }
  };

  const getTypeColor = (type: Reminder['type']) => {
    switch (type) {
      case 'paper': return 'bg-blue-100 text-blue-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      case 'task': return 'bg-green-100 text-green-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleSave = (reminder: Reminder) => {
    if (editingReminder) {
      setReminders(reminders.map(r => r.id === reminder.id ? reminder : r));
    } else {
      setReminders([...reminders, { ...reminder, id: Date.now().toString() }]);
    }
    setShowAddModal(false);
    setEditingReminder(null);
  };

  const enabledCount = reminders.filter(r => r.enabled).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">提醒设置</h1>
          <p className="text-gray-600 mt-1">
            已启用 {enabledCount} 个提醒
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span> 添加提醒
        </button>
      </div>

      {/* 提醒列表 */}
      <div className="space-y-4">
        {reminders.map(reminder => (
          <div
            key={reminder.id}
            className={`bg-white rounded-lg border p-4 transition-opacity ${
              reminder.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getTypeIcon(reminder.type)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(reminder.type)}`}>
                      {reminder.type === 'paper' ? '论文' : 
                       reminder.type === 'conference' ? '会议' : 
                       reminder.type === 'task' ? '任务' : '自定义'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{reminder.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>📅 {reminder.date} {reminder.time}</span>
                    <span>
                      {reminder.notifyVia.map(n => 
                        n === 'email' ? '📧' : n === 'feishu' ? '📱' : '✈️'
                      ).join(' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingReminder(reminder);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  🗑️
                </button>
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    reminder.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    reminder.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reminders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">🔔</p>
          <p>暂无提醒设置</p>
          <p className="text-sm mt-2">点击上方按钮添加新提醒</p>
        </div>
      )}

      {/* 添加/编辑提醒弹窗 */}
      {showAddModal && (
        <ReminderModal
          reminder={editingReminder}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingReminder(null);
          }}
        />
      )}

      {/* 快捷设置 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">通知渠道设置</h3>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            高级设置 →
          </button>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={notificationSettings.enabledChannels.includes('email')}
              onChange={(e) => {
                const channels = [...notificationSettings.enabledChannels];
                if (e.target.checked && !channels.includes('email')) {
                  channels.push('email');
                } else if (!e.target.checked) {
                  const idx = channels.indexOf('email');
                  if (idx > -1) channels.splice(idx, 1);
                }
                handleSaveSettings({ ...notificationSettings, enabledChannels: channels });
              }}
              className="rounded" 
            />
            <span>📧 邮件通知</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={notificationSettings.enabledChannels.includes('feishu')}
              onChange={(e) => {
                const channels = [...notificationSettings.enabledChannels];
                if (e.target.checked && !channels.includes('feishu')) {
                  channels.push('feishu');
                } else if (!e.target.checked) {
                  const idx = channels.indexOf('feishu');
                  if (idx > -1) channels.splice(idx, 1);
                }
                handleSaveSettings({ ...notificationSettings, enabledChannels: channels });
              }}
              className="rounded" 
            />
            <span>📱 飞书通知</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={notificationSettings.enabledChannels.includes('telegram')}
              onChange={(e) => {
                const channels = [...notificationSettings.enabledChannels];
                if (e.target.checked && !channels.includes('telegram')) {
                  channels.push('telegram');
                } else if (!e.target.checked) {
                  const idx = channels.indexOf('telegram');
                  if (idx > -1) channels.splice(idx, 1);
                }
                handleSaveSettings({ ...notificationSettings, enabledChannels: channels });
              }}
              className="rounded" 
            />
            <span>✈️ Telegram</span>
          </label>
        </div>
      </div>

      {/* 高级设置弹窗 */}
      {showSettings && (
        <NotificationSettingsModal
          settings={notificationSettings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function ReminderModal({ 
  reminder, 
  onSave, 
  onClose 
}: { 
  reminder: Reminder | null;
  onSave: (r: Reminder) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Reminder>>(
    reminder || {
      type: 'custom',
      title: '',
      description: '',
      date: '',
      time: '09:00',
      enabled: true,
      notifyVia: ['email'],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.date) {
      onSave({
        id: reminder?.id || Date.now().toString(),
        type: formData.type || 'custom',
        title: formData.title || '',
        description: formData.description || '',
        date: formData.date || '',
        time: formData.time || '09:00',
        enabled: formData.enabled ?? true,
        notifyVia: formData.notifyVia || ['email'],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {reminder ? '编辑提醒' : '添加提醒'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              提醒类型
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as Reminder['type']})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="paper">📄 论文推荐</option>
              <option value="conference">📅 会议截稿</option>
              <option value="task">✅ 任务提醒</option>
              <option value="custom">🔔 自定义</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="提醒标题"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="提醒描述"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                时间
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通知方式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyVia?.includes('email')}
                  onChange={e => {
                    const notify = formData.notifyVia || [];
                    setFormData({
                      ...formData,
                      notifyVia: e.target.checked 
                        ? [...notify, 'email']
                        : notify.filter(n => n !== 'email')
                    });
                  }}
                />
                <span>📧 邮件</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyVia?.includes('feishu')}
                  onChange={e => {
                    const notify = formData.notifyVia || [];
                    setFormData({
                      ...formData,
                      notifyVia: e.target.checked 
                        ? [...notify, 'feishu']
                        : notify.filter(n => n !== 'feishu')
                    });
                  }}
                />
                <span>📱 飞书</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyVia?.includes('telegram')}
                  onChange={e => {
                    const notify = formData.notifyVia || [];
                    setFormData({
                      ...formData,
                      notifyVia: e.target.checked 
                        ? [...notify, 'telegram']
                        : notify.filter(n => n !== 'telegram')
                    });
                  }}
                />
                <span>✈️ Telegram</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificationSettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: NotificationSettings;
  onSave: (s: NotificationSettings) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<NotificationSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">通知设置</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📧 邮件地址
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="your@email.com"
            />
          </div>

          {/* Feishu Webhook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 飞书 Webhook URL
            </label>
            <input
              type="url"
              value={formData.feishuWebhook}
              onChange={e => setFormData({ ...formData, feishuWebhook: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
            />
            <p className="text-xs text-gray-500 mt-1">
              在飞书群设置中添加自定义机器人获取 Webhook 地址
            </p>
          </div>

          {/* Telegram */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ✈️ Telegram Bot Token
              </label>
              <input
                type="text"
                value={formData.telegramBotToken}
                onChange={e => setFormData({ ...formData, telegramBotToken: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ✉️ Telegram Chat ID
              </label>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={e => setFormData({ ...formData, telegramChatId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="123456789"
              />
            </div>
          </div>

          {/* Reminder Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔔 提前提醒天数
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 7, 14, 30].map(days => (
                <label key={days} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminderDays.includes(days)}
                    onChange={e => {
                      const days_list = [...formData.reminderDays];
                      if (e.target.checked && !days_list.includes(days)) {
                        days_list.push(days);
                      } else if (!e.target.checked) {
                        const idx = days_list.indexOf(days);
                        if (idx > -1) days_list.splice(idx, 1);
                      }
                      setFormData({ ...formData, reminderDays: days_list });
                    }}
                    className="rounded"
                  />
                  <span>{days}天</span>
                </label>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              启用渠道
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enabledChannels.includes('email')}
                  onChange={e => {
                    const channels = [...formData.enabledChannels];
                    if (e.target.checked && !channels.includes('email')) {
                      channels.push('email');
                    } else if (!e.target.checked) {
                      const idx = channels.indexOf('email');
                      if (idx > -1) channels.splice(idx, 1);
                    }
                    setFormData({ ...formData, enabledChannels: channels });
                  }}
                />
                <span>📧 邮件</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enabledChannels.includes('feishu')}
                  onChange={e => {
                    const channels = [...formData.enabledChannels];
                    if (e.target.checked && !channels.includes('feishu')) {
                      channels.push('feishu');
                    } else if (!e.target.checked) {
                      const idx = channels.indexOf('feishu');
                      if (idx > -1) channels.splice(idx, 1);
                    }
                    setFormData({ ...formData, enabledChannels: channels });
                  }}
                />
                <span>📱 飞书</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enabledChannels.includes('telegram')}
                  onChange={e => {
                    const channels = [...formData.enabledChannels];
                    if (e.target.checked && !channels.includes('telegram')) {
                      channels.push('telegram');
                    } else if (!e.target.checked) {
                      const idx = channels.indexOf('telegram');
                      if (idx > -1) channels.splice(idx, 1);
                    }
                    setFormData({ ...formData, enabledChannels: channels });
                  }}
                />
                <span>✈️ Telegram</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
