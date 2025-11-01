// Service để frontend poll và xử lý webhook data từ Pancake POS
// Sử dụng localStorage để lưu trữ sau khi xử lý

import { Product, Order, Customer } from '@/types';
import { addProduct, updateProduct, addCustomer, addOrder, updateOrder } from '@/lib/storage';

interface WebhookQueueItem {
  id: string;
  event: string;
  store_id?: string;
  payload: any;
  processed: boolean;
  created_at: string;
}

// Sử dụng relative URL khi ở development, absolute URL khi ở production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://anhuyhoadon-g3gc.vercel.app/api');

export class WebhookProcessor {
  private pollingInterval: number | null = null;
  private isProcessing = false;

  // Bắt đầu polling để lấy webhook data
  startPolling(intervalMs: number = 5000) {
    if (this.pollingInterval) {
      this.stopPolling();
    }

    this.pollingInterval = window.setInterval(() => {
      this.processPendingWebhooks();
    }, intervalMs);

    // Xử lý ngay lập tức
    this.processPendingWebhooks();
  }

  // Dừng polling
  stopPolling() {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Lấy pending webhook data từ API
  private async fetchPendingWebhooks(): Promise<WebhookQueueItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/webhook-queue?processed=false&limit=10`);
      if (!response.ok) {
        console.error('Failed to fetch webhook queue:', response.statusText);
        return [];
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching webhook queue:', error);
      return [];
    }
  }

  // Đánh dấu webhook đã xử lý
  private async markAsProcessed(ids: string[]): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/webhook-processed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
    } catch (error) {
      console.error('Error marking webhooks as processed:', error);
    }
  }

  // Xử lý webhook payload và lưu vào localStorage
  private async processWebhookPayload(item: WebhookQueueItem): Promise<boolean> {
    try {
      const { event, payload } = item;

      switch (event) {
        case 'product.created':
        case 'product.updated':
          await this.processProduct(payload);
          break;

        case 'order.created':
        case 'order.updated':
          await this.processOrder(payload);
          break;

        case 'customer.created':
        case 'customer.updated':
          await this.processCustomer(payload);
          break;

        case 'inventory.updated':
          await this.processInventory(payload);
          break;

        default:
          console.warn(`Unknown event type: ${event}`);
          return false;
      }

      return true;
    } catch (error) {
      console.error(`Error processing webhook ${item.id}:`, error);
      return false;
    }
  }

  // Xử lý sản phẩm
  private async processProduct(payload: any): Promise<void> {
    const product: Product = {
      id: `pancake_${payload.id}`,
      code: payload.code || payload.sku || payload.id,
      name: payload.name,
      price: payload.price || 0,
      stock: payload.stock || payload.inventory || 0,
      image: payload.image,
      category: payload.category,
      description: payload.description,
      createdAt: payload.created_at || new Date().toISOString(),
      updatedAt: payload.updated_at || new Date().toISOString(),
    };

    // Kiểm tra sản phẩm đã tồn tại chưa
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const existingIndex = products.findIndex((p: Product) => p.id === product.id || p.code === product.code);

    if (existingIndex >= 0) {
      updateProduct(product.id, product);
    } else {
      addProduct(product);
    }
  }

  // Xử lý đơn hàng
  private async processOrder(payload: any): Promise<void> {
    // Tìm hoặc tạo customer trước
    let customerId: string | undefined = undefined;
    if (payload.customer_id || payload.customerId) {
      const customerData = payload.customer || payload;
      const customer: Customer = {
        id: `pancake_${payload.customer_id || payload.customerId}`,
        name: customerData.customer_name || customerData.customerName || '',
        phone: customerData.customer_phone || customerData.customerPhone || '',
        email: customerData.email || '',
        addresses: [{
          id: Date.now().toString(),
          recipientName: customerData.customer_name || customerData.customerName || '',
          recipientPhone: customerData.customer_phone || customerData.customerPhone || '',
          province: customerData.province || '',
          district: customerData.district || '',
          ward: customerData.ward || '',
          street: customerData.address || '',
          fullAddress: [
            customerData.address,
            customerData.ward,
            customerData.district,
            customerData.province
          ].filter(Boolean).join(', '),
          isDefault: true,
        }],
        totalOrders: 0,
        successfulOrders: 0,
        totalSpent: 0,
        createdAt: customerData.created_at || new Date().toISOString(),
        updatedAt: customerData.updated_at || new Date().toISOString(),
      };

      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const existingCustomer = customers.find((c: Customer) => c.phone === customer.phone);
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        addCustomer(customer);
        customerId = customer.id;
      }
    }

    const items = (payload.items || []).map((item: any, index: number) => ({
      id: `${payload.id}_item_${index}`,
      productId: `pancake_${item.product_id || item.productId}`,
      productCode: item.product_code || item.productCode || '',
      productName: item.product_name || item.productName || '',
      quantity: item.quantity || 0,
      price: item.price || 0,
      discount: item.discount || 0,
      total: item.total || (item.quantity * item.price),
    }));

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const discountAmount = payload.discount_amount || payload.discount || 0;
    const shippingFee = payload.shipping_fee || payload.shippingFee || 0;
    const taxAmount = payload.tax_amount || payload.taxAmount || 0;
    const finalAmount = payload.final_amount || payload.finalAmount || (totalAmount - discountAmount + shippingFee + taxAmount);
    const paid = payload.paid_amount || payload.paidAmount || 0;

    const order: Order = {
      id: `pancake_${payload.id}`,
      orderNumber: payload.order_number || payload.orderNumber || payload.id,
      customerId: customerId || payload.customer_id || payload.customerId || 'unknown',
      customerName: payload.customer_name || payload.customerName || '',
      customerPhone: payload.customer_phone || payload.customerPhone || '',
      items,
      payment: {
        totalAmount,
        discount: 0,
        discountAmount,
        shippingFee,
        tax: payload.tax || 0,
        taxAmount,
        additionalFee: 0,
        bankTransfer: 0,
        finalAmount,
        paid,
        remaining: Math.max(0, finalAmount - paid),
        cod: Math.max(0, finalAmount - paid),
      },
      shipping: {
        recipientName: payload.shipping_address?.recipient_name || payload.customer_name || '',
        recipientPhone: payload.shipping_address?.recipient_phone || payload.customer_phone || '',
        address: payload.shipping_address?.address || payload.shipping_address || '',
        province: payload.shipping_address?.province || '',
        district: payload.shipping_address?.district || '',
        ward: payload.shipping_address?.ward || '',
        freeShipping: !shippingFee || shippingFee === 0,
      },
      notes: [],
      status: this.mapOrderStatus(payload.status),
      tags: [],
      printCount: 0,
      createdAt: payload.created_at || payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updated_at || payload.updatedAt || new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const existingIndex = orders.findIndex((o: Order) => o.id === order.id || o.orderNumber === order.orderNumber);

    if (existingIndex >= 0) {
      updateOrder(order.id, order);
    } else {
      addOrder(order);
    }
  }

  // Xử lý khách hàng
  private async processCustomer(payload: any): Promise<void> {
    const customer: Customer = {
      id: `pancake_${payload.id}`,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      addresses: [{
        id: Date.now().toString(),
        recipientName: payload.name,
        recipientPhone: payload.phone || '',
        province: payload.province || '',
        district: payload.district || '',
        ward: payload.ward || '',
        street: payload.address || '',
        fullAddress: [
          payload.address,
          payload.ward,
          payload.district,
          payload.province
        ].filter(Boolean).join(', '),
        isDefault: true,
      }],
      totalOrders: 0,
      successfulOrders: 0,
      totalSpent: 0,
      createdAt: payload.created_at || new Date().toISOString(),
      updatedAt: payload.updated_at || new Date().toISOString(),
    };

    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const existingIndex = customers.findIndex((c: Customer) => c.id === customer.id || c.phone === customer.phone);

    if (existingIndex >= 0) {
      // Update customer logic here if needed
      customers[existingIndex] = { ...customers[existingIndex], ...customer };
      localStorage.setItem('customers', JSON.stringify(customers));
    } else {
      addCustomer(customer);
    }
  }

  // Xử lý tồn kho
  private async processInventory(payload: any): Promise<void> {
    const productId = `pancake_${payload.product_id || payload.productId}`;
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productIndex = products.findIndex((p: Product) => p.id === productId);

    if (productIndex >= 0) {
      products[productIndex].stock = payload.stock || payload.quantity || 0;
      products[productIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('products', JSON.stringify(products));
    }
  }

  // Map order status
  private mapOrderStatus(status: string): Order['status'] {
    const statusMap: Record<string, Order['status']> = {
      'new': 'new',
      'pending': 'new',
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipping': 'shipping',
      'delivered': 'delivered',
      'completed': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'returned',
    };
    return statusMap[status?.toLowerCase()] || 'new';
  }

  // Xử lý tất cả pending webhooks
  private async processPendingWebhooks(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      const items = await this.fetchPendingWebhooks();
      
      if (items.length === 0) {
        return;
      }

      const processedIds: string[] = [];
      
      for (const item of items) {
        const success = await this.processWebhookPayload(item);
        if (success) {
          processedIds.push(item.id);
        }
      }

      if (processedIds.length > 0) {
        await this.markAsProcessed(processedIds);
        console.log(`✅ Processed ${processedIds.length} webhook(s)`);
      }
    } catch (error) {
      console.error('Error processing webhooks:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

// Singleton instance
export const webhookProcessor = new WebhookProcessor();

