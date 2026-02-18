import { useState, useEffect, useMemo, useCallback } from 'react';
import { type Task, tasksRepository } from '../repositories/tasksRepository';
import { papersRepository } from '../repositories/papersRepository';
import { conferencesRepository } from '../repositories/conferencesRepository';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Constants ---

type FilterValue = 'all' | Task['status'];

const FILTER_LABELS: Record<FilterValue, string> = {
  all: '全部',
  todo: '待办',
  'in-progress': '进行中',
  completed: '已完成',
};

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_OPTIONS: { value: Task['priority']; label: string }[] = [
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800',
  low: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800',
};

const STATUS_COLORS: Record<Task['status'], string> = {
  completed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100',
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

const FILTERS: FilterValue[] = ['all', 'todo', 'in-progress', 'completed'];

type TaskFormData = {
  title: string;
  description: string;
  priority: Task['priority'];
  dueDate: string;
  relatedPaperId: string;
  relatedConferenceId: string;
};

const EMPTY_FORM: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  relatedPaperId: '',
  relatedConferenceId: '',
};

// --- Subcomponents ---

function TaskFilters({ filter, onFilterChange }: {
  filter: FilterValue;
  onFilterChange: (f: FilterValue) => void;
}) {
  return (
    <div className="flex gap-2">
      {FILTERS.map(f => (
        <Button
          key={f}
          variant={filter === f ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(f)}
        >
          {FILTER_LABELS[f]}
        </Button>
      ))}
    </div>
  );
}

