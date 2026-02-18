import { STORAGE_KEYS } from '../constants/storage';
import { syncService } from '../services/sync';
import { auth } from '../services/auth';
import { createListRepository } from './localRepository';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  relatedPaperId?: string;
  relatedConferenceId?: string;
  createdAt: string;
  completedAt?: string;
}

const repo = createListRepository<Task>(STORAGE_KEYS.TASKS, []);

// Helper to sync to cloud when in cloud mode
async function syncToCloud(action: 'create' | 'update' | 'delete', item?: Task) {
  const user = auth.getCurrentUser();
  if (!user?.isCloudMode) return;
  
  try {
    await syncService.pushChanges('tasks', action, item);
  } catch (error) {
    console.error('[Tasks Repo] Cloud sync failed:', error);
  }
}

export const tasksRepository = {
  getAll(): Task[] {
    return repo.getAll();
  },

  saveAll(items: Task[]): void {
    repo.saveAll(items);
  },

  add(input: Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'relatedPaperId' | 'relatedConferenceId'>): Task {
    const task: Task = {
      id: Date.now().toString(),
      title: input.title,
      description: input.description,
      status: 'todo',
      priority: input.priority,
      dueDate: input.dueDate || undefined,
      createdAt: new Date().toISOString(),
    };
    
    repo.saveAll([...repo.getAll(), task]);
    
    // Sync to cloud
    syncToCloud('create', task);
    
    return task;
  },

  updateStatus(id: string, status: Task['status']): void {
    repo.saveAll(
      repo.getAll().map((task) => {
        if (task.id !== id) return task;
        return {
          ...task,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        };
      })
    );
    
    const updated = repo.getAll().find((t) => t.id === id);
    if (updated) syncToCloud('update', updated);
  },

  update(id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'relatedPaperId' | 'relatedConferenceId'>>): void {
    repo.saveAll(
      repo.getAll().map((task) => {
        if (task.id !== id) return task;
        return { ...task, ...updates };
      })
    );
    
    const updated = repo.getAll().find((t) => t.id === id);
    if (updated) syncToCloud('update', updated);
  },

  getById(id: string): Task | undefined {
    return repo.getAll().find(t => t.id === id);
  },

  deleteById(id: string): void {
    repo.saveAll(repo.getAll().filter((task) => task.id !== id));
    syncToCloud('delete', { id } as Task);
  },

  getByStatus(status: Task['status']): Task[] {
    return repo.getAll().filter((task) => task.status === status);
  },

  getByPriority(priority: Task['priority']): Task[] {
    return repo.getAll().filter((task) => task.priority === priority);
  },

  getByDueDate(date: string): Task[] {
    return repo.getAll().filter((task) => task.dueDate === date);
  },

  getUpcoming(days: number = 7): Task[] {
    const now = Date.now();
    const future = now + days * 24 * 60 * 60 * 1000;
    
    return repo.getAll().filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false;
      const dueTime = new Date(task.dueDate).getTime();
      return dueTime >= now && dueTime <= future;
    });
  },

  getOverdue(): Task[] {
    const now = Date.now();
    return repo.getAll().filter((task) => {
      if (!task.dueDate || task.status === 'completed') return false;
      return new Date(task.dueDate).getTime() < now;
    });
  },
};
