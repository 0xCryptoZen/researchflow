// Charts Repository - Manages figures, tables, and diagrams
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

export interface Chart {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'figure' | 'table' | 'image' | 'diagram';
  tags: string[];
  paperId?: string;
  createdAt: string;
  updatedAt: string;
}

const defaultCharts: Chart[] = [];

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

const repo = createListRepository<Chart>(STORAGE_KEYS.CHARTS, defaultCharts);

export const chartsRepository = {
  getAll(): Chart[] {
    return repo.getAll();
  },

  saveAll(items: Chart[]): void {
    repo.saveAll(items);
  },

  getById(id: string): Chart | undefined {
    return repo.getAll().find((item) => item.id === id);
  },

  add(chart: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>): Chart {
    const now = new Date().toISOString();
    const newChart: Chart = {
      ...chart,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    const current = repo.getAll();
    repo.saveAll([...current, newChart]);
    return newChart;
  },

  update(id: string, updates: Partial<Chart>): void {
    repo.saveAll(
      repo.getAll().map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  },

  delete(id: string): void {
    repo.saveAll(repo.getAll().filter((item) => item.id !== id));
  },

  search(query: string): Chart[] {
    const lowerQuery = query.toLowerCase();
    return repo.getAll().filter(
      (chart) =>
        chart.name.toLowerCase().includes(lowerQuery) ||
        chart.description.toLowerCase().includes(lowerQuery) ||
        chart.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  },

  filterByType(type: Chart['type'] | 'all'): Chart[] {
    if (type === 'all') return repo.getAll();
    return repo.getAll().filter((chart) => chart.type === type);
  },

  getByPaperId(paperId: string): Chart[] {
    return repo.getAll().filter((chart) => chart.paperId === paperId);
  },

  addTag(id: string, tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) return;

    repo.saveAll(
      repo.getAll().map((chart) => {
        if (chart.id !== id || chart.tags.includes(normalizedTag)) return chart;
        return { ...chart, tags: [...chart.tags, normalizedTag] };
      })
    );
  },

  removeTag(id: string, tag: string): void {
    repo.saveAll(
      repo.getAll().map((chart) =>
        chart.id === id
          ? { ...chart, tags: chart.tags.filter((t) => t !== tag) }
          : chart
      )
    );
  },

  getAllTags(): string[] {
    const allTags = repo.getAll().flatMap((chart) => chart.tags);
    return [...new Set(allTags)];
  },
};
