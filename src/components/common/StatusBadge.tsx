import { cn } from '@/lib/utils';
import { type TaskStatus, type TaskPriority } from '@/types';

// Priority colors mapping
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800',
  low: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800',
};

// Status colors mapping
export const STATUS_COLORS: Record<TaskStatus, string> = {
  completed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100',
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

interface StatusBadgeProps {
  status: TaskStatus;
  labels?: Record<TaskStatus, string>;
  className?: string;
}

const defaultStatusLabels: Record<TaskStatus, string> = {
  'completed': '已完成',
  'in-progress': '进行中',
  'todo': '待办',
};

export function StatusBadge({
  status,
  labels = defaultStatusLabels,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        STATUS_COLORS[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TaskPriority;
  labels?: Record<TaskPriority, string>;
  className?: string;
}

const defaultPriorityLabels: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export function PriorityBadge({
  priority,
  labels = defaultPriorityLabels,
  className,
}: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        PRIORITY_COLORS[priority],
        className
      )}
    >
      {labels[priority]}
    </span>
  );
}

export default StatusBadge;