function TaskForm({ form, papers, conferences, isEditing, onChange, onSubmit, onCancel }: {
  form: TaskFormData;
  papers: { id: string; title: string }[];
  conferences: { id: string; name: string }[];
  isEditing: boolean;
  onChange: (updates: Partial<TaskFormData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">{isEditing ? '编辑任务' : '添加新任务'}</h3>
      <div className="space-y-3">
        <Input
          placeholder="任务标题"
          value={form.title}
          onChange={e => onChange({ title: e.target.value })}
        />
        <Textarea
          placeholder="任务描述（可选）"
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
          rows={2}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={form.priority}
            onValueChange={(value) => onChange({ priority: value as Task['priority'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择优先级" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={form.dueDate}
            onChange={e => onChange({ dueDate: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={form.relatedPaperId}
            onValueChange={(value) => onChange({ relatedPaperId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="关联论文（可选）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">无</SelectItem>
              {papers.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title.substring(0, 30)}...</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.relatedConferenceId}
            onValueChange={(value) => onChange({ relatedConferenceId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="关联会议（可选）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">无</SelectItem>
              {conferences.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit}>
            {isEditing ? '保存' : '添加'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TaskCard({ task, paperTitle, conferenceName, onToggleComplete, onStartTask, onEdit, onDelete }: {
  task: Task;
  paperTitle: string | null;
  conferenceName: string | null;
  onToggleComplete: () => void;
  onStartTask: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleComplete}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm transition-colors ${
            task.status === 'completed' 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-slate-300 hover:border-green-500 dark:border-slate-600'
          }`}
        >
          {task.status === 'completed' && '✓'}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[task.priority] ?? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[task.status]}`}>
              {FILTER_LABELS[task.status]}
            </span>
          </div>

          <h3 className={`font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-foreground'}`}>
            {task.title}
          </h3>

          {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}

          <div className="flex gap-3 mt-2">
            {task.relatedPaperId && paperTitle && (
              <a href={`/papers?paper=${task.relatedPaperId}`} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                📄 {paperTitle.substring(0, 25)}...
              </a>
            )}
            {task.relatedConferenceId && conferenceName && (
              <a href={`/conferences?conf=${task.relatedConferenceId}`} className="text-xs text-purple-600 hover:underline dark:text-purple-400">
                📅 {conferenceName}
              </a>
            )}
          </div>

          {task.dueDate && <p className="text-sm text-muted-foreground mt-2">截止: {task.dueDate}</p>}
        </div>

        <div className="flex gap-1">
          {task.status !== 'completed' && task.status !== 'in-progress' && (
            <Button variant="ghost" size="icon" onClick={onStartTask} title="开始任务">▶</Button>
          )}
          <Button variant="ghost" size="icon" onClick={onEdit} title="编辑">✏️</Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="删除">🗑</Button>
        </div>
      </div>
    </Card>
  );
}

// --- Main component ---

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<TaskFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(() => {
    try {
      setTasks(tasksRepository.getAll());
      setError(null);
    } catch (e) {
      setError('加载任务失败，请刷新页面重试');
      console.error('Failed to load tasks:', e);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const papers = useMemo(() => {
    try {
      return papersRepository.getAll().map(p => ({ id: p.id, title: p.title }));
    } catch {
      return [];
    }
  }, [tasks]);

  const conferences = useMemo(() => {
    try {
      return conferencesRepository.getAll().map(c => ({ id: c.id, name: c.name }));
    } catch {
      return [];
    }
  }, [tasks]);

  const paperTitleMap = useMemo(() => new Map(papers.map(p => [p.id, p.title])), [papers]);
  const conferenceNameMap = useMemo(() => new Map(conferences.map(c => [c.id, c.name])), [conferences]);

  const formData: TaskFormData = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        dueDate: editingTask.dueDate ?? '',
        relatedPaperId: editingTask.relatedPaperId ?? '',
        relatedConferenceId: editingTask.relatedConferenceId ?? '',
      }
    : newTask;

  const handleFormChange = useCallback((updates: Partial<TaskFormData>) => {
    if (editingTask) {
      setEditingTask(prev => prev ? { ...prev, ...updates } as Task : prev);
    } else {
      setNewTask(prev => ({ ...prev, ...updates }));
    }
  }, [editingTask]);

  const handleSubmit = useCallback(() => {
    const data = editingTask ?? newTask;
    if (!data.title.trim()) return;

    try {
      const payload = {
        title: data.title,
        description: ('description' in data ? data.description : '') || undefined,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
        relatedPaperId: data.relatedPaperId || undefined,
        relatedConferenceId: data.relatedConferenceId || undefined,
      };

      if (editingTask) {
        tasksRepository.update(editingTask.id, payload);
        setEditingTask(null);
      } else {
        tasksRepository.add(payload);
        setShowAddForm(false);
        setNewTask(EMPTY_FORM);
      }
      loadTasks();
    } catch (e) {
      setError(editingTask ? '更新任务失败' : '添加任务失败');
      console.error('Failed to save task:', e);
    }
  }, [editingTask, newTask, loadTasks]);

  const handleCancel = useCallback(() => {
    if (editingTask) {
      setEditingTask(null);
    } else {
      setShowAddForm(false);
      setNewTask(EMPTY_FORM);
    }
  }, [editingTask]);

  const handleUpdateStatus = useCallback((id: string, status: Task['status']) => {
    try {
      tasksRepository.updateStatus(id, status);
      loadTasks();
    } catch (e) {
      setError('更新状态失败');
      console.error('Failed to update task status:', e);
    }
  }, [loadTasks]);

  const handleDelete = useCallback((id: string) => {
    if (!window.confirm('确定要删除此任务吗？')) return;
    try {
      tasksRepository.deleteById(id);
      loadTasks();
    } catch (e) {
      setError('删除任务失败');
      console.error('Failed to delete task:', e);
    }
  }, [loadTasks]);

  const sortedTasks = useMemo(() => {
    const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
    return [...filtered].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [tasks, filter]);

  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center dark:bg-red-900 dark:text-red-100 dark:border-red-800">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>×</Button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">任务管理</h1>
          <p className="text-muted-foreground">{tasks.length} 个任务 · {completedCount} 已完成</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
        >
          + 添加任务
        </Button>
      </div>

      <TaskFilters filter={filter} onFilterChange={setFilter} />

      {(showAddForm || editingTask) && (
        <TaskForm
          form={formData}
          papers={papers}
          conferences={conferences}
          isEditing={!!editingTask}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无任务</div>
        ) : (
          sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              paperTitle={paperTitleMap.get(task.relatedPaperId ?? '') ?? null}
              conferenceName={conferenceNameMap.get(task.relatedConferenceId ?? '') ?? null}
              onToggleComplete={() => handleUpdateStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}
              onStartTask={() => handleUpdateStatus(task.id, 'in-progress')}
              onEdit={() => setEditingTask(task)}
              onDelete={() => handleDelete(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
