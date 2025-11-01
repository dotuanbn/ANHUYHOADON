// Webhook handler để nhận dữ liệu từ Pancake POS
// Có thể deploy lên Vercel Serverless Functions hoặc Netlify Functions

import { PancakeProduct, PancakeOrder } from '@/types/pancake';
import { Product, Order, Customer } from '@/types';
import { addProduct, updateProduct, addCustomer, addOrder, updateOrder } from '@/lib/storage';

export interface PancakeWebhookPayload {
  event: 'order.created' | 'order.updated' | 'product.created' | 'product.updated' | 'customer.created' | 'customer.updated' | 'inventory.updated';
  data: PancakeProduct | PancakeOrder | any;
  timestamp: string;
  store_id?: string;
}

// Map Pancake data to local format
function mapPancakeProductToLocal(pancakeProduct: any): Product {
  return {
    id: `pancake_${pancakeProduct.id}`,
    code: pancakeProduct.code || pancakeProduct.sku || pancakeProduct.id,
    name: pancakeProduct.name,
    price: pancakeProduct.price || 0,
    stock: pancakeProduct.stock || pancakeProduct.inventory || 0,
    image: pancakeProduct.image,
    category: pancakeProduct.category,
    description: pancakeProduct.description,
    createdAt: pancakeProduct.created_at || new Date().toISOString(),
    updatedAt: pancakeProduct.updated_at || new Date().toISOString(),
  };
}

function mapPancakeOrderToLocal(pancakeOrder: any, customerId?: string): Order {
  const items = (pancakeOrder.items || []).map((item: any, index: number) => ({
    id: `${pancakeOrder.id}_item_${index}`,
    productId: `pancake_${item.product_id || item.productId}`,
    productCode: item.product_code || item.productCode || '',
    productName: item.product_name || item.productName || '',
    quantity: item.quantity || 0,
    price: item.price || 0,
    discount: item.discount || 0,
    total: item.total || (item.quantity * item.price),
  }));

  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const discountAmount = pancakeOrder.discount_amount || pancakeOrder.discount || 0;
  const shippingFee = pancakeOrder.shipping_fee || pancakeOrder.shippingFee || 0;
  const taxAmount = pancakeOrder.tax_amount || pancakeOrder.taxAmount || 0;
  const finalAmount = pancakeOrder.final_amount || pancakeOrder.finalAmount || (totalAmount - discountAmount + shippingFee + taxAmount);
  const paid = pancakeOrder.paid_amount || pancakeOrder.paidAmount || 0;

  return {
    id: `pancake_${pancakeOrder.id}`,
    orderNumber: pancakeOrder.order_number || pancakeOrder.orderNumber || pancakeOrder.id,
    customerId: customerId || pancakeOrder.customer_id || pancakeOrder.customerId || 'unknown',
    customerName: pancakeOrder.customer_name || pancakeOrder.customerName || '',
    customerPhone: pancakeOrder.customer_phone || pancakeOrder.customerPhone || '',
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
      recipientName: pancakeOrder.shipping_address?.recipient_name || pancakeOrder.customer_name || '',
      recipientPhone: pancakeOrder.shipping_address?.recipient_phone || pancakeOrder.customer_phone || '',
      address: pancakeOrder.shipping_address?.address || pancakeOrder.shipping_address || '',
      province: pancakeOrder.shipping_address?.province || '',
      district: pancakeOrder.shipping_address?.district || '',
      ward: pancakeOrder.shipping_address?.ward || '',
      freeShipping: !shippingFee || shippingFee === 0,
    },
    notes: [],
    status: mapOrderStatus(pancakeOrder.status),
    tags: [],
    printCount: 0,
    createdAt: pancakeOrder.created_at || pancakeOrder.createdAt || new Date().toISOString(),
    updatedAt: pancakeOrder.updated_at || pancakeOrder.updatedAt || new Date().toISOString(),
  };
}

