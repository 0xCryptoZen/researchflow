import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { papersRepository } from '../repositories/papersRepository';
import { tasksRepository } from '../repositories/tasksRepository';
import { conferencesRepository } from '../repositories/conferencesRepository';
import { submissionsRepository } from '../repositories/submissionsRepository';
import { STORAGE_UPDATED_EVENT } from '../services/storage';

const SYNC_STATUS_KEY = 'researchflow_sync_status';

interface SyncStatus {
  lastSync: string | null;
  pending: boolean;
  error: string | null;
}

export default function Dashboard() {
  const [papers, setPapers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    const saved = localStorage.getItem(SYNC_STATUS_KEY);
    return saved ? JSON.parse(saved) : { lastSync: null, pending: false, error: null };
  });

  const loadDashboardData = useCallback(() => {
    setPapers(papersRepository.getAll());
    setTasks(tasksRepository.getAll());
    setConferences(conferencesRepository.getAll());
    setSubmissions(submissionsRepository.getAll());
    
    const saved = localStorage.getItem(SYNC_STATUS_KEY);
    if (saved) setSyncStatus(JSON.parse(saved));
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleStorageUpdated = () => loadDashboardData();
    const handleFocus = () => loadDashboardData();

    window.addEventListener(STORAGE_UPDATED_EVENT, handleStorageUpdated);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener(STORAGE_UPDATED_EVENT, handleStorageUpdated);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadDashboardData]);

  const upcomingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5);
  const recentPapers = papers.slice(0, 5);
  const urgentConferences = conferences.filter(c => {
    const days = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days < 30;
  }).slice(0, 5);

  const statCards = [
    { icon: '📚', title: '收藏论文', count: papers.length, link: '/papers', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: '📝', title: '待办任务', count: tasks.filter(t => t.status !== 'completed').length, link: '/tasks', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: '📅', title: '目标会议', count: conferences.length, link: '/conferences', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: '📤', title: '投稿中', count: submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length, link: '/submissions', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getStatusTag = (status: string, priority?: string) => {
    const styles: Record<string, string> = {
      high: 'bg-amber-100 text-amber-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-slate-100 text-slate-600',
      reviewing: 'bg-amber-100 text-amber-700',
      accepted: 'bg-emerald-100 text-emerald-700',
      revising: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-violet-100 text-violet-700',
      draft: 'bg-slate-100 text-slate-600',
    };
    return priority ? styles[priority] || styles.draft : styles[status] || styles.draft;
  };

  return (
    <div className="space-y-6">
      {/* 同步状态 */}
      <div className="bg-white rounded-xl border border-[#E8DFD5] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {syncStatus.pending ? (
            <span className="text-sm text-violet-600">🔄 同步中...</span>
          ) : syncStatus.lastSync ? (
            <span className="text-sm text-emerald-600">✅ 数据已同步</span>
          ) : (
            <span className="text-sm text-[#9A8677]">⚠️ 未同步</span>
          )}
          {syncStatus.lastSync && (
            <span className="text-xs text-[#9A8677]">
              上次: {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          )}
        </div>
        <button 
          onClick={() => {
            setSyncStatus(s => ({ ...s, pending: true }));
            setTimeout(() => setSyncStatus({ lastSync: new Date().toISOString(), pending: false, error: null }), 1000);
          }}
          className="px-4 py-1.5 bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {syncStatus.pending ? '同步中...' : '立即同步'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Link
            key={idx}
            to={stat.link}
            className="bg-white rounded-xl border border-[#E8DFD5] p-5 hover:border-[#8B5A2B]/30 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color} font-serif`}>{stat.count}</div>
                <div className="text-xs text-[#9A8677]">{stat.title}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 最近收藏 */}
        <div className="bg-white rounded-xl border border-[#E8DFD5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-[#2C1810]">📚 最近收藏</h3>
            <Link to="/papers" className="text-sm text-[#8B5A2B] hover:underline">查看全部 →</Link>
          </div>
          {recentPapers.length > 0 ? (
            <div className="space-y-3">
              {recentPapers.map((paper: any) => (
                <div key={paper.id} className="p-3 bg-[#FAF6F1] rounded-lg hover:bg-[#F5EDE3] transition-colors cursor-pointer">
                  <div className="font-medium text-sm text-[#2C1810] line-clamp-1">{paper.title}</div>
                  <div className="text-xs text-[#9A8677] mt-1 truncate">{paper.authors?.join(', ')}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#9A8677] text-sm">暂无收藏论文</div>
          )}
        </div>

        {/* 待办任务 */}
        <div className="bg-white rounded-xl border border-[#E8DFD5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-[#2C1810]">📝 待办任务</h3>
            <Link to="/tasks" className="text-sm text-[#8B5A2B] hover:underline">查看全部 →</Link>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-[#FAF6F1] rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-[#2C1810] truncate">{task.title}</div>
                    <div className="text-xs text-[#9A8677]">{task.dueDate || '无截止日期'}</div>
                  </div>
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusTag(task.status, task.priority)}`}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#9A8677] text-sm">暂无待办任务</div>
          )}
        </div>

        {/* 会议截稿 */}
        <div className="bg-white rounded-xl border border-[#E8DFD5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-[#2C1810]">📅 会议截稿</h3>
            <Link to="/conferences" className="text-sm text-[#8B5A2B] hover:underline">查看全部 →</Link>
          </div>
          {urgentConferences.length > 0 ? (
            <div className="space-y-3">
              {urgentConferences.map((conf: any) => {
                const days = Math.ceil((new Date(conf.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={conf.id} className="flex items-center justify-between p-3 bg-[#FAF6F1] rounded-lg">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-[#2C1810]">{conf.name}</div>
                      <div className="text-xs text-[#9A8677]">{conf.deadline}</div>
                    </div>
                    <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium ${days < 7 ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                      {days} 天
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#9A8677] text-sm">暂无紧迫截稿</div>
          )}
        </div>

        {/* 投稿进度 */}
        <div className="bg-white rounded-xl border border-[#E8DFD5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-[#2C1810]">📤 投稿进度</h3>
            <Link to="/submissions" className="text-sm text-[#8B5A2B] hover:underline">查看全部 →</Link>
          </div>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((sub: any) => (
                <div key={sub.id} className="p-3 bg-[#FAF6F1] rounded-lg">
                  <div className="font-medium text-sm text-[#2C1810] line-clamp-1">{sub.paperTitle}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusTag(sub.status)}`}>
                      {sub.status === 'draft' ? '草稿' :
                       sub.status === 'submitted' ? '已投稿' :
                       sub.status === 'under_review' ? '审稿中' :
                       sub.status === 'accepted' ? '已接收' : '被拒稿'}
                    </span>
                    <span className="text-xs text-[#9A8677]">{sub.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#9A8677] text-sm">暂无投稿记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
