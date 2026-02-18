import { type TaskFormData, type TaskPriority } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskFormProps {
  form: TaskFormData;
  papers: { id: string; title: string }[];
  conferences: { id: string; name: string }[];
  isEditing: boolean;
  onChange: (updates: Partial<TaskFormData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

export function TaskForm({
  form,
  papers,
  conferences,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.trim()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="任务标题 *"
        value={form.title}
        onChange={e => onChange({ title: e.target.value })}
        required
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
          onValueChange={(value) => onChange({ priority: value as TaskPriority })}
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
              <SelectItem key={p.id} value={p.id}>
                {p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title}
              </SelectItem>
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
              <SelectItem key={c.id} value={c.id}>
                {c.shortName || c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!form.title.trim()}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isEditing ? '保存' : '添加'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