function mapOrderStatus(status: string): Order['status'] {
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

function mapPancakeCustomerToLocal(pancakeCustomer: any): Customer {
  const fullAddress = [
    pancakeCustomer.address,
    pancakeCustomer.ward,
    pancakeCustomer.district,
    pancakeCustomer.province
  ].filter(Boolean).join(', ');

  return {
    id: `pancake_${pancakeCustomer.id}`,
    name: pancakeCustomer.name,
    phone: pancakeCustomer.phone,
    email: pancakeCustomer.email,
    addresses: [{
      id: Date.now().toString(),
      recipientName: pancakeCustomer.name,
      recipientPhone: pancakeCustomer.phone || '',
      province: pancakeCustomer.province || '',
      district: pancakeCustomer.district || '',
      ward: pancakeCustomer.ward || '',
      street: pancakeCustomer.address || '',
      fullAddress: fullAddress,
      isDefault: true,
    }],
    totalOrders: 0,
    successfulOrders: 0,
    totalSpent: 0,
    createdAt: pancakeCustomer.created_at || new Date().toISOString(),
    updatedAt: pancakeCustomer.updated_at || new Date().toISOString(),
  };
}

export async function handlePancakeWebhook(payload: PancakeWebhookPayload): Promise<{ success: boolean; message: string }> {
  try {
    switch (payload.event) {
      case 'product.created':
      case 'product.updated':
        const product = mapPancakeProductToLocal(payload.data);
        const existingProduct = window.localStorage.getItem(`product_${product.id}`);
        if (existingProduct) {
          updateProduct(product.id, product);
          return { success: true, message: `Đã cập nhật sản phẩm: ${product.name}` };
        } else {
          addProduct(product);
          return { success: true, message: `Đã thêm sản phẩm: ${product.name}` };
        }

      case 'order.created':
      case 'order.updated':
        // Tìm hoặc tạo customer trước
        let customerId: string | undefined = undefined;
        if (payload.data.customer_id || payload.data.customerId) {
          const customerData = payload.data.customer || payload.data;
          const customer = mapPancakeCustomerToLocal({
            id: payload.data.customer_id || payload.data.customerId,
            name: customerData.customer_name || customerData.customerName || '',
            phone: customerData.customer_phone || customerData.customerPhone || '',
            email: customerData.email || '',
            address: customerData.address || '',
            province: customerData.province || '',
            district: customerData.district || '',
            ward: customerData.ward || '',
          });
          
          // Kiểm tra customer đã tồn tại chưa
          const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
          const existingCustomer = existingCustomers.find((c: Customer) => c.phone === customer.phone);
          
          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            addCustomer(customer);
            customerId = customer.id;
          }
        }

        const order = mapPancakeOrderToLocal(payload.data, customerId);
        const existingOrder = window.localStorage.getItem(`order_${order.id}`);
        
        if (existingOrder) {
          updateOrder(order.id, order);
          return { success: true, message: `Đã cập nhật đơn hàng: ${order.orderNumber}` };
        } else {
          addOrder(order);
          return { success: true, message: `Đã thêm đơn hàng: ${order.orderNumber}` };
        }

      case 'customer.created':
      case 'customer.updated':
        const customer = mapPancakeCustomerToLocal(payload.data);
        const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        const existingCustomerIndex = existingCustomers.findIndex((c: Customer) => c.id === customer.id || c.phone === customer.phone);
        
        if (existingCustomerIndex >= 0) {
          // Update customer logic here
          return { success: true, message: `Đã cập nhật khách hàng: ${customer.name}` };
        } else {
          addCustomer(customer);
          return { success: true, message: `Đã thêm khách hàng: ${customer.name}` };
        }

      case 'inventory.updated':
        // Cập nhật tồn kho sản phẩm
        const inventoryData = payload.data;
        const productId = `pancake_${inventoryData.product_id || inventoryData.productId}`;
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const productIndex = products.findIndex((p: Product) => p.id === productId);
        
        if (productIndex >= 0) {
          products[productIndex].stock = inventoryData.stock || inventoryData.quantity || 0;
          products[productIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('products', JSON.stringify(products));
          return { success: true, message: `Đã cập nhật tồn kho sản phẩm` };
        }
        return { success: false, message: 'Không tìm thấy sản phẩm để cập nhật tồn kho' };

      default:
        return { success: false, message: `Event không được hỗ trợ: ${payload.event}` };
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi không xác định khi xử lý webhook',
    };
  }
}

