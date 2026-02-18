// References Repository - Manages bibliography/reference data
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

export interface Reference {
  id: string;
  type: 'article' | 'conference' | 'book' | 'thesis' | 'misc';
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  conference?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  tags: string[];
  notes?: string;
}

const defaultReferences: Reference[] = [];

const repo = createListRepository<Reference>(STORAGE_KEYS.REFERENCES, defaultReferences);

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

export const referencesRepository = {
  getAll(): Reference[] {
    return repo.getAll();
  },

  saveAll(items: Reference[]): void {
    repo.saveAll(items);
  },

  getById(id: string): Reference | undefined {
    return repo.getAll().find((item) => item.id === id);
  },

  add(reference: Omit<Reference, 'id'>): Reference {
    const newReference: Reference = {
      ...reference,
      id: Date.now().toString(),
    };
    const current = repo.getAll();
    repo.saveAll([...current, newReference]);
    return newReference;
  },

  update(id: string, updates: Partial<Reference>): void {
    repo.saveAll(
      repo.getAll().map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  },

  delete(id: string): void {
    repo.saveAll(repo.getAll().filter((item) => item.id !== id));
  },

  search(query: string): Reference[] {
    const lowerQuery = query.toLowerCase();
    return repo.getAll().filter(
      (ref) =>
        ref.title.toLowerCase().includes(lowerQuery) ||
        ref.authors.some((a) => a.toLowerCase().includes(lowerQuery)) ||
        ref.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  },

  filterByType(type: Reference['type'] | 'all'): Reference[] {
    if (type === 'all') return repo.getAll();
    return repo.getAll().filter((ref) => ref.type === type);
  },

  getByDoi(doi: string): Reference | undefined {
    return repo.getAll().find((ref) => ref.doi === doi);
  },

  addTag(id: string, tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) return;

    repo.saveAll(
      repo.getAll().map((ref) => {
        if (ref.id !== id || ref.tags.includes(normalizedTag)) return ref;
        return { ...ref, tags: [...ref.tags, normalizedTag] };
      })
    );
  },

  removeTag(id: string, tag: string): void {
    repo.saveAll(
      repo.getAll().map((ref) =>
        ref.id === id
          ? { ...ref, tags: ref.tags.filter((t) => t !== tag) }
          : ref
      )
    );
  },

  importFromBibTeX(bibtex: string): Reference[] {
    const newRefs: Reference[] = [];
    const entries = bibtex.match(/@\w+\{[^@]+\}/g) || [];

    for (const entry of entries) {
      const typeMatch = entry.match(/@(\w+)\{/);
      const idMatch = entry.match(/@\w+\{([^,]+),/);
      const titleMatch = entry.match(/title\s*=\s*[{"]([^}"]+)[}"]/i);
      const authorMatch = entry.match(/author\s*=\s*[{"]([^}"]+)[}"]/i);
      const yearMatch = entry.match(/year\s*=\s*[{"]?(\d{4})[}"]?/i);
      const journalMatch = entry.match(/journal\s*=\s*[{"]([^}"]+)[}"]/i);
      const doiMatch = entry.match(/doi\s*=\s*[{"]([^}"]+)[}"]/i);

      if (titleMatch) {
        const typeMap: Record<string, Reference['type']> = {
          article: 'article',
          inproceedings: 'conference',
          book: 'book',
          phdthesis: 'thesis',
          mastersthesis: 'thesis',
          misc: 'misc',
        };
        const bibType = typeMatch ? typeMatch[1].toLowerCase() : 'misc';

        newRefs.push({
          id: idMatch ? idMatch[1] : Date.now().toString() + Math.random(),
          type: typeMap[bibType] || 'misc',
          title: titleMatch[1],
          authors: authorMatch
            ? authorMatch[1].split(/ and | and /).map((a) => a.trim())
            : [],
          year: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear(),
          journal: journalMatch ? journalMatch[1] : undefined,
          doi: doiMatch ? doiMatch[1] : undefined,
          tags: [],
        });
      }
    }

    if (newRefs.length > 0) {
      const current = repo.getAll();
      repo.saveAll([...current, ...newRefs]);
    }

    return newRefs;
  },

  exportToBibTeX(): string {
    const refs = repo.getAll();
    return refs
      .map((ref) => {
        const type = ref.type === 'article' ? 'article' :
                     ref.type === 'conference' ? 'inproceedings' :
                     ref.type === 'book' ? 'book' : 'misc';
        const key = `${ref.authors[0]?.split(' ').pop() || 'unknown'}${ref.year}`;
        
        let bibtex = `@${type}{${key},\n`;
        bibtex += `  title = {${ref.title}},\n`;
        if (ref.authors.length > 0) {
          bibtex += `  author = {${ref.authors.join(' and ')}},\n`;
        }
        bibtex += `  year = {${ref.year}},\n`;
        if (ref.journal) bibtex += `  journal = {${ref.journal}},\n`;
        if (ref.conference) bibtex += `  booktitle = {${ref.conference}},\n`;
        if (ref.doi) bibtex += `  doi = {${ref.doi}},\n`;
        if (ref.volume) bibtex += `  volume = {${ref.volume}},\n`;
        if (ref.pages) bibtex += `  pages = {${ref.pages}},\n`;
        bibtex += `}`;
        return bibtex;
      })
      .join('\n\n');
  },
};
