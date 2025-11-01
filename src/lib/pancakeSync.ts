// Smart sync logic for Pancake POS integration

import { PancakePOSService } from './pancakeService';
import {
  PancakeIntegrationConfig,
  SyncResult,
  SyncError,
  SyncProgress,
  ProductMapping,
  OrderMapping,
} from '@/types/pancake';
import { Product, Order, Customer } from '@/types';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  getProductByCode,
  getOrders,
  addOrder,
  updateOrder,
  getOrderById,
  getCustomers,
  addCustomer,
  getCustomerByPhone,
} from './storage';

const SYNC_MAPPING_KEY = 'pancakeSyncMappings';

interface SyncMappings {
  products: ProductMapping[];
  orders: OrderMapping[];
  lastSyncAt: string;
}

const getSyncMappings = (): SyncMappings => {
  const stored = localStorage.getItem(SYNC_MAPPING_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { products: [], orders: [], lastSyncAt: '' };
    }
  }
  return { products: [], orders: [], lastSyncAt: '' };
};

const saveSyncMappings = (mappings: SyncMappings): void => {
  localStorage.setItem(SYNC_MAPPING_KEY, JSON.stringify(mappings));
};

export class PancakeSyncService {
  private pancakeService: PancakePOSService;
  private config: PancakeIntegrationConfig;
  private onProgress?: (progress: SyncProgress) => void;

  constructor(config: PancakeIntegrationConfig, onProgress?: (progress: SyncProgress) => void) {
    this.config = {
      ...config,
      // Nếu không có API Secret, tự động dùng API Key
      apiSecret: config.apiSecret || config.apiKey,
    };
    this.pancakeService = new PancakePOSService(this.config);
    this.onProgress = onProgress;
  }

  private updateProgress(current: string, processed: number, total: number): void {
    if (this.onProgress) {
      const progress: SyncProgress = {
        total,
        processed,
        current,
        status: processed < total ? 'syncing' : 'completed',
      };
      this.onProgress(progress);
    }
  }

