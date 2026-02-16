import { readJSON, writeJSON } from '../services/storage';

export interface ListRepository<T> {
  getAll(): T[];
  saveAll(items: T[]): void;
}

export function createListRepository<T>(key: string, fallback: T[] = []): ListRepository<T> {
  return {
    getAll() {
      return readJSON<T[]>(key, fallback);
    },
    saveAll(items: T[]) {
      writeJSON<T[]>(key, items);
    },
  };
}
