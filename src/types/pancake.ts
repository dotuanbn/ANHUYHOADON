// Types for Pancake POS integration

export interface PancakeIntegrationConfig {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  storeId?: string;
  lastSyncAt?: string;
  autoSyncEnabled: boolean;
  autoSyncInterval: number; // minutes
  syncProducts: boolean;
  syncOrders: boolean;
  syncDirection: 'from_pancake' | 'to_pancake' | 'bidirectional';
}

export interface PancakeProduct {
  id: string;
  code: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  category?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PancakeOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: PancakeOrderItem[];
  totalAmount: number;
  discount?: number;
  shippingFee?: number;
  tax?: number;
  finalAmount: number;
  paid?: number;
  status: string;
  paymentMethod?: string;
  shippingAddress?: {
    recipientName: string;
    recipientPhone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PancakeOrderItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface SyncResult {
  success: boolean;
  type: 'products' | 'orders';
  message: string;
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errors: SyncError[];
  duration: number; // milliseconds
  timestamp: string;
}

export interface SyncError {
  itemId?: string;
  itemType: 'product' | 'order';
  message: string;
  code?: string;
}

export interface SyncProgress {
  total: number;
  processed: number;
  current: string;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  startTime?: string;
  estimatedTimeRemaining?: number;
}

export interface ProductMapping {
  pancakeId: string;
  localId: string;
  lastSyncedAt: string;
}

export interface OrderMapping {
  pancakeId: string;
  localId: string;
  lastSyncedAt: string;
}

