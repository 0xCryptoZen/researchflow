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
    { icon: BookOpen, title: '收藏论文', count: stats.papersCount, link: '/papers', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: ListTodo, title: '待办任务', count: stats.tasksCount - stats.completedTasksCount, link: '/tasks', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Calendar, title: '目标会议', count: stats.conferencesCount, link: '/conferences', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Send, title: '投稿中', count: stats.submissionsCount, link: '/submissions', color: 'text-orange-600', bg: 'bg-orange-50' },
  ], [stats]);

  const getSyncStatusText = () => {
    if (syncStatus.pending) return '🔄 同步中...';
    if (syncStatus.isCloudMode) return '☁️ 云端同步';
    if (syncStatus.lastSync) return '✅ 本地已同步';
    return '⚠️ 未同步';
  };

  const getSyncButtonText = () => {
    if (syncStatus.pending) return '同步中...';
    return syncStatus.isCloudMode ? '云端同步' : '立即同步';
  };

  return (
    <div className="space-y-6">
      {/* 同步状态 */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {syncStatus.isCloudMode ? (
            <Cloud className="h-5 w-5 text-emerald-600" />
          ) : (
            <CloudOff className="h-5 w-5 text-muted-foreground" />
          )}
          <span className={`text-sm ${syncStatus.isCloudMode ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {getSyncStatusText()}
          </span>
          {syncStatus.lastSync && (
            <span className="text-xs text-muted-foreground">
              上次: {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          )}
          {syncStatus.error && (
            <span className="text-xs text-red-500">
              错误: {syncStatus.error}
            </span>
          )}
        </div>
        <Button 
          onClick={triggerSync}
          disabled={syncStatus.pending}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.pending ? 'animate-spin' : ''}`} />
          {getSyncButtonText()}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.link}
            to={stat.link}
            className="block"
          >
            <StatCard
              title={stat.title}
              value={stat.count}
              icon={stat.icon}
              className="hover:shadow-md transition-shadow"
            />
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: '论文检索', link: '/papers', emoji: '📚' },
          { title: '任务管理', link: '/tasks', emoji: '📝' },
          { title: '会议追踪', link: '/conferences', emoji: '📅' },
          { title: '论文投稿', link: '/submissions', emoji: '📤' },
        ].map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border hover:border-primary hover:bg-muted/50 transition-all"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="font-medium">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
