/**
 * User Data Sync Hook
 * 用户数据同步钩子
 */

import { useState, useEffect, useCallback } from 'react';
import db from '../services/db';
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, writeJSON } from '../services/storage';

interface SyncStatus {
  lastSync: string | null;
  pending: boolean;
  error: string | null;
}

const SYNC_STATUS_KEY = STORAGE_KEYS.SYNC_STATUS;

export function useUserSync(userId: string | null) {
  const [status, setStatus] = useState<SyncStatus>(() => {
    return readJSON<SyncStatus>(SYNC_STATUS_KEY, { lastSync: null, pending: false, error: null });
  });

  // 保存同步状态
  useEffect(() => {
    writeJSON(SYNC_STATUS_KEY, status);
  }, [status]);

  // 同步到服务器（模拟）
  const syncToServer = useCallback(async () => {
    if (!userId) return;

    setStatus(s => ({ ...s, pending: true, error: null }));

    try {
      // 导出本地数据
      const payload = db.export();
      console.log('Syncing payload size:', payload.length);
      
      // TODO: 这里可以替换为实际的 Cloudflare D1 API 调用
      // await fetch('/api/sync', { method: 'POST', body: payload })
      
      // 模拟网络延迟
      await new Promise(r => setTimeout(r, 500));
      
      setStatus({
        lastSync: new Date().toISOString(),
        pending: false,
        error: null,
      });
      
      console.log('✅ Data synced to server');
    } catch (error: any) {
      setStatus(s => ({ ...s, pending: false, error: error.message }));
      console.error('❌ Sync failed:', error);
    }
  }, [userId]);

  // 从服务器同步（模拟）
  const syncFromServer = useCallback(async () => {
    if (!userId) return;

    setStatus(s => ({ ...s, pending: true, error: null }));

    try {
      // TODO: 这里可以替换为实际的 Cloudflare D1 API 调用
      // const response = await fetch('/api/sync');
      // const serverData = await response.json();
      // db.import(serverData);
      
      // 模拟
      await new Promise(r => setTimeout(r, 500));
      
      setStatus({
        lastSync: new Date().toISOString(),
        pending: false,
        error: null,
      });
      
      console.log('✅ Data synced from server');
    } catch (error: any) {
      setStatus(s => ({ ...s, pending: false, error: error.message }));
      console.error('❌ Sync failed:', error);
    }
  }, [userId]);

  // 自动同步（当数据变化时）
  useEffect(() => {
    if (!userId || status.pending) return;

    const interval = setInterval(() => {
      syncToServer();
    }, 30000); // 每30秒自动同步

    return () => clearInterval(interval);
  }, [userId, status.pending, syncToServer]);

  return {
    ...status,
    syncToServer,
    syncFromServer,
  };
}

export default useUserSync;
