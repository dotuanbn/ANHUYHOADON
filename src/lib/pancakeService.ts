// Enhanced Pancake POS API Service với auto-detection và multiple fallback methods

import { 
  PancakeIntegrationConfig, 
  PancakeProduct, 
  PancakeOrder, 
  SyncResult, 
  SyncError 
} from '@/types/pancake';
import { Product, Order, OrderItem, OrderStatus } from '@/types';

// Các Base URL có thể có của Pancake POS
const POSSIBLE_BASE_URLS = [
  'https://api.pancake.vn/v1',
  'https://api.pancake.vn',
  'https://pos.pancake.vn/api/v1',
  'https://pos.pancake.vn/api',
  'https://openapi.pancake.vn/v1',
];

// Các endpoint có thể có
const POSSIBLE_ENDPOINTS = {
  products: ['/products', '/api/products', '/v1/products', '/api/v1/products'],
  orders: ['/orders', '/api/orders', '/v1/orders', '/api/v1/orders'],
  test: [
    '/ping', 
    '/health', 
    '/auth/test', 
    '/api/health',
    '/api/ping',
    '/api/v1/health',
    '/v1/health',
    '/store/info',
    '/api/store/info',
    '/me',
    '/api/me',
  ],
};

export class PancakePOSService {
  private config: PancakeIntegrationConfig;
  private baseUrl: string;
  private workingEndpoint: string | null = null;
  private workingAuthMethod: string | null = null;

  constructor(config: PancakeIntegrationConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || POSSIBLE_BASE_URLS[0];
  }

