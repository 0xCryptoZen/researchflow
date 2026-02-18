// Core entity types for ResearchFlow

// ============ Paper Types ============
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  source: PaperSource;
  url: string;
  publishedDate: string;
  tags: string[];
  notes?: string;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PaperSource = 'arxiv' | 'scholar' | 'dblp' | 'ieee' | 'acm';

export interface SavedPaper extends Paper {
  createdAt: string;
  updatedAt: string;
}

// ============ Task Types ============
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  paperId?: string;
  conferenceId?: string;
  createdAt: string;
  completedAt?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

// ============ Conference Types ============
export interface Conference {
  id: string;
  name: string;
  shortName: string;
  year: number;
  deadline: string;
  notificationDate?: string;
  conferenceDate?: string;
  website: string;
  category: ConferenceCategory;
}

export type ConferenceCategory = 'blockchain' | 'security' | 'ai' | 'network' | 'other';

// ============ User Types ============
export interface User {
  id: string;
  githubId: string;
  name: string;
  email: string;
  avatar?: string;
  researchFields: string[];
  targetConferences: string[];
  isCloudMode?: boolean;
}

// ============ Research Field Types ============
export interface ResearchField {
  id: string;
  name: string;
  keywords: string[];
  recommendedConferences: string[];
}

// ============ Reminder Types ============
export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  date: string;
  time: string;
  enabled: boolean;
  notifyVia: NotifyChannel[];
}

export type ReminderType = 'paper' | 'conference' | 'task' | 'custom';
export type NotifyChannel = 'email' | 'feishu' | 'telegram';

// ============ Outline Types ============
export interface Outline {
  id: string;
  title: string;
  conference: string;
  sections: OutlineSection[];
  createdAt: string;
  updatedAt: string;
}

export interface OutlineSection {
  id: string;
  title: string;
  content: string;
  status: OutlineSectionStatus;
}

export type OutlineSectionStatus = 'pending' | 'writing' | 'completed';

// ============ Reference Types ============
export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  tags: string[];
  notes?: string;
  paperId?: string;
}

// ============ Submission Types ============
export interface Submission {
  id: string;
  paperId: string;
  conferenceId: string;
  title: string;
  status: SubmissionStatus;
  submittedAt: string;
  resultDate?: string;
  notes?: string;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'under-review' | 'accepted' | 'rejected';

// ============ Writing Progress Types ============
export interface WritingProgress {
  paperId: string;
  outlineId: string;
  totalWords: number;
  targetWords: number;
  sections: SectionProgress[];
  lastUpdated: string;
}

export interface SectionProgress {
  outlineSectionId: string;
  title: string;
  currentWords: number;
  targetWords: number;
  status: OutlineSectionStatus;
}

// ============ Chart Types ============
export interface ChartData {
  id: string;
  type: ChartType;
  title: string;
  data: ChartDataPoint[];
  createdAt: string;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'area';

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

// ============ Notification Settings ============
export interface NotificationSettings {
  email: boolean;
  feishu: boolean;
  telegram: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// ============ Sync Types ============
export interface SyncStatus {
  lastSync: string | null;
  pending: boolean;
  error: string | null;
  isCloudMode: boolean;
}

// ============ Dashboard Stats Types ============
export interface DashboardStats {
  papersCount: number;
  tasksCount: number;
  completedTasksCount: number;
  conferencesCount: number;
  submissionsCount: number;
}

// ============ Filter Types ============
export interface FilterOption<T = string> {
  value: T;
  label: string;
}

// ============ Form Types ============
export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  relatedPaperId: string;
  relatedConferenceId: string;
}

// ============ API Response Types ============
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ============ Template Types ============
export interface PaperTemplate {
  id: string;
  name: string;
  description: string;
  category: ConferenceCategory;
  sections: string[];
}

export const TEMPLATE_STRUCTURES: Record<string, { name: string; sections: string[] }> = {
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
