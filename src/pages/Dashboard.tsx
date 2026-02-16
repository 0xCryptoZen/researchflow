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
    
    // 读取同步状态
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

  const upcomingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);
  const recentPapers = papers.slice(0, 3);
  const urgentConferences = conferences.filter(c => {
    const days = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days < 30;
  }).slice(0, 3);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ResearchFlow 仪表盘</h1>

      {/* 同步状态 */}
      <div className="bg-white rounded-lg border p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {syncStatus.pending ? (
            <span className="text-blue-600">🔄 同步中...</span>
          ) : syncStatus.lastSync ? (
            <span className="text-green-600">✅ 已同步</span>
          ) : (
            <span className="text-gray-500">⚠️ 未同步</span>
          )}
          {syncStatus.lastSync && (
            <span className="text-gray-500 text-sm">上次: {new Date(syncStatus.lastSync).toLocaleString()}</span>
          )}
        </div>
        <button 
          onClick={() => {
            setSyncStatus(s => ({ ...s, pending: true }));
            setTimeout(() => setSyncStatus({ lastSync: new Date().toISOString(), pending: false, error: null }), 1000);
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={syncStatus.pending}
        >
          {syncStatus.pending ? '同步中...' : '立即同步'}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📄" title="收藏论文" count={papers.length} link="/papers" color="blue" />
        <StatCard icon="✅" title="待办任务" count={tasks.filter(t => t.status !== 'completed').length} link="/tasks" color="green" />
        <StatCard icon="📅" title="目标会议" count={conferences.length} link="/conferences" color="purple" />
        <StatCard icon="📤" title="投稿中" count={submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length} link="/submissions" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 今日推荐 */}
        <div className="bg-white rounded-lg border p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">📄 今日推荐论文</h2>
            <Link to="/papers/search" className="text-blue-600 text-sm">查看全部</Link>
          </div>
          {recentPapers.length > 0 ? (
            <div className="space-y-3">
              {recentPapers.map((paper: any) => (
                <div key={paper.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 text-sm">{paper.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{paper.authors}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无推荐</p>
          )}
        </div>

        {/* 待办任务 */}
        <div className="bg-white rounded-lg border p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">✅ 待办任务</h2>
            <Link to="/tasks" className="text-blue-600 text-sm">查看全部</Link>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task: any) => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                    <p className="text-gray-500 text-xs">{task.dueDate || '无截止日期'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无待办</p>
          )}
        </div>

        {/* 会议截稿 */}
        <div className="bg-white rounded-lg border p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">📅 会议截稿</h2>
            <Link to="/conferences" className="text-blue-600 text-sm">查看全部</Link>
          </div>
          {urgentConferences.length > 0 ? (
            <div className="space-y-3">
              {urgentConferences.map((conf: any) => {
                const days = Math.ceil((new Date(conf.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={conf.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{conf.name}</h3>
                      <p className="text-gray-500 text-xs">{conf.deadline}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${days < 7 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {days} 天
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无紧迫截稿</p>
          )}
        </div>

        {/* 投稿进度 */}
        <div className="bg-white rounded-lg border p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-sem-semibold">📤 投稿进度</h2>
            <Link to="/submissions" className="text-blue-600 text-sm">查看全部</Link>
          </div>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.slice(0, 3).map((sub: any) => (
                <div key={sub.id} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 text-sm">{sub.paperTitle}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      sub.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      sub.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      sub.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {sub.status === 'draft' ? '草稿' :
                       sub.status === 'submitted' ? '已投稿' :
                       sub.status === 'under_review' ? '审稿中' :
                       sub.status === 'accepted' ? '已接收' :
                       sub.status === 'rejected' ? '被拒稿' : '已发表'}
                    </span>
                    <span className="text-gray-500 text-xs">{sub.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无投稿</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, count, link, color }: { icon: string; title: string; count: number; link: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
  };
  
  return (
    <Link to={link} className={`block p-5 rounded-lg border ${colors[color]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </Link>
  );
}
