// Auto-sync service for Pancake POS

import { getPancakeConfig } from './pancakeConfig';
import { PancakeSyncService } from './pancakeSync';

let autoSyncInterval: NodeJS.Timeout | null = null;

export const startAutoSync = (): void => {
  stopAutoSync();

  const config = getPancakeConfig();
  if (!config.enabled || !config.autoSyncEnabled) {
    return;
  }

  const sync = async () => {
    try {
      const syncService = new PancakeSyncService(config);
      await syncService.syncAll();
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  };

  const intervalMs = config.autoSyncInterval * 60 * 1000;
  autoSyncInterval = setInterval(sync, intervalMs);

  sync();
};

export const stopAutoSync = (): void => {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }
};

export const checkAndStartAutoSync = (): void => {
  const config = getPancakeConfig();
  if (config.enabled && config.autoSyncEnabled) {
    startAutoSync();
  } else {
    stopAutoSync();
  }
};

