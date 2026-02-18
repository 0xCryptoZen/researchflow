/**
 * Tasks Management Hook
 * 任务管理钩子
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { tasksRepository, type Task } from '@/repositories/tasksRepository';
import { writeJSON } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/storage';
import type { TaskStatus, TaskPriority, FilterOption, TaskFormData } from '@/types';

type TaskFilterValue = 'all' | TaskStatus;

const FILTER_OPTIONS: FilterOption<TaskFilterValue>[] = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待办' },
  { value: 'in-progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

const EMPTY_FORM: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  relatedPaperId: '',
  relatedConferenceId: '',
};

interface UseTasksResult {
  // Data
  tasks: Task[];
  filteredTasks: Task[];
  
  // Filter state
  filter: TaskFilterValue;
  setFilter: (filter: TaskFilterValue) => void;
  
  // Form state
  form: TaskFormData;
  setForm: (updates: Partial<TaskFormData>) => void;
  resetForm: () => void;
  
  // Actions
  addTask: () => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  
  // Options
  filterOptions: FilterOption<TaskFilterValue>[];
  priorityOptions: { value: TaskPriority; label: string }[];
  
  // UI state
  isFormValid: boolean;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>(() => tasksRepository.getAll());
  const [filter, setFilter] = useState<TaskFilterValue>('all');
  const [form, setFormState] = useState<TaskFormData>(EMPTY_FORM);

  // Persist tasks to storage
  useEffect(() => {
    writeJSON(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Apply filter
    if (filter !== 'all') {
      result = result.filter(t => t.status === filter);
    }
    
    // Sort by priority then by creation date
    result.sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return result;
  }, [tasks, filter]);

  // Form helpers
  const setForm = useCallback((updates: Partial<TaskFormData>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(EMPTY_FORM);
  }, []);

  // CRUD operations
  const addTask = useCallback(() => {
    if (!form.title.trim()) return;
    
    const newTask = tasksRepository.add({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      relatedPaperId: form.relatedPaperId || undefined,
      relatedConferenceId: form.relatedConferenceId || undefined,
    });
    
    setTasks(prev => [newTask, ...prev]);
    resetForm();
  }, [form, resetForm]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    tasksRepository.update(id, updates);
    setTasks(tasksRepository.getAll());
  }, []);

  const deleteTask = useCallback((id: string) => {
    tasksRepository.delete(id);
    setTasks(tasksRepository.getAll());
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    const task = tasksRepository.getById(id);
    if (!task) return;
    
    const newStatus: TaskStatus = task.status === 'completed' 
      ? 'todo' 
      : task.status === 'todo' 
        ? 'in-progress' 
        : 'completed';
    
    const updates: Partial<Task> = { 
      status: newStatus,
      ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {}),
    };
    
    tasksRepository.update(id, updates);
    setTasks(tasksRepository.getAll());
  }, []);

  const isFormValid = form.title.trim().length > 0;

  return {
    tasks,
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
    filterOptions: FILTER_OPTIONS,
    priorityOptions: PRIORITY_OPTIONS,
    isFormValid,
  };
}

export default useTasks;
