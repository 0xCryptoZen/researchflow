// IndexedDB Service - Offline Data Storage and Operation Queue
import type { EntityType } from './sync';

const DB_NAME = 'researchflow-offline';
const DB_VERSION = 1;

// Object Store names
const STORES = {
  DATA: 'offline_data',      // Cached entity data
  QUEUE: 'operation_queue',  // Pending operations
  META: 'meta',              // Metadata like last sync time
} as const;

// Database instance
let db: IDBDatabase | null = null;

// Open database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database');
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('[IndexedDB] Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      console.log('[IndexedDB] Upgrading database...');

      // Create offline_data store
      if (!database.objectStoreNames.contains(STORES.DATA)) {
        const dataStore = database.createObjectStore(STORES.DATA, { keyPath: 'id' });
        dataStore.createIndex('type', 'type', { unique: false });
        dataStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Create operation_queue store
      if (!database.objectStoreNames.contains(STORES.QUEUE)) {
        const queueStore = database.createObjectStore(STORES.QUEUE, { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('type', 'type', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create meta store
      if (!database.objectStoreNames.contains(STORES.META)) {
        database.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };
  });
}

// Generic CRUD operations for offline data
export const offlineDB = {
  // Save entity data to offline store
  async saveData<T extends { id: string }>(
    type: EntityType,
    data: T
  ): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DATA], 'readwrite');
      const store = transaction.objectStore(STORES.DATA);
      
      const record = {
        ...data,
        type,
        updatedAt: new Date().toISOString(),
      };
      
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Save multiple entities
  async saveBulkData<T extends { id: string }>(
    type: EntityType,
    items: T[]
  ): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DATA], 'readwrite');
      const store = transaction.objectStore(STORES.DATA);
      
      items.forEach((item) => {
        store.put({
          ...item,
          type,
          updatedAt: new Date().toISOString(),
        });
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  // Get entity by ID
  async getData<T>(type: EntityType, id: string): Promise<T | null> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DATA], 'readonly');
      const store = transaction.objectStore(STORES.DATA);
      const index = store.index('type');
      const request = index.get([type, id]);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Get all entities of a type
  async getAllData<T>(type: EntityType): Promise<T[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DATA], 'readonly');
      const store = transaction.objectStore(STORES.DATA);
      const index = store.index('type');
      const request = index.getAll(type);
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Delete entity
  async deleteData(type: EntityType, id: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DATA], 'readwrite');
      const store = transaction.objectStore(STORES.DATA);
      const index = store.index('type');
      const request = index.getKey([type, id]);
      
      request.onsuccess = () => {
        if (request.result !== undefined) {
          store.delete(request.result);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Clear all data of a type
  async clearData(type: EntityType): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.DATA], 'readwrite');
      const store = transaction.objectStore(STORES.DATA);
      const index = store.index('type');
      const request = index.openCursor(IDBKeyRange.only(type));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  // Operation queue methods
  async addToQueue(
    operation: 'create' | 'update' | 'delete',
    entityType: EntityType,
    entityId: string,
    data?: any
  ): Promise<number> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);
      
      const record = {
        operation,
        entityType,
        entityId,
        data,
        timestamp: new Date().toISOString(),
        retries: 0,
      };
      
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  },

  // Get all pending operations
  async getQueue(): Promise<Array<{
    id: number;
    operation: 'create' | 'update' | 'delete';
    entityType: EntityType;
    entityId: string;
    data?: any;
    timestamp: string;
    retries: number;
  }>> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.QUEUE], 'readonly');
      const store = transaction.objectStore(STORES.QUEUE);
      const index = store.index('timestamp');
      const request = index.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  // Remove operation from queue
  async removeFromQueue(id: number): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Clear entire queue
  async clearQueue(): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Get queue count
  async getQueueCount(): Promise<number> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.QUEUE], 'readonly');
      const store = transaction.objectStore(STORES.QUEUE);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Metadata methods
  async setMeta(key: string, value: any): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.META], 'readwrite');
      const store = transaction.objectStore(STORES.META);
      const request = store.put({ key, value });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getMeta<T>(key: string): Promise<T | null> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.META], 'readonly');
      const store = transaction.objectStore(STORES.META);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  },
};

// Export for use
export default offlineDB;