  async syncProducts(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: SyncError[] = [];
    let itemsProcessed = 0;
    let itemsCreated = 0;
    let itemsUpdated = 0;
    let itemsSkipped = 0;

    try {
      const mappings = getSyncMappings();
      const localProducts = getProducts();
      const productMap = new Map(localProducts.map(p => [p.code, p]));

      let page = 1;
      let hasMore = true;
      const limit = 100;

      while (hasMore) {
        const response = await this.pancakeService.getProducts({
          page,
          limit,
          updatedSince: this.config.lastSyncAt,
        });

        const pancakeProducts = response.products;
        this.updateProgress(
          `Đang đồng bộ sản phẩm (trang ${page})...`,
          itemsProcessed,
          response.total
        );

        for (const pancakeProduct of pancakeProducts) {
          try {
            itemsProcessed++;

            const existingMapping = mappings.products.find(
              m => m.pancakeId === pancakeProduct.id
            );

            const existingLocal = existingMapping
              ? localProducts.find(p => p.id === existingMapping.localId)
              : productMap.get(pancakeProduct.code || pancakeProduct.id);

            if (existingLocal) {
              const updatedProduct = this.pancakeService.mapPancakeProductToLocal(
                pancakeProduct,
                existingLocal.id
              );

              const pancakeUpdated = new Date(pancakeProduct.updatedAt).getTime();
              const localUpdated = new Date(existingLocal.updatedAt).getTime();

              if (pancakeUpdated > localUpdated) {
                updateProduct(existingLocal.id, {
                  ...updatedProduct,
                  updatedAt: new Date().toISOString(),
                });

                if (existingMapping) {
                  existingMapping.lastSyncedAt = new Date().toISOString();
                } else {
                  mappings.products.push({
                    pancakeId: pancakeProduct.id,
                    localId: existingLocal.id,
                    lastSyncedAt: new Date().toISOString(),
                  });
                }

                itemsUpdated++;
              } else {
                itemsSkipped++;
              }
            } else {
              const newProduct = this.pancakeService.mapPancakeProductToLocal(
                pancakeProduct
              );

              addProduct(newProduct);

              mappings.products.push({
                pancakeId: pancakeProduct.id,
                localId: newProduct.id,
                lastSyncedAt: new Date().toISOString(),
              });

              itemsCreated++;
            }
          } catch (error) {
            errors.push({
              itemId: pancakeProduct.id,
              itemType: 'product',
              message: error instanceof Error ? error.message : 'Unknown error',
            });
            itemsSkipped++;
          }
        }

        hasMore = response.hasMore;
        page++;
      }

      mappings.lastSyncAt = new Date().toISOString();
      saveSyncMappings(mappings);

      const duration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        type: 'products',
        message: `Đồng bộ thành công: ${itemsCreated} mới, ${itemsUpdated} cập nhật, ${itemsSkipped} bỏ qua`,
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        itemsSkipped,
        errors,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        type: 'products',
        message: error instanceof Error ? error.message : 'Lỗi đồng bộ sản phẩm',
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        itemsSkipped,
        errors: [
          ...errors,
          {
            itemType: 'product',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
        duration,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async syncOrders(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: SyncError[] = [];
    let itemsProcessed = 0;
    let itemsCreated = 0;
    let itemsUpdated = 0;
    let itemsSkipped = 0;

    try {
      const mappings = getSyncMappings();
      const localOrders = getOrders();
      const localCustomers = getCustomers();

      let page = 1;
      let hasMore = true;
      const limit = 100;

      while (hasMore) {
        const response = await this.pancakeService.getOrders({
          page,
          limit,
          updatedSince: this.config.lastSyncAt,
        });

        const pancakeOrders = response.orders;
        this.updateProgress(
          `Đang đồng bộ đơn hàng (trang ${page})...`,
          itemsProcessed,
          response.total
        );

        for (const pancakeOrder of pancakeOrders) {
          try {
            itemsProcessed++;

            const existingMapping = mappings.orders.find(
              m => m.pancakeId === pancakeOrder.id
            );

            const existingLocal = existingMapping
              ? localOrders.find(o => o.id === existingMapping.localId)
              : localOrders.find(o => o.orderNumber === pancakeOrder.orderNumber);

            let customerId = pancakeOrder.customerId;

            if (!customerId && pancakeOrder.customerPhone) {
              const existingCustomer = getCustomerByPhone(pancakeOrder.customerPhone);
              if (existingCustomer) {
                customerId = existingCustomer.id;
              } else {
                const newCustomer: Customer = {
                  id: `pancake_customer_${pancakeOrder.customerId || Date.now()}`,
                  name: pancakeOrder.customerName,
                  phone: pancakeOrder.customerPhone,
                  email: pancakeOrder.customerEmail,
                  addresses: pancakeOrder.shippingAddress ? [{
                    id: Date.now().toString(),
                    recipientName: pancakeOrder.shippingAddress.recipientName,
                    recipientPhone: pancakeOrder.shippingAddress.recipientPhone,
                    province: pancakeOrder.shippingAddress.province,
                    district: pancakeOrder.shippingAddress.district,
                    ward: pancakeOrder.shippingAddress.ward,
                    street: pancakeOrder.shippingAddress.address,
                    fullAddress: `${pancakeOrder.shippingAddress.address}, ${pancakeOrder.shippingAddress.ward}, ${pancakeOrder.shippingAddress.district}, ${pancakeOrder.shippingAddress.province}`,
                    isDefault: true,
                  }] : [],
                  totalOrders: 0,
                  successfulOrders: 0,
                  totalSpent: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                addCustomer(newCustomer);
                customerId = newCustomer.id;
              }
            }

            if (existingLocal) {
              const updatedOrder = this.pancakeService.mapPancakeOrderToLocal(
                pancakeOrder,
                existingLocal.id,
                customerId
              );

              const pancakeUpdated = new Date(pancakeOrder.updatedAt).getTime();
              const localUpdated = new Date(existingLocal.updatedAt).getTime();

              if (pancakeUpdated > localUpdated) {
                updateOrder(existingLocal.id, {
                  ...updatedOrder,
                  updatedAt: new Date().toISOString(),
                });

                if (existingMapping) {
                  existingMapping.lastSyncedAt = new Date().toISOString();
                } else {
                  mappings.orders.push({
                    pancakeId: pancakeOrder.id,
                    localId: existingLocal.id,
                    lastSyncedAt: new Date().toISOString(),
                  });
                }

                itemsUpdated++;
              } else {
                itemsSkipped++;
              }
            } else {
              const newOrder = this.pancakeService.mapPancakeOrderToLocal(
                pancakeOrder,
                undefined,
                customerId
              );

              addOrder(newOrder);

              mappings.orders.push({
                pancakeId: pancakeOrder.id,
                localId: newOrder.id,
                lastSyncedAt: new Date().toISOString(),
              });

              itemsCreated++;
            }
          } catch (error) {
            errors.push({
              itemId: pancakeOrder.id,
              itemType: 'order',
              message: error instanceof Error ? error.message : 'Unknown error',
            });
            itemsSkipped++;
          }
        }

        hasMore = response.hasMore;
        page++;
      }

      mappings.lastSyncAt = new Date().toISOString();
      saveSyncMappings(mappings);

      const duration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        type: 'orders',
        message: `Đồng bộ thành công: ${itemsCreated} mới, ${itemsUpdated} cập nhật, ${itemsSkipped} bỏ qua`,
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        itemsSkipped,
        errors,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        type: 'orders',
        message: error instanceof Error ? error.message : 'Lỗi đồng bộ đơn hàng',
        itemsProcessed,
        itemsCreated,
        itemsUpdated,
        itemsSkipped,
        errors: [
          ...errors,
          {
            itemType: 'order',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
        duration,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async syncAll(): Promise<{ products: SyncResult; orders: SyncResult }> {
    const products: SyncResult = this.config.syncProducts
      ? await this.syncProducts()
      : {
          success: true,
          type: 'products',
          message: 'Đồng bộ sản phẩm bị tắt',
          itemsProcessed: 0,
          itemsCreated: 0,
          itemsUpdated: 0,
          itemsSkipped: 0,
          errors: [],
          duration: 0,
          timestamp: new Date().toISOString(),
        };

    const orders: SyncResult = this.config.syncOrders
      ? await this.syncOrders()
      : {
          success: true,
          type: 'orders',
          message: 'Đồng bộ đơn hàng bị tắt',
          itemsProcessed: 0,
          itemsCreated: 0,
          itemsUpdated: 0,
          itemsSkipped: 0,
          errors: [],
          duration: 0,
          timestamp: new Date().toISOString(),
        };

    return { products, orders };
  }
}

