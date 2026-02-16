import { STORAGE_KEYS } from '../constants/storage';
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

  add(input: Pick<Conference, 'name' | 'shortName' | 'deadline' | 'category'>): void {
    if (!input.name || !input.deadline) return;
    const conf: Conference = {
      id: Date.now().toString(),
      ...input,
      year: new Date(input.deadline).getFullYear(),
      website: '',
    };
    repo.saveAll([...getOrSeedConferences(), conf]);
  },

  deleteById(id: string): void {
    repo.saveAll(getOrSeedConferences().filter((conf) => conf.id !== id));
  },
};
