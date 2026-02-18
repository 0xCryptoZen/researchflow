import { type Task } from '@/types';
import { cn } from '@/lib/utils';
import { StatusBadge, PriorityBadge, PRIORITY_COLORS, STATUS_COLORS } from '@/components/common';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  formatDate?: (date: string) => string;
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  formatDate = (d) => d,
}: TaskItemProps) {
  const toggleIcon = task.status === 'completed' 
    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
    : task.status === 'in-progress'
      ? <Clock className="h-5 w-5 text-blue-500" />
      : <Circle className="h-5 w-5 text-muted-foreground" />;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border bg-card transition-all',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label={task.status === 'completed' ? '标记为未完成' : '标记为完成'}
      >
        {toggleIcon}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4
            className={cn(
              'font-medium truncate',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h4>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <span>截止: {formatDate(task.dueDate)}</span>
          )}
          <span>创建于: {formatDate(task.createdAt)}</span>
        </div>
      </div>
      
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          aria-label="编辑"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted transition-colors"
          aria-label="删除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/>
            <line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
