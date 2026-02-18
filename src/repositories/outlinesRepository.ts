// Outlines Repository - Manages paper outline/draft data
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

export interface OutlineSection {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'writing' | 'completed';
}

export interface Outline {
  id: string;
  title: string;
  conference: string;
  sections: OutlineSection[];
  createdAt: string;
  updatedAt: string;
}

export const TEMPLATE_STRUCTURES = {
  standard: {
    name: '标准学术论文结构',
    sections: ['Abstract', 'Introduction', 'Background', 'Related Work', 'Methodology', 'Experiment', 'Discussion', 'Conclusion', 'References'],
  },
  security: {
    name: '安全/区块链论文结构',
    sections: ['Abstract', 'Introduction', 'Preliminaries', 'System Model', 'Threat Model', 'Proposed Scheme', 'Security Analysis', 'Performance Evaluation', 'Conclusion', 'References'],
  },
  ai: {
    name: 'AI/ML 论文结构',
    sections: ['Abstract', 'Introduction', 'Related Work', 'Method', 'Experiments', 'Results', 'Discussion', 'Conclusion', 'Appendix'],
  },
  short: {
    name: '短论文结构',
    sections: ['Abstract', 'Introduction', 'Technical Approach', 'Experiments', 'Conclusion', 'References'],
  },
};

const defaultOutlines: Outline[] = [];

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

const repo = createListRepository<Outline>(STORAGE_KEYS.OUTLINES, defaultOutlines);

export const outlinesRepository = {
  getAll(): Outline[] {
    return repo.getAll();
  },

  saveAll(items: Outline[]): void {
    repo.saveAll(items);
  },

  getById(id: string): Outline | undefined {
    return repo.getAll().find((item) => item.id === id);
  },

  create(title: string, conference: string, templateKey: keyof typeof TEMPLATE_STRUCTURES): Outline {
    const template = TEMPLATE_STRUCTURES[templateKey];
    const now = new Date().toISOString();
    
    const newOutline: Outline = {
      id: Date.now().toString(),
      title,
      conference,
      sections: template.sections.map((section, index) => ({
        id: `${Date.now()}-${index}`,
        title: section,
        content: '',
        status: 'pending' as const,
      })),
      createdAt: now,
      updatedAt: now,
    };
    
    const current = repo.getAll();
    repo.saveAll([...current, newOutline]);
    return newOutline;
  },

  update(id: string, updates: Partial<Outline>): void {
    repo.saveAll(
      repo.getAll().map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  },

  delete(id: string): void {
    repo.saveAll(repo.getAll().filter((item) => item.id !== id));
  },

  updateSection(outlineId: string, sectionId: string, updates: Partial<OutlineSection>): void {
    repo.saveAll(
      repo.getAll().map((outline) => {
        if (outline.id !== outlineId) return outline;
        return {
          ...outline,
          sections: outline.sections.map((section) =>
            section.id === sectionId ? { ...section, ...updates } : section
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  },

  updateSectionStatus(outlineId: string, sectionId: string, status: OutlineSection['status']): void {
    this.updateSection(outlineId, sectionId, { status });
  },

  getProgress(outlineId: string): { total: number; completed: number; percentage: number } {
    const outline = this.getById(outlineId);
    if (!outline) return { total: 0, completed: 0, percentage: 0 };
    
    const total = outline.sections.length;
    const completed = outline.sections.filter((s) => s.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  },
};
