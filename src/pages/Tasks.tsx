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
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListTodo className="h-6 w-6" />
          <h1 className="text-2xl font-bold">任务管理</h1>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          添加任务
        </Button>
      </div>

      <div className="mb-6">
        <FilterTabs
          options={filterOptions}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingTask ? '编辑任务' : '添加新任务'}</CardTitle>
          </CardHeader>
          <CardContent>
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

      <TaskList
        tasks={filteredTasks}
        onToggle={toggleTaskStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="暂无任务"
      />

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
