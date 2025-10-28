// Types for the complete order management system

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  category?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
  totalOrders: number;
  successfulOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  referralCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface Payment {
  totalAmount: number;
  discount: number;
  discountAmount: number;
  shippingFee: number;
  tax: number;
  taxAmount: number;
  additionalFee: number;
  bankTransfer: number;
  finalAmount: number;
  paid: number;
  remaining: number;
  cod: number;
}

export interface Shipping {
  estimatedDeliveryDate?: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  trackingNumber?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  weight?: number;
  shippingMethod?: string;
  freeShipping: boolean;
}

export interface OrderNote {
  id: string;
  type: 'internal' | 'easy_print' | 'discussion';
  content: string;
  createdBy: string;
  createdAt: string;
}

export type OrderStatus = 'new' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  payment: Payment;
  shipping: Shipping;
  notes: OrderNote[];
  status: OrderStatus;
  assignedTo?: string;
  marketer?: string;
  tags: string[];
  printCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilter {
  status?: OrderStatus[];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  search?: string;
  assignedTo?: string;
}

export interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  totalRemaining: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: { productId: string; quantity: number; revenue: number }[];
  topCustomers: { customerId: string; orders: number; revenue: number }[];
}


