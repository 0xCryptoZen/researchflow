// Conference Deadline Scraper Service
// 自动抓取会议 deadline 信息

import { conferencesRepository, type Conference } from '../repositories/conferencesRepository';
import { remindersRepository, type Reminder } from '../repositories/remindersRepository';

export interface ConferenceInfo {
  name: string;
  shortName: string;
  year: number;
  deadline: string;
  notificationDate?: string;
  conferenceDate?: string;
  website: string;
  category: string;
}

// Reminder days configuration
export const REMINDER_DAYS = [7, 3, 1]; // Days before deadline to remind

// Known conference URLs that we can scrape
export const KNOWN_CONFERENCE_URLS: Record<string, {
  name: string;
  shortName: string;
  category: string;
  deadline?: string;
  url: string;
}> = {
  'neurips': {
    name: 'Neural Information Processing Systems',
    shortName: 'NeurIPS',
    category: 'ai',
    url: 'https://neurips.cc/',
  },
  'icml': {
    name: 'International Conference on Machine Learning',
    shortName: 'ICML',
    category: 'ai',
    url: 'https://icml.cc/',
  },
  'iclr': {
    name: 'International Conference on Learning Representations',
    shortName: 'ICLR',
    category: 'ai',
    url: 'https://iclr.cc/',
  },
  'aaai': {
    name: 'AAAI Conference on Artificial Intelligence',
    shortName: 'AAAI',
    category: 'ai',
    url: 'https://aaai.org/Conferences/AAAI-2026/',
  },
  'cvpr': {
    name: 'Computer Vision and Pattern Recognition',
    shortName: 'CVPR',
    category: 'ai',
    url: 'https://cvpr2026.thecvf.com/',
  },
  'iccv': {
    name: 'International Conference on Computer Vision',
    shortName: 'ICCV',
    category: 'ai',
    url: 'https://iccv2025.thecvf.com/',
  },
  'eccv': {
    name: 'European Conference on Computer Vision',
    shortName: 'ECCV',
    category: 'ai',
    url: 'https://eccv2026.org/',
  },
  'acl': {
    name: 'Association for Computational Linguistics',
    shortName: 'ACL',
    category: 'ai',
    url: 'https://acl2026.org/',
  },
  'sigcomm': {
    name: 'ACM SIGCOMM Conference',
    shortName: 'SIGCOMM',
    category: 'network',
    url: 'https://sigcomm.org/',
  },
  'nsdi': {
    name: 'Symposium on Networked Systems Design and Implementation',
    shortName: 'NSDI',
    category: 'network',
    url: 'https://www.usenix.org/nsdi/',
  },
  'oakland': {
    name: 'IEEE Symposium on Security and Privacy',
    shortName: 'IEEE S&P',
    category: 'security',
    url: 'https://sp2026.ieee-security.org/',
  },
  'usenix': {
    name: 'USENIX Security Symposium',
    shortName: 'USENIX Security',
    category: 'security',
    url: 'https://www.usenix.org/security2026/',
  },
  'ccs': {
    name: 'ACM Conference on Computer and Communications Security',
    shortName: 'CCS',
    category: 'security',
    url: 'https://www.sigsac.org/ccs/CCS2026/',
  },
  'ndss': {
    name: 'Network and Distributed System Security Symposium',
    shortName: 'NDSS',
    category: 'security',
    url: 'https://ndss-symposium.org/',
  },
};