  private getAuthHeaders(method: string = 'default'): Record<string, string> {
    const apiSecret = this.config.apiSecret || this.config.apiKey;
    
    const authMethods: Record<string, Record<string, string>> = {
      bearer: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      apiKeyHeader: {
        'X-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      apiKeySecret: {
        'X-API-Key': this.config.apiKey,
        'X-API-Secret': apiSecret,
        'Content-Type': 'application/json',
      },
      apiKeyStoreId: {
        'X-API-Key': this.config.apiKey,
        'X-Store-ID': this.config.storeId || '',
        'Content-Type': 'application/json',
      },
      bearerStoreId: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Store-ID': this.config.storeId || '',
        'Content-Type': 'application/json',
      },
      // Thử với tất cả headers cùng lúc
      fullHeaders: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Key': this.config.apiKey,
        'X-API-Secret': apiSecret,
        'X-Store-ID': this.config.storeId || '',
        'Content-Type': 'application/json',
      },
      // Thử với API Key trong header khác
      apikeyLowercase: {
        'apikey': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      // Thử với token thay vì Bearer
      token: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      default: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...(apiSecret && { 'X-API-Secret': apiSecret }),
        ...(this.config.storeId && { 'X-Store-ID': this.config.storeId }),
      },
    };

    return authMethods[method] || authMethods.default;
  }
  
  // Thử với query parameters thay vì headers
  private getAuthQueryParams(method: string = 'default'): string {
    const apiSecret = this.config.apiSecret || this.config.apiKey;
    
    const params = new URLSearchParams();
    
    switch(method) {
      case 'queryApiKey':
        params.append('api_key', this.config.apiKey);
        break;
      case 'queryApiKeyStore':
        params.append('api_key', this.config.apiKey);
        if (this.config.storeId) params.append('store_id', this.config.storeId);
        break;
      case 'queryFull':
        params.append('api_key', this.config.apiKey);
        if (apiSecret) params.append('api_secret', apiSecret);
        if (this.config.storeId) params.append('store_id', this.config.storeId);
        break;
      case 'queryToken':
        params.append('token', this.config.apiKey);
        break;
      default:
        return '';
    }
    
    return params.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    tryAuthMethods: boolean = false
  ): Promise<T> {
    // Ở development, thử dùng proxy trước
    const isDev = import.meta.env.DEV;
    let baseUrl = this.baseUrl;
    
    if (isDev && endpoint.startsWith('/')) {
      // Thử proxy trước nếu ở development
      const proxyUrl = baseUrl.includes('pos.pancake.vn') 
        ? '/api/pancake-pos'
        : '/api/pancake';
      baseUrl = proxyUrl;
    }
    
    const url = `${baseUrl}${endpoint}`;
    
    // Nếu đã tìm được method hoạt động, dùng nó
    if (this.workingAuthMethod && !tryAuthMethods) {
      const headers = this.getAuthHeaders(this.workingAuthMethod);
      return this.tryRequest(url, headers, options);
    }

    // Thử các phương thức authentication khác nhau
    const authMethods = [
      'default', 
      'bearer', 
      'apiKeyHeader', 
      'apiKeySecret', 
      'apiKeyStoreId', 
      'bearerStoreId',
      'fullHeaders',
      'apikeyLowercase',
      'token'
    ];
    
    let lastError: Error | null = null;

    // Thử với headers trước
    for (const method of authMethods) {
      try {
        const headers = this.getAuthHeaders(method);
        const result = await this.tryRequest(url, headers, options);
        
        // Lưu method hoạt động
        if (!this.workingAuthMethod) {
          this.workingAuthMethod = method;
          this.baseUrl = baseUrl;
          console.log(`✅ Found working auth method: ${method}, baseUrl: ${baseUrl}`);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Tiếp tục thử method tiếp theo
      }
    }

    // Nếu headers không hoạt động, thử với query parameters
    const queryMethods = ['queryApiKey', 'queryApiKeyStore', 'queryFull', 'queryToken'];
    const separator = url.includes('?') ? '&' : '?';
    
    for (const method of queryMethods) {
      try {
        const queryParams = this.getAuthQueryParams(method);
        if (!queryParams) continue;
        
        const urlWithQuery = `${url}${separator}${queryParams}`;
        const headers = { 'Content-Type': 'application/json' };
        
        const result = await this.tryRequest(urlWithQuery, headers, options);
        
        // Lưu method hoạt động
        if (!this.workingAuthMethod) {
          this.workingAuthMethod = method;
          this.baseUrl = baseUrl;
          console.log(`✅ Found working auth method (query): ${method}, baseUrl: ${baseUrl}`);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Tiếp tục thử method tiếp theo
      }
    }

    throw lastError || new Error('Tất cả các phương thức authentication đều thất bại');
  }

  private async tryRequest<T>(
    url: string,
    headers: Record<string, string>,
    options: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        mode: 'cors',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails: any = null;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData;
        } catch {
          // Không parse được JSON, thử lấy text
          try {
            const text = await response.text();
            if (text) errorMessage = `HTTP ${response.status}: ${text.substring(0, 200)}`;
          } catch {
            // Không lấy được text, dùng message mặc định
          }
        }
        
        // Chi tiết lỗi theo status code
        if (response.status === 401) {
          errorMessage = 'Lỗi xác thực: API Key không hợp lệ hoặc không đủ quyền.';
        } else if (response.status === 403) {
          errorMessage = 'Không có quyền truy cập: Kiểm tra lại API Key và Store ID.';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint không tồn tại: Kiểm tra lại Base URL và endpoint.';
        } else if (response.status === 500) {
          // HTTP 500 có thể do authentication method không đúng hoặc format request sai
          errorMessage = `HTTP 500: Server error. Có thể do:\n` +
            `- Authentication method không đúng\n` +
            `- Format request không đúng\n` +
            `- API Key hoặc Store ID không hợp lệ\n` +
            `- Endpoint không tồn tại\n\n` +
            `Chi tiết: ${errorMessage}`;
        } else if (response.status === 0 || response.status === undefined) {
          errorMessage = 'Lỗi CORS: API không cho phép request từ browser.';
        }
        
        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      return await response.json();
    } catch (error) {
      // Cải thiện error message cho network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Không thể kết nối đến Pancake POS. ' +
          'Có thể do:\n' +
          '1. CORS - API không cho phép request từ browser\n' +
          '2. Base URL không đúng\n' +
          '3. Kết nối mạng có vấn đề\n\n' +
          'Giải pháp: Cần cấu hình proxy trong vite.config.ts hoặc dùng server-side API.'
        );
      }
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    const testEndpoints = [
      ...POSSIBLE_ENDPOINTS.test,
      '/products?limit=1',
      '/orders?limit=1',
    ];

    const errors: string[] = [];
    
    // Thử với Base URL hiện tại trước
    for (const endpoint of testEndpoints) {
      try {
        console.log(`🧪 Testing: ${this.baseUrl}${endpoint}`);
        const response = await this.request<any>(endpoint, { method: 'GET' }, true);
        
        return {
          success: true,
          message: `Kết nối thành công! Endpoint: ${endpoint}, Auth Method: ${this.workingAuthMethod || 'default'}`,
          details: {
            baseUrl: this.baseUrl,
            endpoint,
            authMethod: this.workingAuthMethod,
          },
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${this.baseUrl}${endpoint}: ${errorMsg}`);
        console.log(`❌ Failed: ${errorMsg}`);
      }
    }

    // Nếu Base URL hiện tại không hoạt động, thử các Base URL khác
    for (const baseUrl of POSSIBLE_BASE_URLS) {
      if (baseUrl === this.baseUrl) continue; // Đã thử rồi
      
      this.baseUrl = baseUrl;
      
      for (const endpoint of testEndpoints.slice(0, 2)) { // Chỉ thử 2 endpoint đầu
        try {
          console.log(`🧪 Testing: ${baseUrl}${endpoint}`);
          const response = await this.request<any>(endpoint, { method: 'GET' }, true);
          
          return {
            success: true,
            message: `Kết nối thành công! Base URL: ${baseUrl}, Endpoint: ${endpoint}, Auth Method: ${this.workingAuthMethod || 'default'}`,
            details: {
              baseUrl,
              endpoint,
              authMethod: this.workingAuthMethod,
            },
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`${baseUrl}${endpoint}: ${errorMsg}`);
        }
      }
    }

    // Không tìm được cách nào hoạt động
    return {
      success: false,
      message: 'Không thể kết nối đến Pancake POS. Đã thử tất cả các phương pháp.\n\n' +
               'Các lỗi gặp phải:\n' + errors.slice(0, 5).join('\n') +
               '\n\nVui lòng:\n' +
               '1. Kiểm tra lại API Key và Store ID\n' +
               '2. Kiểm tra tài liệu API của Pancake POS\n' +
               '3. Liên hệ hỗ trợ Pancake POS để xác nhận Base URL và authentication method',
      details: { errors: errors.slice(0, 10) },
    };
  }

  async getProducts(params?: {
    page?: number;
    limit?: number;
    updatedSince?: string;
  }): Promise<{ products: PancakeProduct[]; total: number; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.updatedSince) queryParams.append('updated_since', params.updatedSince);

    const query = queryParams.toString();
    
    // Thử các endpoint khác nhau
    for (const endpoint of POSSIBLE_ENDPOINTS.products) {
      try {
        const fullEndpoint = `${endpoint}${query ? `?${query}` : ''}`;
        return await this.request<{ products: PancakeProduct[]; total: number; hasMore: boolean }>(
          fullEndpoint,
          { method: 'GET' }
        );
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }

    throw new Error('Không thể lấy danh sách sản phẩm từ bất kỳ endpoint nào');
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    updatedSince?: string;
  }): Promise<{ orders: PancakeOrder[]; total: number; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.updatedSince) queryParams.append('updated_since', params.updatedSince);

    const query = queryParams.toString();
    
    // Thử các endpoint khác nhau
    for (const endpoint of POSSIBLE_ENDPOINTS.orders) {
      try {
        const fullEndpoint = `${endpoint}${query ? `?${query}` : ''}`;
        return await this.request<{ orders: PancakeOrder[]; total: number; hasMore: boolean }>(
          fullEndpoint,
          { method: 'GET' }
        );
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }

    throw new Error('Không thể lấy danh sách đơn hàng từ bất kỳ endpoint nào');
  }

  async getProductById(id: string): Promise<PancakeProduct> {
    for (const baseEndpoint of POSSIBLE_ENDPOINTS.products) {
      try {
        return await this.request<PancakeProduct>(`${baseEndpoint}/${id}`, {
          method: 'GET',
        });
      } catch {
        continue;
      }
    }
    throw new Error(`Không tìm thấy sản phẩm với ID: ${id}`);
  }

  async getOrderById(id: string): Promise<PancakeOrder> {
    for (const baseEndpoint of POSSIBLE_ENDPOINTS.orders) {
      try {
        return await this.request<PancakeOrder>(`${baseEndpoint}/${id}`, {
          method: 'GET',
        });
      } catch {
        continue;
      }
    }
    throw new Error(`Không tìm thấy đơn hàng với ID: ${id}`);
  }

  // ... (giữ nguyên các method mapping và create/update)
  mapPancakeProductToLocal(pancakeProduct: PancakeProduct, localId?: string): Product {
    return {
      id: localId || `pancake_${pancakeProduct.id}`,
      code: pancakeProduct.code || pancakeProduct.sku || pancakeProduct.id,
      name: pancakeProduct.name,
      price: pancakeProduct.price,
      image: pancakeProduct.image,
      stock: pancakeProduct.stock || 0,
      category: pancakeProduct.category,
      description: pancakeProduct.description,
      createdAt: pancakeProduct.createdAt,
      updatedAt: pancakeProduct.updatedAt,
    };
  }

  mapLocalProductToPancake(localProduct: Product): Partial<PancakeProduct> {
    return {
      code: localProduct.code,
      name: localProduct.name,
      price: localProduct.price,
      image: localProduct.image,
      stock: localProduct.stock,
      category: localProduct.category,
      description: localProduct.description,
    };
  }

  mapPancakeOrderToLocal(
    pancakeOrder: PancakeOrder,
    localId?: string,
    customerId?: string
  ): Order {
    const mapStatus = (pancakeStatus: string): OrderStatus => {
      const statusMap: Record<string, OrderStatus> = {
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
      return statusMap[pancakeStatus.toLowerCase()] || 'new';
    };

    const items: OrderItem[] = pancakeOrder.items.map((item, index) => ({
      id: `${localId || 'temp'}_item_${index}`,
      productId: `pancake_${item.productId}`,
      productCode: item.productCode,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      total: item.total,
    }));

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = pancakeOrder.discount || 0;
    const taxAmount = pancakeOrder.tax || 0;
    const shippingFee = pancakeOrder.shippingFee || 0;
    const finalAmount = pancakeOrder.finalAmount || (totalAmount - discountAmount + taxAmount + shippingFee);
    const paid = pancakeOrder.paid || 0;

    return {
      id: localId || `pancake_${pancakeOrder.id}`,
      orderNumber: pancakeOrder.orderNumber,
      customerId: customerId || pancakeOrder.customerId || 'unknown',
      customerName: pancakeOrder.customerName,
      customerPhone: pancakeOrder.customerPhone,
      items,
      payment: {
        totalAmount,
        discount: 0,
        discountAmount,
        shippingFee,
        tax: pancakeOrder.tax || 0,
        taxAmount,
        additionalFee: 0,
        bankTransfer: 0,
        finalAmount,
        paid,
        remaining: Math.max(0, finalAmount - paid),
        cod: Math.max(0, finalAmount - paid),
      },
      shipping: {
        recipientName: pancakeOrder.shippingAddress?.recipientName || pancakeOrder.customerName,
        recipientPhone: pancakeOrder.shippingAddress?.recipientPhone || pancakeOrder.customerPhone,
        address: pancakeOrder.shippingAddress?.address || '',
        province: pancakeOrder.shippingAddress?.province || '',
        district: pancakeOrder.shippingAddress?.district || '',
        ward: pancakeOrder.shippingAddress?.ward || '',
        freeShipping: !pancakeOrder.shippingFee || pancakeOrder.shippingFee === 0,
      },
      notes: pancakeOrder.notes ? [{
        id: Date.now().toString(),
        type: 'internal',
        content: pancakeOrder.notes,
        createdBy: 'Pancake POS',
        createdAt: new Date().toISOString(),
      }] : [],
      status: mapStatus(pancakeOrder.status),
      tags: [],
      printCount: 0,
      createdAt: pancakeOrder.createdAt,
      updatedAt: pancakeOrder.updatedAt,
    };
  }

  createProduct(product: Partial<PancakeProduct>): Promise<PancakeProduct> {
    for (const baseEndpoint of POSSIBLE_ENDPOINTS.products) {
      try {
        return this.request<PancakeProduct>(baseEndpoint, {
          method: 'POST',
          body: JSON.stringify(product),
        });
      } catch {
        continue;
      }
    }
    throw new Error('Không thể tạo sản phẩm');
  }

  updateProduct(id: string, product: Partial<PancakeProduct>): Promise<PancakeProduct> {
    for (const baseEndpoint of POSSIBLE_ENDPOINTS.products) {
      try {
        return this.request<PancakeProduct>(`${baseEndpoint}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(product),
        });
      } catch {
        continue;
      }
    }
    throw new Error('Không thể cập nhật sản phẩm');
  }

  createOrder(order: Partial<PancakeOrder>): Promise<PancakeOrder> {
    for (const baseEndpoint of POSSIBLE_ENDPOINTS.orders) {
      try {
        return this.request<PancakeOrder>(baseEndpoint, {
          method: 'POST',
          body: JSON.stringify(order),
        });
      } catch {
        continue;
      }
    }
    throw new Error('Không thể tạo đơn hàng');
  }

  updateOrder(id: string, order: Partial<PancakeOrder>): Promise<PancakeOrder> {
    for (const baseEndpoint of POSSIBLE_ENDPOINTS.orders) {
      try {
        return this.request<PancakeOrder>(`${baseEndpoint}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(order),
        });
      } catch {
        continue;
      }
    }
    throw new Error('Không thể cập nhật đơn hàng');
  }
}
