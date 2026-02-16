import { STORAGE_KEYS } from '../constants/storage';
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

  add(input: Omit<Submission, 'id' | 'timeline'>): void {
    const item: Submission = {
      ...input,
      id: Date.now().toString(),
      timeline: [
        { date: new Date().toISOString().split('T')[0], status: 'draft', note: 'Created' },
      ],
    };
    repo.saveAll([...getOrSeedSubmissions(), item]);
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
          updatedDate: new Date().toISOString().split('T')[0],
          timeline,
        };
      })
    );
  },

  deleteById(id: string): void {
    repo.saveAll(getOrSeedSubmissions().filter((item) => item.id !== id));
  },
};
