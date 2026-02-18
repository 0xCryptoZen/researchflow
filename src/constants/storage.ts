export const STORAGE_KEYS = {
  USER: 'researchflow_user',
  PAPERS: 'researchflow_papers',
  TASKS: 'researchflow_tasks',
  CONFERENCES: 'researchflow_conferences',
  REMINDERS: 'researchflow_reminders',
  REFERENCES: 'researchflow_references',
  SUBMISSIONS: 'researchflow_submissions',
  OUTLINES: 'researchflow_outlines',
  CHARTS: 'researchflow_charts',
  WRITING_PROGRESS: 'researchflow_writing_progress',
  DB: 'researchflow_db',
  SYNC_STATUS: 'researchflow_sync_status',
  LAST_SYNC: 'researchflow_last_sync',
} as const;

const LEGACY_STORAGE_KEY_MAP: Record<string, string[]> = {
  [STORAGE_KEYS.USER]: ['user'],
  [STORAGE_KEYS.PAPERS]: ['papers'],
  [STORAGE_KEYS.TASKS]: ['tasks'],
  [STORAGE_KEYS.CONFERENCES]: ['conferences'],
  [STORAGE_KEYS.REMINDERS]: ['reminders'],
  [STORAGE_KEYS.REFERENCES]: ['references'],
  [STORAGE_KEYS.SUBMISSIONS]: ['submissions'],
  [STORAGE_KEYS.OUTLINES]: ['outlines'],
  [STORAGE_KEYS.CHARTS]: ['charts'],
  [STORAGE_KEYS.WRITING_PROGRESS]: ['writingProgress'],
};

export function migrateLegacyStorage(): void {
  try {
    for (const [targetKey, legacyKeys] of Object.entries(LEGACY_STORAGE_KEY_MAP)) {
      if (localStorage.getItem(targetKey) !== null) continue;

      for (const legacyKey of legacyKeys) {
        const legacyValue = localStorage.getItem(legacyKey);
        if (legacyValue !== null) {
          localStorage.setItem(targetKey, legacyValue);
          break;
        }
      }
    }
  } catch (error) {
    console.error('Failed to migrate legacy storage:', error);
  }
}
