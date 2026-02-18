// Writing Progress Repository - Manages paper writing milestones and deadlines
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

export interface Milestone {
  id: string;
  name: string;
  deadline: string;
  completed: boolean;
}

export interface WritingProgress {
  id: string;
  paperTitle: string;
  submissionDeadline: string;
  milestones: Milestone[];
}

const defaultProgress: WritingProgress[] = [];

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

const repo = createListRepository<WritingProgress>(STORAGE_KEYS.WRITING_PROGRESS, defaultProgress);

// Default milestone templates
export const DEFAULT_MILESTONES = [
  { name: '文献调研', offset: -30 },    // 30 days before deadline
  { name: '实验完成', offset: -15 },     // 15 days before deadline
  { name: '初稿完成', offset: -7 },       // 7 days before deadline
  { name: '最终稿', offset: 0 },          // deadline day
];

export const writingProgressRepository = {
  getAll(): WritingProgress[] {
    return repo.getAll();
  },

  saveAll(items: WritingProgress[]): void {
    repo.saveAll(items);
  },

  getById(id: string): WritingProgress | undefined {
    return repo.getAll().find((item) => item.id === id);
  },

  create(paperTitle: string, submissionDeadline: string): WritingProgress {
    const milestones: Milestone[] = DEFAULT_MILESTONES.map((m, index) => {
      const deadline = new Date(submissionDeadline);
      deadline.setDate(deadline.getDate() + m.offset);
      return {
        id: `${Date.now()}-${index}`,
        name: m.name,
        deadline: deadline.toISOString().split('T')[0],
        completed: m.offset < 0, // Past milestones marked as completed
      };
    });

    const newProgress: WritingProgress = {
      id: Date.now().toString(),
      paperTitle,
      submissionDeadline,
      milestones,
    };

    const current = repo.getAll();
    repo.saveAll([...current, newProgress]);
    return newProgress;
  },

  update(id: string, updates: Partial<WritingProgress>): void {
    repo.saveAll(
      repo.getAll().map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  },

  delete(id: string): void {
    repo.saveAll(repo.getAll().filter((item) => item.id !== id));
  },

  toggleMilestone(paperId: string, milestoneId: string): void {
    repo.saveAll(
      repo.getAll().map((progress) => {
        if (progress.id !== paperId) return progress;
        return {
          ...progress,
          milestones: progress.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        };
      })
    );
  },

  addMilestone(paperId: string, milestone: Omit<Milestone, 'id'>): void {
    repo.saveAll(
      repo.getAll().map((progress) => {
        if (progress.id !== paperId) return progress;
        return {
          ...progress,
          milestones: [
            ...progress.milestones,
            { ...milestone, id: Date.now().toString() },
          ],
        };
      })
    );
  },

  getProgress(id: string): number {
    const progress = this.getById(id);
    if (!progress || progress.milestones.length === 0) return 0;
    
    const completed = progress.milestones.filter((m) => m.completed).length;
    return Math.round((completed / progress.milestones.length) * 100);
  },

  getDaysRemaining(id: string): number | null {
    const progress = this.getById(id);
    if (!progress) return null;
    
    const days = Math.ceil(
      (new Date(progress.submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  },

  getUpcomingDeadlines(days: number = 7): WritingProgress[] {
    const now = Date.now();
    const futureDate = now + days * 24 * 60 * 60 * 1000;
    
    return repo.getAll().filter((progress) => {
      const deadlineTime = new Date(progress.submissionDeadline).getTime();
      return deadlineTime >= now && deadlineTime <= futureDate;
    });
  },

  getOverdue(): WritingProgress[] {
    const now = Date.now();
    return repo.getAll().filter((progress) => {
      return new Date(progress.submissionDeadline).getTime() < now;
    });
  },
};
