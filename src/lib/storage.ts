// Local storage utilities for the order management system

import { Product, Customer, Order } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  ORDER_COUNTER: 'orderCounter',
};

// Generic storage functions
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// Products
export const getProducts = (): Product[] => {
  return storage.get<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
};

export const saveProducts = (products: Product[]): void => {
  storage.set(STORAGE_KEYS.PRODUCTS, products);
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
};

export const updateProduct = (id: string, updates: Partial<Product>): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
    saveProducts(products);
  }
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
};

export const getProductById = (id: string): Product | null => {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
};

export const getProductByCode = (code: string): Product | null => {
  const products = getProducts();
  return products.find(p => p.code === code) || null;
};

// Customers
export const getCustomers = (): Customer[] => {
  return storage.get<Customer[]>(STORAGE_KEYS.CUSTOMERS) || [];
};

export const saveCustomers = (customers: Customer[]): void => {
  storage.set(STORAGE_KEYS.CUSTOMERS, customers);
};

export const addCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  customers.push(customer);
  saveCustomers(customers);
};

export const updateCustomer = (id: string, updates: Partial<Customer>): void => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updates, updatedAt: new Date().toISOString() };
    saveCustomers(customers);
  }
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
};

export const getCustomerById = (id: string): Customer | null => {
  const customers = getCustomers();
  return customers.find(c => c.id === id) || null;
};

export const getCustomerByPhone = (phone: string): Customer | null => {
  const customers = getCustomers();
  return customers.find(c => c.phone === phone) || null;
};

// Orders
export const getOrders = (): Order[] => {
  return storage.get<Order[]>(STORAGE_KEYS.ORDERS) || [];
};

export const saveOrders = (orders: Order[]): void => {
  storage.set(STORAGE_KEYS.ORDERS, orders);
};

export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  
  // Update customer statistics
  updateCustomerStats(order.customerId);
};

export const updateOrder = (id: string, updates: Partial<Order>): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    const oldOrder = orders[index];
    orders[index] = { ...oldOrder, ...updates, updatedAt: new Date().toISOString() };
    saveOrders(orders);
    
    // Update customer statistics if needed
    if (oldOrder.customerId !== updates.customerId && updates.customerId) {
      updateCustomerStats(oldOrder.customerId);
      updateCustomerStats(updates.customerId);
    } else {
      updateCustomerStats(oldOrder.customerId);
    }
  }
};

export const deleteOrder = (id: string): void => {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (order) {
    const filtered = orders.filter(o => o.id !== id);
    saveOrders(filtered);
    updateCustomerStats(order.customerId);
  }
};

export const getOrderById = (id: string): Order | null => {
  const orders = getOrders();
  return orders.find(o => o.id === id) || null;
};

export const getOrdersByCustomer = (customerId: string): Order[] => {
  return getOrders().filter(o => o.customerId === customerId);
};

// Order number generation
export const generateOrderNumber = (): string => {
  const counter = storage.get<number>(STORAGE_KEYS.ORDER_COUNTER) || 0;
  const newCounter = counter + 1;
  storage.set(STORAGE_KEYS.ORDER_COUNTER, newCounter);
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const orderNum = newCounter.toString().padStart(6, '0');
  
  return `DH${year}${month}${day}${orderNum}`;
};

// Customer statistics update
const updateCustomerStats = (customerId: string): void => {
  const customer = getCustomerById(customerId);
  if (!customer) return;
  
  const orders = getOrdersByCustomer(customerId);
  const totalOrders = orders.length;
  const successfulOrders = orders.filter(o => o.status === 'delivered').length;
  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.payment.finalAmount, 0);
  const lastOrder = orders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  
  updateCustomer(customerId, {
    totalOrders,
    successfulOrders,
    totalSpent,
    lastOrderDate: lastOrder?.createdAt,
  });
};

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  if (getProducts().length === 0) {
    const sampleProducts: Product[] = [
      {
        id: '1',
        code: 'GARDE820',
        name: 'Máy rửa bát KF-GARDE820',
        price: 3650000,
        stock: 10,
        category: 'Máy rửa bát',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        code: 'AFS8AD',
        name: 'Nồi chiên không dầu KF - AFS8AD',
        price: 3080000,
        stock: 15,
        category: 'Nồi chiên',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        code: 'ST05304',
        name: 'Bộ nồi cao cấp 3 món Inox 304 Kaff KF-ST05304',
        price: 1748000,
        stock: 20,
        category: 'Bộ nồi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    saveProducts(sampleProducts);
  }
};


