export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  source: 'arxiv' | 'scholar' | 'dblp' | 'ieee' | 'acm';
  url: string;
  publishedDate: string;
  tags: string[];
  notes?: string;
  isFavorite?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  paperId?: string;
  conferenceId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Conference {
  id: string;
  name: string;
  shortName: string;
  year: number;
  deadline: string;
  notificationDate?: string;
  conferenceDate?: string;
  website: string;
  category: 'blockchain' | 'security' | 'ai' | 'network' | 'other';
}

export interface User {
  id: string;
  githubId: string;
  name: string;
  email: string;
  avatar?: string;
  researchFields: string[];
  targetConferences: string[];
}

export interface ResearchField {
  id: string;
  name: string;
  keywords: string[];
  recommendedConferences: string[];
}
