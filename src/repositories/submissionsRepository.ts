import { STORAGE_KEYS } from '../constants/storage';
import { syncService } from '../services/sync';
import { auth } from '../services/auth';
import { createListRepository } from './localRepository';

export interface SubmissionTimelineItem {
  date: string;
  status: string;
  note?: string;
}

export interface Submission {
  id: string;
  paperTitle: string;
  venue: string;
  venueType: 'conference' | 'journal';
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'published';
  submittedDate?: string;
  updatedDate?: string;
  notes?: string;
  timeline: SubmissionTimelineItem[];
}

const defaultSubmissions: Submission[] = [
  {
    id: '1',
    paperTitle: 'A Novel Approach to Blockchain Security',
    venue: 'IEEE S&P 2026',
    venueType: 'conference',
    status: 'under_review',
    submittedDate: '2026-01-15',
    updatedDate: '2026-02-01',
    notes: 'First round review',
    timeline: [
      { date: '2026-01-15', status: 'submitted', note: 'Paper submitted' },
      { date: '2026-02-01', status: 'under_review', note: 'Under review' },
    ],
  },
  {
    id: '2',
    paperTitle: 'Distributed Systems Survey',
    venue: 'ACM TOCS',
    venueType: 'journal',
    status: 'draft',
    timeline: [],
  },
];

const repo = createListRepository<Submission>(STORAGE_KEYS.SUBMISSIONS, []);

// Helper to sync to cloud when in cloud mode
async function syncToCloud(action: 'create' | 'update' | 'delete', item?: Submission) {
  const user = auth.getCurrentUser();
  if (!user?.isCloudMode) return;
  
  try {
    await syncService.pushChanges('submissions', action, item);
  } catch (error) {
    console.error('[Submissions Repo] Cloud sync failed:', error);
  }
}

function getOrSeedSubmissions(): Submission[] {
  const items = repo.getAll();
  if (items.length > 0) return items;
  repo.saveAll(defaultSubmissions);
  return defaultSubmissions;
}

export const submissionsRepository = {
  getAll(): Submission[] {
    return getOrSeedSubmissions();
  },

  saveAll(items: Submission[]): void {
    repo.saveAll(items);
  },

  getById(id: string): Submission | undefined {
    return getOrSeedSubmissions().find((item) => item.id === id);
  },

  add(input: Omit<Submission, 'id' | 'timeline'>): Submission {
    const item: Submission = {
      ...input,
      id: Date.now().toString(),
      timeline: [
        { date: new Date().toISOString().split('T')[0], status: 'draft', note: 'Created' },
      ],
    };
    
    repo.saveAll([...getOrSeedSubmissions(), item]);
    
    // Sync to cloud
    syncToCloud('create', item);
    
    return item;
  },

  update(id: string, updates: Partial<Submission>): void {
    repo.saveAll(
      getOrSeedSubmissions().map((item) =>
        item.id === id ? { ...item, ...updates, updatedDate: new Date().toISOString().split('T')[0] } : item
      )
    );
    
    const updated = repo.getAll().find((s) => s.id === id);
    if (updated) syncToCloud('update', updated);
  },

  updateStatus(id: string, status: Submission['status']): void {
    repo.saveAll(
      getOrSeedSubmissions().map((item) => {
        if (item.id !== id) return item;
        const timeline = [
          ...item.timeline,
          {
            date: new Date().toISOString().split('T')[0],
            status,
            note: `Status changed to ${status}`,
          },
        ];
        return {
          ...item,
          status,
          submittedDate: status === 'submitted' && !item.submittedDate 
            ? new Date().toISOString().split('T')[0] 
            : item.submittedDate,
          updatedDate: new Date().toISOString().split('T')[0],
          timeline,
        };
      })
    );
    
    const updated = repo.getAll().find((s) => s.id === id);
    if (updated) syncToCloud('update', updated);
  },

  deleteById(id: string): void {
    repo.saveAll(getOrSeedSubmissions().filter((item) => item.id !== id));
    syncToCloud('delete', { id } as Submission);
  },

  getByStatus(status: Submission['status']): Submission[] {
    return getOrSeedSubmissions().filter((item) => item.status === status);
  },

  getByVenue(venue: string): Submission[] {
    return getOrSeedSubmissions().filter((item) => item.venue === venue);
  },

  getActive(): Submission[] {
    return getOrSeedSubmissions().filter(
      (item) => item.status !== 'rejected' && item.status !== 'published'
    );
  },
};
