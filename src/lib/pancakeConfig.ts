// Pancake integration settings management

import { PancakeIntegrationConfig } from '@/types/pancake';

const PANCAKE_CONFIG_KEY = 'pancakeIntegrationConfig';

const DEFAULT_CONFIG: PancakeIntegrationConfig = {
  enabled: false,
  apiKey: '',
  apiSecret: '', // Có thể để trống hoặc điền cùng API Key nếu Pancake chỉ cung cấp API Key
  baseUrl: 'https://api.pancake.vn/v1',
  storeId: '',
  lastSyncAt: undefined,
  autoSyncEnabled: false,
  autoSyncInterval: 60, // minutes
  syncProducts: true,
  syncOrders: true,
  syncDirection: 'from_pancake',
};

export const getPancakeConfig = (): PancakeIntegrationConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }

  try {
    const stored = localStorage.getItem(PANCAKE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Error loading Pancake config:', error);
  }

  return DEFAULT_CONFIG;
};

export const savePancakeConfig = (config: PancakeIntegrationConfig): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(PANCAKE_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving Pancake config:', error);
  }
};

export const resetPancakeConfig = (): PancakeIntegrationConfig => {
  const defaultConfig = DEFAULT_CONFIG;
  savePancakeConfig(defaultConfig);
  return defaultConfig;
};

