// Offline Service - Network Detection and Offline Sync
import type { EntityType } from './sync';
import { syncService } from './sync';
import { offlineDB } from './indexeddb';
import { auth } from './auth';

const MAX_RETRIES = 3;
const SYNC_DEBOUNCE_MS = 2000;

let isOnline = navigator.onLine;
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;

// Network status event listeners
function setupNetworkListeners() {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

function handleOnline() {
  console.log('[Offline] Network is online');
  isOnline = true;
  // Trigger sync when coming back online
  syncPendingOperations();
}

function handleOffline() {
  console.log('[Offline] Network is offline');
  isOnline = false;
}

// Queue operation for offline sync
export async function queueOperation(
  operation: 'create' | 'update' | 'delete',
  entityType: EntityType,
  entityId: string,
  data?: any
): Promise<void> {
  // Add to IndexedDB queue
  await offlineDB.addToQueue(operation, entityType, entityId, data);
  
  console.log(`[Offline] Queued ${operation} for ${entityType}:${entityId}`);
  
  // If online, try to sync immediately
  if (isOnline) {
    scheduleSync();
  }
}

// Sync all pending operations
export async function syncPendingOperations(): Promise<void> {
  const user = auth.getCurrentUser();
  if (!user?.isCloudMode) {
    console.log('[Offline] Not in cloud mode, skipping sync');
    return;
  }
  
  if (!isOnline) {
    console.log('[Offline] Network is offline, cannot sync');
    return;
  }
  
  if (isSyncing) {
    console.log('[Offline] Sync already in progress');
    return;
  }
  
  isSyncing = true;
  
  try {
    const queue = await offlineDB.getQueue();
    console.log(`[Offline] Processing ${queue.length} queued operations`);
    
    for (const item of queue) {
      try {
        await syncService.pushChanges(
          item.entityType as EntityType,
          item.operation,
          { id: item.entityId, ...item.data }
        );
        
        // Remove from queue on success
        await offlineDB.removeFromQueue(item.id);
        console.log(`[Offline] Synced ${item.operation} for ${item.entityType}:${item.entityId}`);
      } catch (error) {
        console.error(`[Offline] Failed to sync ${item.operation} for ${item.entityType}:${item.entityId}:`, error);
        
        // Increment retry count
        if (item.retries < MAX_RETRIES) {
          console.log(`[Offline] Will retry (${item.retries + 1}/${MAX_RETRIES})`);
        } else {
          console.error(`[Offline] Max retries exceeded, removing from queue`);
          await offlineDB.removeFromQueue(item.id);
        }
      }
    }
    
    // Update last sync time
    await offlineDB.setMeta('lastSync', new Date().toISOString());
  } finally {
    isSyncing = false;
  }
}

// Schedule sync with debounce
function scheduleSync() {
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }
  
  syncDebounceTimer = setTimeout(() => {
    syncPendingOperations();
  }, SYNC_DEBOUNCE_MS);
}

// Get offline status
export function getOnlineStatus(): boolean {
  return isOnline;
}

// Get pending operations count
export async function getPendingCount(): Promise<number> {
  return offlineDB.getQueueCount();
}

// Initialize offline service
export function initOfflineService(): void {
  setupNetworkListeners();
  
  // Check initial status
  isOnline = navigator.onLine;
  console.log(`[Offline] Initialized, online: ${isOnline}`);
  
  // If online on init, try to sync
  if (isOnline) {
    syncPendingOperations();
  }
}

// Clear all offline data
export async function clearOfflineData(): Promise<void> {
  await offlineDB.clearQueue();
  console.log('[Offline] Cleared all offline data');
}

// Export for use
export const offlineService = {
  init: initOfflineService,
  isOnline: () => isOnline,
  queueOperation,
  syncPendingOperations,
  getPendingCount,
  clearOfflineData,
};

export default offlineService;
