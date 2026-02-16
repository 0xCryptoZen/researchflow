import { STORAGE_KEYS } from '../constants/storage';
import { type SearchResult } from '../services/papers';
import { createListRepository } from './localRepository';

export interface SavedPaper extends SearchResult {
  savedAt: string;
  notes: string;
  tags: string[];
  isFavorite?: boolean;
}

const repo = createListRepository<SavedPaper>(STORAGE_KEYS.PAPERS, []);

export const papersRepository = {
  getAll(): SavedPaper[] {
    return repo.getAll();
  },

  saveAll(items: SavedPaper[]): void {
    repo.saveAll(items);
  },

  getSavedIds(): string[] {
    return repo.getAll().map((item) => item.id);
  },

  addFromSearchResult(paper: SearchResult): boolean {
    const current = repo.getAll();
    if (current.some((item) => item.id === paper.id)) return false;

    const newPaper: SavedPaper = {
      ...paper,
      savedAt: new Date().toISOString(),
      notes: '',
      tags: [],
    };

    repo.saveAll([...current, newPaper]);
    return true;
  },

  deleteById(id: string): void {
    repo.saveAll(repo.getAll().filter((paper) => paper.id !== id));
  },

  updateNotes(id: string, notes: string): void {
    repo.saveAll(repo.getAll().map((paper) => (paper.id === id ? { ...paper, notes } : paper)));
  },

  toggleFavorite(id: string): void {
    repo.saveAll(
      repo.getAll().map((paper) =>
        paper.id === id ? { ...paper, isFavorite: !paper.isFavorite } : paper
      )
    );
  },

  addTag(id: string, tag: string): void {
    const normalizedTag = tag.trim();
    if (!normalizedTag) return;

    repo.saveAll(
      repo.getAll().map((paper) => {
        if (paper.id !== id || paper.tags.includes(normalizedTag)) return paper;
        return { ...paper, tags: [...paper.tags, normalizedTag] };
      })
    );
  },

  removeTag(id: string, tag: string): void {
    repo.saveAll(
      repo.getAll().map((paper) =>
        paper.id === id ? { ...paper, tags: paper.tags.filter((item) => item !== tag) } : paper
      )
    );
  },
};
