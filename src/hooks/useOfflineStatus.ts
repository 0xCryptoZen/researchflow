// Hook for offline status and pending sync count
import { useState, useEffect } from 'react';
import { getOnlineStatus, getPendingCount, syncPendingOperations } from '../services/offline';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(getOnlineStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get initial pending count
    getPendingCount().then(setPendingCount);

    // Poll for pending count changes
    const interval = setInterval(async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    await syncPendingOperations();
    const count = await getPendingCount();
    setPendingCount(count);
  };

  return {
    isOnline,
    pendingCount,
    isOffline: !isOnline,
    hasPendingSync: pendingCount > 0,
    triggerSync,
  };
}

export default useOfflineStatus;