// Known conferences with their website patterns
const KNOWN_CONFERENCES: Record<string, {
  pattern: RegExp;
  deadlineSelector?: string;
  fetchDeadline: (html: string) => string | null;
  category: string;
}> = {
  'neurips': {
    pattern: /neurips\.cc/i,
    category: 'ai',
    fetchDeadline: (html: string) => {
      // Try to find deadline in the page
      const deadlineMatch = html.match(/Abstract.*?Deadline[:\s]*(\d{4}-\d{2}-\d{2})/i) 
        || html.match(/submission.*?deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return deadlineMatch?.[1] || null;
    },
  },
  'icml': {
    pattern: /icml\.cc/i,
    category: 'ai',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'iclr': {
    pattern: /iclr\.cc/i,
    category: 'ai',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'aaai': {
    pattern: /aaai\.org/i,
    category: 'ai',
    fetchDeadline: (html: string) => {
      const match = html.match(/(?:abstract|paper).*?deadline[:\s]*(\w+\s+\d{1,2},\s+\d{4})/i);
      return match?.[1] ? new Date(match[1]).toISOString().split('T')[0] : null;
    },
  },
  'ijcai': {
    pattern: /ijcai.*\.org/i,
    category: 'ai',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'cvpr': {
    pattern: /cvpr.*\.org/i,
    category: 'cv',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'iccv': {
    pattern: /iccv.*\.org/i,
    category: 'cv',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'eccv': {
    pattern: /eccv.*\.org/i,
    category: 'cv',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'acl': {
    pattern: /acl.*\.org/i,
    category: 'nlp',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'emnlp': {
    pattern: /emnlp.*\.org/i,
    category: 'nlp',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'naacl': {
    pattern: /naacl.*\.org/i,
    category: 'nlp',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'sigcomm': {
    pattern: /sigcomm\.org/i,
    category: 'network',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'nsdi': {
    pattern: /nsdi\.org/i,
    category: 'network',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'usenix': {
    pattern: /usenix\.org/i,
    category: 'security',
    fetchDeadline: (html: string) => {
      const match = html.match(/(?:abstract|paper).*?deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'oakland': {
    pattern: /oakland.*\.org/i,
    category: 'security',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'ccs': {
    pattern: /sigsac\.org\/ccs/i,
    category: 'security',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'ndss': {
    pattern: /ndss-symposium\.org/i,
    category: 'security',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'crypto': {
    pattern: /iacr\.org.*\/crypto/i,
    category: 'crypto',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'eurocrypt': {
    pattern: /iacr\.org.*\/eurocrypt/i,
    category: 'crypto',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
  'asiacrypt': {
    pattern: /iacr\.org.*\/asiacrypt/i,
    category: 'crypto',
    fetchDeadline: (html: string) => {
      const match = html.match(/deadline[:\s]*(\d{4}-\d{2}-\d{2})/i);
      return match?.[1] || null;
    },
  },
};

// Find matching conference pattern
function findConferencePattern(url: string): { pattern: RegExp; fetchDeadline: (html: string) => string | null; category: string } | null {
  for (const key in KNOWN_CONFERENCES) {
    const conf = KNOWN_CONFERENCES[key];
    if (conf.pattern.test(url)) {
      return conf;
    }
  }
  return null;
}

// Parse various date formats
function parseDate(dateStr: string): string | null {
  // Try ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  // Try other common formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
    /(\d{4})\/(\d{2})\/(\d{2})/,  // YYYY/MM/DD
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/,  // Month DD, YYYY
  ];
  
  for (const fmt of formats) {
    const match = dateStr.match(fmt);
    if (match) {
      date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  return null;
}

// Fetch conference page and extract deadline
async function fetchConferenceDeadline(url: string): Promise<{
  deadline?: string;
  notificationDate?: string;
  conferenceDate?: string;
  error?: string;
}> {
  try {
    // Fetch the conference page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResearchFlow/1.0)',
      },
    });
    
    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Find matching conference pattern
    const pattern = findConferencePattern(url);
    
    if (pattern) {
      const deadline = pattern.fetchDeadline(html);
      if (deadline) {
        return { deadline };
      }
    }
    
    // Fallback: try to find common deadline patterns
    const deadlinePatterns = [
      /abstract\s*deadline[:\s]*(\d{4}-\d{2}-\d{2})/i,
      /paper\s*deadline[:\s]*(\d{4}-\d{2}-\d{2})/i,
      /submission\s*deadline[:\s]*(\d{4}-\d{2}-\d{2})/i,
      /deadline[:\s]*(\d{4}-\d{2}-\d{2})/i,
      /deadline[:\s]*(\w+\s+\d{1,2},\s+\d{4})/i,
    ];
    
    for (const pat of deadlinePatterns) {
      const match = html.match(pat);
      if (match) {
        const parsed = parseDate(match[1]);
        if (parsed) {
          return { deadline: parsed };
        }
      }
    }
    
    // Try to find notification date
    const notifMatch = html.match(/notification[:\s]*(\d{4}-\d{2}-\d{2})/i);
    if (notifMatch) {
      const parsed = parseDate(notifMatch[1]);
      if (parsed) {
        return { notificationDate: parsed };
      }
    }
    
    // Try to find conference date
    const confDateMatch = html.match(/conference\s*date[:\s]*(\w+\s+\d{1,2},?\s+\d{4})/i);
    if (confDateMatch) {
      const parsed = parseDate(confDateMatch[1]);
      if (parsed) {
        return { conferenceDate: parsed };
      }
    }
    
    return { error: 'No deadline found' };
  } catch (error) {
    return { error: String(error) };
  }
}

// Auto-discover conference from URL
export async function discoverConference(url: string): Promise<ConferenceInfo | null> {
  try {
    // First check if it's a known conference
    const pattern = findConferencePattern(url);
    let category = 'other';
    let shortName = '';
    
    if (pattern) {
      category = pattern.category;
    }
    
    // Extract short name from URL
    const urlMatch = url.match(/(?:https?:\/\/)?(?:www\.)?([^.]+)\./i);
    if (urlMatch) {
      shortName = urlMatch[1].toUpperCase();
    }
    
    // Try to fetch deadline
    const result = await fetchConferenceDeadline(url);
    
    if (result.error && !result.deadline) {
      console.warn('[Conference Scraper] Could not find deadline:', result.error);
    }
    
    const currentYear = new Date().getFullYear();
    
    return {
      name: shortName ? `${shortName} ${currentYear}` : 'Unknown Conference',
      shortName,
      year: currentYear,
      deadline: result.deadline || '',
      notificationDate: result.notificationDate,
      conferenceDate: result.conferenceDate,
      website: url,
      category,
    };
  } catch (error) {
    console.error('[Conference Scraper] Discovery failed:', error);
    return null;
  }
}

// Batch fetch multiple conferences
export async function fetchMultipleConferences(urls: string[]): Promise<ConferenceInfo[]> {
  const results: ConferenceInfo[] = [];
  
  // Process in parallel with limit
  const limit = 3;
  for (let i = 0; i < urls.length; i += limit) {
    const batch = urls.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map(url => discoverConference(url))
    );
    
    results.push(...batchResults.filter((r): r is ConferenceInfo => r !== null));
  }
  
  return results;
}

// Generate reminder ID based on conference and days
function generateReminderId(conferenceId: string, days: number): string {
  return `conf_${conferenceId}_${days}d`;
}

// Create automatic reminders for a conference
export function createConferenceReminders(conference: Conference): Reminder[] {
  const reminders: Reminder[] = [];
  const conferenceDeadline = new Date(conference.deadline);
  
  for (const days of REMINDER_DAYS) {
    const reminderDate = new Date(conferenceDeadline);
    reminderDate.setDate(reminderDate.getDate() - days);
    
    // Skip if reminder date is in the past
    if (reminderDate <= new Date()) continue;
    
    const reminderId = generateReminderId(conference.id, days);
    
    // Check if reminder already exists
    const existing = remindersRepository.getById(reminderId);
    if (existing) continue;
    
    const reminder: Reminder = {
      id: reminderId,
      type: 'conference',
      title: `${conference.shortName} 截稿提醒`,
      description: `距 ${conference.shortName} ${conference.year} 截稿还有 ${days} 天`,
      date: reminderDate.toISOString().split('T')[0],
      time: '09:00',
      enabled: true,
      notifyVia: ['email', 'feishu'],
    };
    
    reminders.push(reminder);
  }
  
  return reminders;
}

// Add reminders for a conference
export function addConferenceReminders(conference: Conference): void {
  const reminders = createConferenceReminders(conference);
  
  for (const reminder of reminders) {
    remindersRepository.add(reminder);
  }
}

// Remove reminders for a conference
export function removeConferenceReminders(conferenceId: string): void {
  const allReminders = remindersRepository.getAll();
  
  for (const reminder of allReminders) {
    if (reminder.id.startsWith(`conf_${conferenceId}_`)) {
      remindersRepository.delete(reminder.id);
    }
  }
}

// Sync reminders for all conferences (call this periodically)
export function syncConferenceReminders(): void {
  const conferences = conferencesRepository.getAll();
  
  // Get all conference-related reminder IDs
  const existingReminderIds = new Set(
    remindersRepository.getAll()
      .filter(r => r.id.startsWith('conf_'))
      .map(r => r.id)
  );
  
  // Create reminders for each conference
  for (const conf of conferences) {
    const reminders = createConferenceReminders(conf);
    
    for (const reminder of reminders) {
      if (!existingReminderIds.has(reminder.id)) {
        remindersRepository.add(reminder);
      }
    }
  }
}

// Get upcoming reminders for a conference
export function getConferenceReminders(conferenceId: string): Reminder[] {
  return remindersRepository.getAll().filter(
    r => r.id.startsWith(`conf_${conferenceId}_`)
  );
}

export default {
  discoverConference,
  fetchMultipleConferences,
  fetchConferenceDeadline,
  createConferenceReminders,
  addConferenceReminders,
  removeConferenceReminders,
  syncConferenceReminders,
  getConferenceReminders,
};
