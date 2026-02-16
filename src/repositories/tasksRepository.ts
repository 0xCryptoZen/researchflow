import { STORAGE_KEYS } from '../constants/storage';
import { createListRepository } from './localRepository';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  paperId?: string;
  conferenceId?: string;
  createdAt: string;
  completedAt?: string;
}

const repo = createListRepository<Task>(STORAGE_KEYS.TASKS, []);

export const tasksRepository = {
  getAll(): Task[] {
    return repo.getAll();
  },

  saveAll(items: Task[]): void {
    repo.saveAll(items);
  },

  add(input: Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>): void {
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
  },

  deleteById(id: string): void {
    repo.saveAll(repo.getAll().filter((task) => task.id !== id));
  },
};
