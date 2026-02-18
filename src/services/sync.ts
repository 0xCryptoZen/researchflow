// Cloud Sync Service - Synchronizes local storage with Cloudflare D1
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from './storage';
import { auth, AuthUser } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

// Entity types that can be synced
export type EntityType = 'papers' | 'tasks' | 'conferences' | 'submissions' | 'reminders';

interface SyncStatus {
  lastSyncTime: string | null;
  entityCounts: Record<string, number>;
  isSyncing: boolean;
  error?: string;
}

interface SyncChange {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  synced_at: string;
}

function getAuthHeader(): string | null {
  const user = auth.getCurrentUser();
  return user?.id ? `Bearer ${user.id}` : null;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Get local data key for entity type
function getLocalKey(type: EntityType): string {
  const keyMap: Record<EntityType, string> = {
    papers: STORAGE_KEYS.PAPERS,
    tasks: STORAGE_KEYS.TASKS,
    conferences: STORAGE_KEYS.CONFERENCES,
    submissions: STORAGE_KEYS.SUBMISSIONS,
    reminders: STORAGE_KEYS.REMINDERS,
  };
  return keyMap[type];
}

// Map cloud entity to local format
function mapCloudToLocal(cloudData: any, type: EntityType): any {
  switch (type) {
    case 'papers':
      return {
        id: cloudData.id,
        title: cloudData.title,
        authors: JSON.parse(cloudData.authors || '[]'),
        abstract: cloudData.abstract,
        source: cloudData.source,
        url: cloudData.url,
        pdfUrl: cloudData.pdf_url,
        publishedDate: cloudData.published_date,
        tags: JSON.parse(cloudData.tags || '[]'),
        notes: cloudData.notes,
        isFavorite: cloudData.is_favorite === 1,
        addedAt: cloudData.added_at,
      };
    case 'tasks':
      return {
        id: cloudData.id,
        title: cloudData.title,
        description: cloudData.description,
        status: cloudData.status,
        priority: cloudData.priority,
        dueDate: cloudData.due_date,
        relatedPaperId: cloudData.related_paper_id,
        relatedConferenceId: cloudData.related_conference_id,
        createdAt: cloudData.created_at,
        completedAt: cloudData.completed_at,
      };
    case 'conferences':
      return {
        id: cloudData.id,
        name: cloudData.name,
        shortName: cloudData.short_name,
        year: cloudData.year,
        deadline: cloudData.deadline,
        notificationDate: cloudData.notification_date,
        conferenceDate: cloudData.conference_date,
        website: cloudData.website,
        category: cloudData.category,
        location: cloudData.location,
        createdAt: cloudData.created_at,
      };
    default:
      return cloudData;
  }
}

// Map local entity to cloud format
function mapLocalToCloud(localData: any, type: EntityType): any {
  switch (type) {
    case 'papers':
      return {
        title: localData.title,
        authors: localData.authors,
        abstract: localData.abstract,
        source: localData.source,
        url: localData.url,
        pdfUrl: localData.pdfUrl,
        publishedDate: localData.publishedDate,
        tags: localData.tags,
        notes: localData.notes,
        isFavorite: localData.isFavorite,
      };
    case 'tasks':
      return {
        title: localData.title,
        description: localData.description,
        status: localData.status,
        priority: localData.priority,
        dueDate: localData.dueDate,
        relatedPaperId: localData.relatedPaperId,
        relatedConferenceId: localData.relatedConferenceId,
      };
    case 'conferences':
      return {
        name: localData.name,
        shortName: localData.shortName,
        year: localData.year,
        deadline: localData.deadline,
        notificationDate: localData.notificationDate,
        conferenceDate: localData.conferenceDate,
        website: localData.website,
        category: localData.category,
        location: localData.location,
      };
    default:
      return localData;
  }
}

export const syncService = {
  // Get current sync status
  async getStatus(): Promise<SyncStatus> {
    const user = auth.getCurrentUser();
    if (!user?.isCloudMode) {
      return {
        lastSyncTime: readJSON(STORAGE_KEYS.LAST_SYNC, null),
        entityCounts: {},
        isSyncing: false,
      };
    }
    
    try {
      const status = await apiRequest<{
        lastSyncTime: string | null;
        entityCounts: Record<string, number>;
      }>('/sync/status');
      
      return {
        ...status,
        isSyncing: false,
      };
    } catch (error) {
      console.error('[Sync] Failed to get status:', error);
      return {
        lastSyncTime: readJSON(STORAGE_KEYS.LAST_SYNC, null),
        entityCounts: {},
        isSyncing: false,
        error: String(error),
      };
    }
  },

  // Initial sync - export all local data to cloud
  async initialSync(): Promise<void> {
    const user = auth.getCurrentUser();
    if (!user?.isCloudMode) {
      console.log('[Sync] Not in cloud mode, skipping initial sync');
      return;
    }
    
    console.log('[Sync] Starting initial sync...');
    
    const entityTypes: EntityType[] = ['papers', 'tasks', 'conferences', 'submissions', 'reminders'];
    
    for (const type of entityTypes) {
      const localKey = getLocalKey(type);
      const localData = readJSON<any[]>(localKey, []);
      
      for (const item of localData) {
        try {
          await apiRequest(`/${type}`, {
            method: 'POST',
            body: JSON.stringify(mapLocalToCloud(item, type)),
          });
        } catch (error) {
          console.error(`[Sync] Failed to sync ${type} item:`, error);
        }
      }
    }
    
    const now = new Date().toISOString();
    writeJSON(STORAGE_KEYS.LAST_SYNC, now);
    
    console.log('[Sync] Initial sync completed');
  },

  // Pull changes from cloud
  async pullChanges(since?: string): Promise<void> {
    const user = auth.getCurrentUser();
    if (!user?.isCloudMode) return;
    
    try {
      const query = since ? `?since=${encodeURIComponent(since)}` : '';
      const response = await apiRequest<{ changes: SyncChange[] }>(`/sync/changes${query}`);
      
      // Process changes and update local storage
      for (const change of response.changes) {
        const type = change.entity_type as EntityType;
        const localKey = getLocalKey(type);
        const localData = readJSON<any[]>(localKey, []);
        
        if (change.action === 'delete') {
          const filtered = localData.filter((item: any) => item.id !== change.entity_id);
          writeJSON(localKey, filtered);
        } else {
          // For create/update, fetch the full entity
          const entity = await apiRequest<any>(`/${type}/${change.entity_id}`);
          const mapped = mapCloudToLocal(entity, type);
          
          const existingIndex = localData.findIndex((item: any) => item.id === change.entity_id);
          if (existingIndex >= 0) {
            localData[existingIndex] = mapped;
          } else {
            localData.push(mapped);
          }
          
          writeJSON(localKey, localData);
        }
      }
      
      console.log(`[Sync] Pulled ${response.changes.length} changes`);
    } catch (error) {
      console.error('[Sync] Failed to pull changes:', error);
      throw error;
    }
  },

  // Push local changes to cloud
  async pushChanges(type: EntityType, action: 'create' | 'update' | 'delete', item: any): Promise<void> {
    const user = auth.getCurrentUser();
    if (!user?.isCloudMode) return;
    
    const endpoint = `/${type}${action !== 'create' ? `/${item.id}` : ''}`;
    const method = action === 'delete' ? 'DELETE' : action === 'create' ? 'POST' : 'PUT';
    
    try {
      await apiRequest(endpoint, {
        method,
        body: action !== 'delete' ? JSON.stringify(mapLocalToCloud(item, type)) : undefined,
      });
      
      console.log(`[Sync] Pushed ${action} for ${type} item`);
    } catch (error) {
      console.error(`[Sync] Failed to push ${action} for ${type}:`, error);
      throw error;
    }
  },

  // Full sync - pull all data from cloud and replace local
  async fullSync(): Promise<void> {
    const user = auth.getCurrentUser();
    if (!user?.isCloudMode) {
      console.log('[Sync] Not in cloud mode, skipping full sync');
      return;
    }
    
    console.log('[Sync] Starting full sync...');
    
    try {
      const response = await apiRequest<{
        papers: any[];
        tasks: any[];
        conferences: any[];
        exportedAt: string;
      }>('/sync/export');
      
      // Map and save each entity type
      if (response.papers) {
        const papers = response.papers.map((p: any) => mapCloudToLocal(p, 'papers'));
        writeJSON(STORAGE_KEYS.PAPERS, papers);
      }
      
      if (response.tasks) {
        const tasks = response.tasks.map((t: any) => mapCloudToLocal(t, 'tasks'));
        writeJSON(STORAGE_KEYS.TASKS, tasks);
      }
      
      if (response.conferences) {
        const conferences = response.conferences.map((c: any) => mapCloudToLocal(c, 'conferences'));
        writeJSON(STORAGE_KEYS.CONFERENCES, conferences);
      }
      
      const now = new Date().toISOString();
      writeJSON(STORAGE_KEYS.LAST_SYNC, now);
      
      console.log('[Sync] Full sync completed');
    } catch (error) {
      console.error('[Sync] Full sync failed:', error);
      throw error;
    }
  },
};

export default syncService;
