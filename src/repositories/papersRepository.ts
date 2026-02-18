import { STORAGE_KEYS } from '../constants/storage';
import { type SearchResult } from '../services/papers';
import { syncService } from '../services/sync';
import { auth } from '../services/auth';
import { createListRepository } from './localRepository';

export interface SavedPaper extends SearchResult {
  savedAt: string;
  notes: string;
  tags: string[];
  isFavorite?: boolean;
}

const repo = createListRepository<SavedPaper>(STORAGE_KEYS.PAPERS, []);

// Helper to sync to cloud when in cloud mode
async function syncToCloud(action: 'create' | 'update' | 'delete', item?: SavedPaper) {
  const user = auth.getCurrentUser();
  if (!user?.isCloudMode) return;
  
  try {
    await syncService.pushChanges('papers', action, item);
  } catch (error) {
    console.error('[Papers Repo] Cloud sync failed:', error);
  }
}

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

  addFromSearchResult(paper: SearchResult): SavedPaper | null {
    const current = repo.getAll();
    if (current.some((item) => item.id === paper.id)) return null;

    const newPaper: SavedPaper = {
      ...paper,
      savedAt: new Date().toISOString(),
      notes: '',
      tags: [],
    };

    repo.saveAll([...current, newPaper]);
    
    // Sync to cloud
    syncToCloud('create', newPaper);
    
    return newPaper;
  },

  add(paper: Omit<SavedPaper, 'savedAt'>): SavedPaper {
    const newPaper: SavedPaper = {
      ...paper,
      savedAt: new Date().toISOString(),
    };
    
    const current = repo.getAll();
    repo.saveAll([...current, newPaper]);
    
    // Sync to cloud
    syncToCloud('create', newPaper);
    
    return newPaper;
  },

  update(id: string, updates: Partial<SavedPaper>): void {
    const current = repo.getAll();
    const updated = current.map((paper) =>
      paper.id === id ? { ...paper, ...updates } : paper
    );
    repo.saveAll(updated);
    
    // Sync to cloud
    const updatedPaper = updated.find((p) => p.id === id);
    if (updatedPaper) {
      syncToCloud('update', updatedPaper);
    }
  },

  deleteById(id: string): void {
    repo.saveAll(repo.getAll().filter((paper) => paper.id !== id));
    
    // Sync to cloud - create a minimal paper object for sync
    syncToCloud('delete', { id } as SavedPaper);
  },

  updateNotes(id: string, notes: string): void {
    this.update(id, { notes });
  },

  toggleFavorite(id: string): void {
    const paper = repo.getAll().find((p) => p.id === id);
    if (paper) {
      this.update(id, { isFavorite: !paper.isFavorite });
    }
  },

  addTag(id: string, tag: string): void {
    const normalizedTag = tag.trim();
    if (!normalizedTag) return;

    const paper = repo.getAll().find((p) => p.id === id);
    if (paper && !paper.tags.includes(normalizedTag)) {
      this.update(id, { tags: [...paper.tags, normalizedTag] });
    }
  },

  removeTag(id: string, tag: string): void {
    const paper = repo.getAll().find((p) => p.id === id);
    if (paper) {
      this.update(id, { tags: paper.tags.filter((item) => item !== tag) });
    }
  },

  getById(id: string): SavedPaper | undefined {
    return repo.getAll().find((paper) => paper.id === id);
  },

  getFavorites(): SavedPaper[] {
    return repo.getAll().filter((paper) => paper.isFavorite);
  },

  search(query: string): SavedPaper[] {
    const lowerQuery = query.toLowerCase();
    return repo.getAll().filter(
      (paper) =>
        paper.title.toLowerCase().includes(lowerQuery) ||
        paper.authors.some((a) => a.toLowerCase().includes(lowerQuery)) ||
        paper.abstract?.toLowerCase().includes(lowerQuery)
    );
  },

  filterByTag(tag: string): SavedPaper[] {
    return repo.getAll().filter((paper) => paper.tags.includes(tag));
  },

  getAllTags(): string[] {
    const allTags = repo.getAll().flatMap((paper) => paper.tags);
    return [...new Set(allTags)];
  },
};
