import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { papersRepository } from '@/repositories/papersRepository';
import { conferencesRepository } from '@/repositories/conferencesRepository';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterTabs } from '@/components/common';
import { TaskForm, TaskList } from '@/components/tasks';
import { ConfirmDialog } from '@/components/common';
import { Plus, ListTodo } from 'lucide-react';
import type { Task } from '@/types';

export default function Tasks() {
  const {
    filteredTasks,
    filter,
    setFilter,
    form,
    setForm,
    resetForm,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    filterOptions,
    isFormValid,
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const papers = papersRepository.getAll().map(p => ({ id: p.id, title: p.title }));
  const conferences = conferencesRepository.getAll().map(c => ({ id: c.id, name: c.name }));

  const handleSubmit = () => {
    if (editingTask) {
      updateTask(editingTask.id, {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        relatedPaperId: form.relatedPaperId || undefined,
        relatedConferenceId: form.relatedConferenceId || undefined,
      });
      setEditingTask(null);
    } else {
      addTask();
    }
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
      relatedPaperId: task.relatedPaperId || '',
      relatedConferenceId: task.relatedConferenceId || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setEditingTask(null);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteTask(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.1)] flex items-center justify-center">
            <ListTodo className="h-4 w-4 text-[#34D399]" />
          </div>
          <h1 className="text-lg font-semibold text-[#EDEDEF]">任务管理</h1>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm} size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          添加任务
        </Button>
      </div>

      {/* 筛选标签 */}
      <div className="mb-4">
        <FilterTabs
          options={filterOptions}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <Card className="mb-4 animate-scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{editingTask ? '编辑任务' : '添加新任务'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TaskForm
              form={form}
              papers={papers}
              conferences={conferences}
              isEditing={!!editingTask}
              onChange={setForm}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      {/* 任务列表 */}
      <TaskList
        tasks={filteredTasks}
        onToggle={toggleTaskStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="暂无任务"
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="删除任务"
        description="确定要删除这个任务吗？此操作无法撤销。"
        confirmLabel="删除"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
