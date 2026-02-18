import { STORAGE_KEYS } from '../constants/storage';
import { syncService } from '../services/sync';
import { auth } from '../services/auth';
import { createListRepository } from './localRepository';

export interface Conference {
  id: string;
  name: string;
  shortName: string;
  year: number;
  deadline: string;
  notificationDate?: string;
  conferenceDate?: string;
  website: string;
  category: string;
  createdAt?: string;
}

const defaultConferences: Conference[] = [
  { id: '1', name: 'Eurocrypt 2026', shortName: 'Eurocrypt', year: 2026, deadline: '2026-05-06', category: 'blockchain', website: 'https://eurocrypt.iacr.org/2026/' },
  { id: '2', name: 'IEEE Blockchain 2026', shortName: 'IEEE Blockchain', year: 2026, deadline: '2026-07-15', category: 'blockchain', website: 'https://ieee-blockchain.org/2026/' },
  { id: '3', name: 'ACM CCS 2026', shortName: 'CCS', year: 2026, deadline: '2026-05-01', category: 'security', website: 'https://www.sigsac.org/ccs/CCS2026/' },
  { id: '4', name: 'USENIX Security 2026', shortName: 'USENIX Security', year: 2026, deadline: '2026-05-07', category: 'security', website: 'https://www.usenix.org/security2026/' },
  { id: '5', name: 'IEEE S&P 2026', shortName: 'IEEE S&P', year: 2026, deadline: '2026-08-15', category: 'security', website: 'https://sp2026.ieee-security.org/' },
  { id: '6', name: 'NeurIPS 2026', shortName: 'NeurIPS', year: 2026, deadline: '2026-05-19', category: 'ai', website: 'https://neurips.cc/' },
  { id: '7', name: 'ICML 2026', shortName: 'ICML', year: 2026, deadline: '2026-01-27', category: 'ai', website: 'https://icml.cc/2026/' },
  { id: '8', name: 'SIGCOMM 2026', shortName: 'SIGCOMM', year: 2026, deadline: '2026-02-03', category: 'network', website: 'https://sigcomm.org/' },
  { id: '9', name: 'AFT 2026', shortName: 'AFT', year: 2026, deadline: '2026-02-15', category: 'blockchain', website: 'https://aft.math Satoshi/' },
];

const repo = createListRepository<Conference>(STORAGE_KEYS.CONFERENCES, []);

// Helper to sync to cloud when in cloud mode
async function syncToCloud(action: 'create' | 'update' | 'delete', item?: Conference) {
  const user = auth.getCurrentUser();
  if (!user?.isCloudMode) return;
  
  try {
    await syncService.pushChanges('conferences', action, item);
  } catch (error) {
    console.error('[Conferences Repo] Cloud sync failed:', error);
  }
}

function getOrSeedConferences(): Conference[] {
  const items = repo.getAll();
  if (items.length > 0) return items;
  repo.saveAll(defaultConferences);
  return defaultConferences;
}

export const conferencesRepository = {
  getAll(): Conference[] {
    return getOrSeedConferences();
  },

  saveAll(items: Conference[]): void {
    repo.saveAll(items);
  },

  getById(id: string): Conference | undefined {
    return getOrSeedConferences().find((conf) => conf.id === id);
  },

  add(input: Pick<Conference, 'name' | 'shortName' | 'deadline' | 'category'> & { website?: string; notificationDate?: string; conferenceDate?: string }): Conference {
    if (!input.name || !input.deadline) throw new Error('Name and deadline are required');
    
    const conf: Conference = {
      id: Date.now().toString(),
      name: input.name,
      shortName: input.shortName,
      year: new Date(input.deadline).getFullYear(),
      deadline: input.deadline,
      category: input.category,
      website: input.website || '',
      notificationDate: input.notificationDate,
      conferenceDate: input.conferenceDate,
      createdAt: new Date().toISOString(),
    };
    
    repo.saveAll([...getOrSeedConferences(), conf]);
    
    // Sync to cloud
    syncToCloud('create', conf);
    
    return conf;
  },

  update(id: string, updates: Partial<Conference>): void {
    repo.saveAll(
      getOrSeedConferences().map((conf) =>
        conf.id === id ? { ...conf, ...updates } : conf
      )
    );
    
    const updated = repo.getAll().find((c) => c.id === id);
    if (updated) syncToCloud('update', updated);
  },

  deleteById(id: string): void {
    repo.saveAll(getOrSeedConferences().filter((conf) => conf.id !== id));
    syncToCloud('delete', { id } as Conference);
  },

  getByCategory(category: string): Conference[] {
    return getOrSeedConferences().filter((conf) => conf.category === category);
  },

  getUpcoming(days: number = 30): Conference[] {
    const now = Date.now();
    const future = now + days * 24 * 60 * 60 * 1000;
    
    return getOrSeedConferences().filter((conf) => {
      const deadlineTime = new Date(conf.deadline).getTime();
      return deadlineTime >= now && deadlineTime <= future;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  },

  getByDeadline(deadline: string): Conference[] {
    return getOrSeedConferences().filter((conf) => conf.deadline === deadline);
  },

  search(query: string): Conference[] {
    const lowerQuery = query.toLowerCase();
    return getOrSeedConferences().filter(
      (conf) =>
        conf.name.toLowerCase().includes(lowerQuery) ||
        conf.shortName.toLowerCase().includes(lowerQuery) ||
        conf.category.toLowerCase().includes(lowerQuery)
    );
  },

  getAllCategories(): string[] {
    const categories = getOrSeedConferences().map((conf) => conf.category);
    return [...new Set(categories)];
  },
};
