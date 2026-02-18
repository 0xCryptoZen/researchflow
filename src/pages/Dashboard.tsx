import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/common';
import { BookOpen, ListTodo, Calendar, Send, Cloud, CloudOff, RefreshCw } from 'lucide-react';

interface StatCardData {
  icon: typeof BookOpen;
  title: string;
  count: number;
  link: string;
  color: string;
  bg: string;
}

export default function Dashboard() {
  const { stats, syncStatus, triggerSync } = useDashboardData();

  const statCards = useMemo<StatCardData[]>(() => [
    { icon: BookOpen, title: '收藏论文', count: stats.papersCount, link: '/papers', color: 'text-[#A5B4FC]', bg: 'bg-[rgba(94,106,210,0.1)]' },
    { icon: ListTodo, title: '待办任务', count: stats.tasksCount - stats.completedTasksCount, link: '/tasks', color: 'text-[#34D399]', bg: 'bg-[rgba(16,185,129,0.1)]' },
    { icon: Calendar, title: '目标会议', count: stats.conferencesCount, link: '/conferences', color: 'text-[#FBBF24]', bg: 'bg-[rgba(245,158,11,0.1)]' },
    { icon: Send, title: '投稿中', count: stats.submissionsCount, link: '/submissions', color: 'text-[#FB7185]', bg: 'bg-[rgba(244,63,94,0.1)]' },
  ], [stats]);

  const getSyncStatusText = () => {
    if (syncStatus.pending) return '同步中...';
    if (syncStatus.isCloudMode) return '云端同步';
    if (syncStatus.lastSync) return '本地已同步';
    return '未同步';
  };

  const getSyncButtonText = () => {
    if (syncStatus.pending) return '同步中...';
    return syncStatus.isCloudMode ? '云端同步' : '立即同步';
  };

  return (
    <div className="space-y-4">
      {/* 同步状态 - Linear 风格 */}
      <div className="bg-[#18181B] rounded-xl border border-[rgba(255,255,255,0.06)] p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {syncStatus.isCloudMode ? (
            <Cloud className="h-4 w-4 text-[#34D399]" />
          ) : (
            <CloudOff className="h-4 w-4 text-[#71717A]" />
          )}
          <span className={`text-[13px] ${syncStatus.isCloudMode ? 'text-[#34D399]' : 'text-[#71717A]'}`}>
            {getSyncStatusText()}
          </span>
          {syncStatus.lastSync && (
            <span className="text-[11px] text-[#52525B]">
              上次: {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          )}
          {syncStatus.error && (
            <span className="text-[11px] text-[#FB7185]">
              错误: {syncStatus.error}
            </span>
          )}
        </div>
        <Button 
          onClick={triggerSync}
          disabled={syncStatus.pending}
          size="sm"
          variant="secondary"
          className="h-7 text-[12px]"
        >
          <RefreshCw className={`h-3 w-3 mr-1.5 ${syncStatus.pending ? 'animate-spin' : ''}`} />
          {getSyncButtonText()}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, idx) => (
          <Link
            key={stat.link}
            to={stat.link}
            className="block animate-fade-in-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <StatCard
              title={stat.title}
              value={stat.count}
              icon={stat.icon}
              className="hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1A1A1E] transition-all duration-200"
            />
          </Link>
        ))}
      </div>

      {/* Quick Links - Linear 风格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: '论文检索', link: '/papers/search', emoji: '📚' },
          { title: '任务管理', link: '/tasks', emoji: '📝' },
          { title: '会议追踪', link: '/conferences', emoji: '📅' },
          { title: '论文投稿', link: '/submissions', emoji: '📤' },
        ].map((item, idx) => (
          <Link
            key={item.link}
            to={item.link}
            className="flex items-center justify-center gap-2 py-3 bg-[#18181B] rounded-xl border border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)] hover:bg-[#1A1A1E] transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${(idx + 4) * 50}ms` }}
          >
            <span className="text-lg opacity-70">{item.emoji}</span>
            <span className="text-[13px] font-medium text-[#A1A1AA]">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
