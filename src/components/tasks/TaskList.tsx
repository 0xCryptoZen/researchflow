import { type Task } from '@/types';
import { TaskItem } from './TaskItem';
import { EmptyState } from '@/components/common';
import { FileText } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  emptyMessage = '暂无任务',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyMessage}
        description="点击上方按钮添加新任务"
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
