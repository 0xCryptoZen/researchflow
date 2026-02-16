export const STORAGE_UPDATED_EVENT = 'researchflow:storage-updated';

function emitStorageUpdated(key: string): void {
  window.dispatchEvent(
    new CustomEvent(STORAGE_UPDATED_EVENT, {
      detail: { key },
    })
  );
}

export function readRaw(key: string): string | null {
  return localStorage.getItem(key);
}

export function writeRaw(key: string, value: string): void {
  localStorage.setItem(key, value);
  emitStorageUpdated(key);
}

export function removeKey(key: string): void {
  localStorage.removeItem(key);
  emitStorageUpdated(key);
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = readRaw(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to parse JSON for key "${key}":`, error);
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    writeRaw(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to serialize JSON for key "${key}":`, error);
  }
}
