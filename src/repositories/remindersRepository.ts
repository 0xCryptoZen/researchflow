// Reminders Repository - Manages reminder data with local-first approach
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

export interface Reminder {
  id: string;
  type: 'paper' | 'conference' | 'task' | 'custom';
  title: string;
  description: string;
  date: string;
  time: string;
  enabled: boolean;
  notifyVia: ('email' | 'feishu' | 'telegram')[];
}

const defaultReminders: Reminder[] = [
  {
    id: '1',
    type: 'conference',
    title: '会议截稿提醒',
    description: 'IEEE S&P 2026 截稿日期临近',
    date: '2026-03-01',
    time: '09:00',
    enabled: true,
    notifyVia: ['email', 'feishu'],
  },
];

const repo = createListRepository<Reminder>(STORAGE_KEYS.REMINDERS, defaultReminders);

function createListRepository<T>(key: string, fallback: T[] = []) {
  return {
    getAll(): T[] {
      return readJSON<T[]>(key, fallback);
    },
    saveAll(items: T[]): void {
      writeJSON<T[]>(key, items);
    },
  };
}

export const remindersRepository = {
  getAll(): Reminder[] {
    return repo.getAll();
  },

  saveAll(items: Reminder[]): void {
    repo.saveAll(items);
  },

  getById(id: string): Reminder | undefined {
    return repo.getAll().find((item) => item.id === id);
  },

  add(reminder: Omit<Reminder, 'id'>): Reminder {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    const current = repo.getAll();
    repo.saveAll([...current, newReminder]);
    return newReminder;
  },

  update(id: string, updates: Partial<Reminder>): void {
    repo.saveAll(
      repo.getAll().map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  },

  delete(id: string): void {
    repo.saveAll(repo.getAll().filter((item) => item.id !== id));
  },

  toggleEnabled(id: string): void {
    repo.saveAll(
      repo.getAll().map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  },

  getEnabled(): Reminder[] {
    return repo.getAll().filter((item) => item.enabled);
  },

  getByType(type: Reminder['type']): Reminder[] {
    return repo.getAll().filter((item) => item.type === type);
  },
};
