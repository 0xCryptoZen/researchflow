/**
 * Dashboard Data Hook
 * 仪表盘数据加载钩子
 */

import { useState, useEffect, useCallback } from 'react';
import { papersRepository } from '@/repositories/papersRepository';
import { tasksRepository } from '@/repositories/tasksRepository';
import { conferencesRepository } from '@/repositories/conferencesRepository';
import { submissionsRepository } from '@/repositories/submissionsRepository';
import { STORAGE_UPDATED_EVENT } from '@/services/storage';
import { syncService } from '@/services/sync';
import { auth } from '@/services/auth';
import type { DashboardStats, SyncStatus } from '@/types';

interface UseDashboardDataResult {
  stats: DashboardStats;
  syncStatus: SyncStatus;
  isLoading: boolean;
  refresh: () => void;
  triggerSync: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
  const user = auth.getCurrentUser();
  const isCloudMode = user?.isCloudMode === true;

  const [stats, setStats] = useState<DashboardStats>({
    papersCount: 0,
    tasksCount: 0,
    completedTasksCount: 0,
    conferencesCount: 0,
    submissionsCount: 0,
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    pending: false,
    error: null,
    isCloudMode,
  });

  const loadStats = useCallback(() => {
    const allTasks = tasksRepository.getAll();
    setStats({
      papersCount: papersRepository.getAll().length,
      tasksCount: allTasks.length,
      completedTasksCount: allTasks.filter(t => t.status === 'completed').length,
      conferencesCount: conferencesRepository.getAll().length,
      submissionsCount: submissionsRepository.getAll().length,
    });
  }, []);

  const loadSyncStatus = useCallback(async () => {
    if (isCloudMode) {
      try {
        const status = await syncService.getStatus();
        setSyncStatus({
          lastSync: status.lastSyncTime,
          pending: false,
          error: status.error || null,
          isCloudMode: true,
        });
      } catch (err) {
        setSyncStatus(s => ({ ...s, error: String(err), isCloudMode: true }));
      }
    }
  }, [isCloudMode]);

  const refresh = useCallback(() => {
    loadStats();
    loadSyncStatus();
  }, [loadStats, loadSyncStatus]);

  const triggerSync = useCallback(async () => {
    if (!isCloudMode) {
      // Local mode - just simulate sync
      setSyncStatus(s => ({ ...s, pending: true }));
      setTimeout(() => {
        setSyncStatus(s => ({
          ...s,
          lastSync: new Date().toISOString(),
          pending: false,
          error: null,
          isCloudMode: false,
        }));
      }, 1000);
      return;
    }

    setSyncStatus(s => ({ ...s, pending: true, error: null }));

    try {
      await syncService.fullSync();
      const status = await syncService.getStatus();
      setSyncStatus(s => ({
        ...s,
        lastSync: status.lastSyncTime,
        pending: false,
        error: null,
        isCloudMode: true,
      }));
      refresh();
    } catch (err) {
      setSyncStatus(s => ({
        ...s,
        pending: false,
        error: String(err),
        isCloudMode: true,
      }));
    }
  }, [isCloudMode, refresh]);

  useEffect(() => {
    loadStats();
    if (isCloudMode) {
      loadSyncStatus();
    }
  }, [loadStats, loadSyncStatus, isCloudMode]);

  useEffect(() => {
    const handleStorageUpdated = () => loadStats();
    const handleFocus = () => {
      loadStats();
      if (isCloudMode) loadSyncStatus();
    };

    window.addEventListener(STORAGE_UPDATED_EVENT, handleStorageUpdated);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener(STORAGE_UPDATED_EVENT, handleStorageUpdated);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadStats, loadSyncStatus, isCloudMode]);

  return {
    stats,
    syncStatus,
    isLoading: false,
    refresh,
    triggerSync,
  };
}

export default useDashboardData;
