// Utility để parse và import đơn hàng từ file Excel
import * as XLSX from 'xlsx';
import { Order, OrderItem, Payment, Shipping, OrderStatus } from '@/types';
import { 
  addOrder, 
  getOrders, 
  generateOrderNumber,
  getProducts,
  getCustomerByPhone,
  addCustomer
} from '@/lib/storage';

export interface ExcelRow {
  [key: string]: any;
}

export interface OrderColumnMapping {
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  productCode?: string;
  productName?: string;
  quantity?: string;
  price?: string;
  totalAmount?: string;
  discount?: string;
  shippingFee?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
}

export interface ImportOrderResult {
  success: boolean;
  total: number;
  created: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  orders: Order[];
}

// Parse file Excel thành array of objects
export const parseExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Không thể đọc file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
          reject(new Error('Không tìm thấy sheet trong file Excel'));
          return;
        }
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: ''
        }) as ExcelRow[];

        // Lọc bỏ dòng trống
        const filteredData = jsonData.filter(row => {
          return Object.values(row).some(val => val && String(val).trim());
        });

        if (filteredData.length === 0) {
          reject(new Error('File Excel không có dữ liệu'));
          return;
        }

        resolve(filteredData);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Lỗi khi parse file Excel'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Helper để parse số
const parseNumber = (value: string | number | null | undefined, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return isNaN(value) ? defaultValue : Math.max(0, value);
  
  const str = String(value).trim();
  if (!str) return defaultValue;
  
  let cleanStr = str.replace(/[^\d.,-]/g, '');
  
  if (cleanStr.includes('.') && cleanStr.includes(',')) {
    cleanStr = cleanStr.replace(/,/g, '');
  } else if (cleanStr.includes(',')) {
    const parts = cleanStr.split(',');
    if (parts.length > 1 && parts[parts.length - 1].length <= 2) {
      cleanStr = cleanStr.replace(/,/g, '.');
    } else {
      cleanStr = cleanStr.replace(/,/g, '');
    }
  }
  
  const num = parseFloat(cleanStr);
  return isNaN(num) ? defaultValue : Math.max(0, num);
};

// Auto-detect column mapping
export const detectOrderColumnMapping = (rows: ExcelRow[]): OrderColumnMapping => {
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const mapping: OrderColumnMapping = {};
  const columnNames = Object.keys(firstRow);
  
  const findColumn = (patterns: string[]): string | undefined => {
    const exactMatch = columnNames.find(col => 
      patterns.some(pattern => 
        col.toLowerCase().trim() === pattern.toLowerCase().trim()
      )
    );
    if (exactMatch) return exactMatch;
    
    return columnNames.find(col => 
      patterns.some(pattern => 
        col.toLowerCase().includes(pattern.toLowerCase()) ||
        pattern.toLowerCase().includes(col.toLowerCase())
      )
    );
  };

  // Mapping patterns cho POS Pancake và các hệ thống khác
  const orderNumberPatterns = ['số đơn', 'mã đơn', 'order number', 'order_number', 'mã đơn hàng', 'order id', 'order_id', 'đơn hàng'];
  const customerNamePatterns = ['tên khách', 'khách hàng', 'customer name', 'customer_name', 'tên', 'name', 'người nhận', 'recipient name'];
  const customerPhonePatterns = ['số điện thoại', 'điện thoại', 'phone', 'sđt', 'customer phone', 'customer_phone', 'số phone'];
  const productCodePatterns = ['mã sp', 'mã sản phẩm', 'product code', 'product_code', 'code', 'sku', 'mã hàng'];
  const productNamePatterns = ['tên sp', 'tên sản phẩm', 'product name', 'product_name', 'tên hàng', 'sản phẩm'];
  const quantityPatterns = ['số lượng', 'quantity', 'qty', 'sl', 'số lượng sp'];
  const pricePatterns = ['giá', 'price', 'đơn giá', 'unit price', 'giá đơn vị'];
  const totalAmountPatterns = ['tổng tiền', 'thành tiền', 'total', 'total amount', 'total_amount', 'tổng', 'tổng cộng'];
  const discountPatterns = ['giảm giá', 'discount', 'khuyến mãi', 'promotion'];
  const shippingFeePatterns = ['phí ship', 'phí vận chuyển', 'shipping fee', 'shipping_fee', 'phí giao hàng'];
  const addressPatterns = ['địa chỉ', 'address', 'địa chỉ giao hàng', 'shipping address'];
  const provincePatterns = ['tỉnh', 'thành phố', 'province', 'city', 'tỉnh/thành'];
  const districtPatterns = ['quận', 'huyện', 'district', 'quận/huyện'];
  const wardPatterns = ['phường', 'xã', 'ward', 'phường/xã'];
  const statusPatterns = ['trạng thái', 'status', 'tình trạng'];
  const notesPatterns = ['ghi chú', 'note', 'notes', 'mô tả', 'description'];
  const createdAtPatterns = ['ngày tạo', 'ngày đặt', 'created at', 'created_at', 'date', 'ngày'];

  mapping.orderNumber = findColumn(orderNumberPatterns);
  mapping.customerName = findColumn(customerNamePatterns);
  mapping.customerPhone = findColumn(customerPhonePatterns);
  mapping.productCode = findColumn(productCodePatterns);
  mapping.productName = findColumn(productNamePatterns);
  mapping.quantity = findColumn(quantityPatterns);
  mapping.price = findColumn(pricePatterns);
  mapping.totalAmount = findColumn(totalAmountPatterns);
  mapping.discount = findColumn(discountPatterns);
  mapping.shippingFee = findColumn(shippingFeePatterns);
  mapping.address = findColumn(addressPatterns);
  mapping.province = findColumn(provincePatterns);
  mapping.district = findColumn(districtPatterns);
  mapping.ward = findColumn(wardPatterns);
  mapping.status = findColumn(statusPatterns);
  mapping.notes = findColumn(notesPatterns);
  mapping.createdAt = findColumn(createdAtPatterns);

  return mapping;
};

// Convert Excel row thành Order
export const convertRowToOrder = (
  row: ExcelRow,
  mapping: OrderColumnMapping,
  rowIndex: number,
  existingOrders: Order[]
): { order: Order | null; error: string | null } => {
  try {
    const getValue = (col: string | undefined): string => {
      if (!col) return '';
      const value = row[col];
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    // Lấy thông tin cơ bản
    const orderNumber = getValue(mapping.orderNumber) || generateOrderNumber();
    const customerName = getValue(mapping.customerName);
    const customerPhone = getValue(mapping.customerPhone);
    const productCode = getValue(mapping.productCode);
    const productName = getValue(mapping.productName);
    const quantityStr = getValue(mapping.quantity);
    const priceStr = getValue(mapping.price);
    const totalAmountStr = getValue(mapping.totalAmount);
    const discountStr = getValue(mapping.discount);
    const shippingFeeStr = getValue(mapping.shippingFee);
    const address = getValue(mapping.address);
    const province = getValue(mapping.province);
    const district = getValue(mapping.district);
    const ward = getValue(mapping.ward);
    const statusStr = getValue(mapping.status);
    const notes = getValue(mapping.notes);
    const createdAtStr = getValue(mapping.createdAt);

    // Validate required fields
    if (!customerName && !customerPhone) {
      return {
        order: null,
        error: `Dòng ${rowIndex + 2}: Thiếu tên khách hàng hoặc số điện thoại`
      };
    }

    if (!productCode && !productName) {
      return {
        order: null,
        error: `Dòng ${rowIndex + 2}: Thiếu mã sản phẩm hoặc tên sản phẩm`
      };
    }

    // Parse số lượng và giá
    const quantity = parseNumber(quantityStr, 1);
    const unitPrice = parseNumber(priceStr, 0);
    const totalAmount = parseNumber(totalAmountStr, 0);
    const discount = parseNumber(discountStr, 0);
    const shippingFee = parseNumber(shippingFeeStr, 0);

    // Tính toán giá trị
    const itemTotal = totalAmount || (unitPrice * quantity);
    const itemDiscount = discount || 0;
    const finalItemTotal = itemTotal - itemDiscount;

    // Tìm hoặc tạo sản phẩm
    const products = getProducts();
    let product = products.find(p => 
      p.code.toLowerCase() === productCode.toLowerCase() ||
      p.name.toLowerCase() === productName.toLowerCase()
    );

    // Nếu không tìm thấy sản phẩm, tạo mới
    if (!product && productCode) {
      product = {
        id: `import_${Date.now()}_${rowIndex}`,
        code: productCode,
        name: productName || productCode,
        price: unitPrice || 0,
        stock: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Không tự động thêm sản phẩm, chỉ dùng để tạo order item
    }

    // Tạo OrderItem
    const orderItem: OrderItem = {
      id: `item_${Date.now()}_${rowIndex}`,
      productId: product?.id || `unknown_${rowIndex}`,
      productCode: productCode || product?.code || 'UNKNOWN',
      productName: productName || product?.name || 'Sản phẩm không xác định',
      productImage: product?.image,
      quantity: quantity,
      price: unitPrice || product?.price || 0,
      discount: itemDiscount,
      total: finalItemTotal,
      notes: notes || undefined,
    };

    // Tìm hoặc tạo khách hàng
    let customerId = '';
    if (customerPhone) {
      const existingCustomer = getCustomerByPhone(customerPhone);
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Tạo khách hàng mới
        const newCustomer = {
          id: `customer_${Date.now()}_${rowIndex}`,
          name: customerName || 'Khách hàng',
          phone: customerPhone,
          addresses: [],
          totalOrders: 0,
          successfulOrders: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addCustomer(newCustomer);
        customerId = newCustomer.id;
      }
    } else {
      // Tạo khách hàng không có số điện thoại
      const newCustomer = {
        id: `customer_${Date.now()}_${rowIndex}`,
        name: customerName || 'Khách hàng',
        addresses: [],
        totalOrders: 0,
        successfulOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addCustomer(newCustomer);
      customerId = newCustomer.id;
    }

    // Parse status
    let status: OrderStatus = 'new';
    if (statusStr) {
      const statusLower = statusStr.toLowerCase();
      if (statusLower.includes('mới') || statusLower.includes('new')) status = 'new';
      else if (statusLower.includes('xác nhận') || statusLower.includes('confirmed')) status = 'confirmed';
      else if (statusLower.includes('xử lý') || statusLower.includes('processing')) status = 'processing';
      else if (statusLower.includes('giao') || statusLower.includes('shipping')) status = 'shipping';
      else if (statusLower.includes('đã giao') || statusLower.includes('delivered')) status = 'delivered';
      else if (statusLower.includes('hủy') || statusLower.includes('cancelled')) status = 'cancelled';
      else if (statusLower.includes('trả') || statusLower.includes('returned')) status = 'returned';
    }

    // Parse ngày tạo
    let createdAt = new Date().toISOString();
    if (createdAtStr) {
      try {
        const parsedDate = new Date(createdAtStr);
        if (!isNaN(parsedDate.getTime())) {
          createdAt = parsedDate.toISOString();
        }
      } catch (e) {
        // Giữ nguyên ngày hiện tại
      }
    }

    // Tính toán payment
    const payment: Payment = {
      totalAmount: itemTotal,
      discount: itemDiscount,
      discountAmount: itemDiscount,
      shippingFee: shippingFee,
      tax: 0,
      taxAmount: 0,
      additionalFee: 0,
      bankTransfer: 0,
      finalAmount: finalItemTotal + shippingFee,
      paid: 0,
      remaining: finalItemTotal + shippingFee,
      cod: finalItemTotal + shippingFee,
    };

    // Tạo shipping
    const fullAddress = [address, ward, district, province].filter(Boolean).join(', ');
    const shipping: Shipping = {
      recipientName: customerName || 'Khách hàng',
      recipientPhone: customerPhone || '',
      address: fullAddress || address || '',
      province: province || '',
      district: district || '',
      ward: ward || '',
      freeShipping: shippingFee === 0,
    };

    // Tạo Order
    const order: Order = {
      id: `order_${Date.now()}_${rowIndex}`,
      orderNumber: orderNumber,
      customerId: customerId,
      customerName: customerName || 'Khách hàng',
      customerPhone: customerPhone || '',
      items: [orderItem],
      payment: payment,
      shipping: shipping,
      notes: notes ? [{ 
        id: `note_${Date.now()}`,
        type: 'internal',
        content: notes,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
      }] : [],
      status: status,
      tags: [],
      printCount: 0,
      createdAt: createdAt,
      updatedAt: new Date().toISOString(),
    };

    return { order, error: null };
  } catch (error) {
    return {
      order: null,
      error: `Dòng ${rowIndex + 2}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
    };
  }
};

// Preview orders từ Excel (không lưu vào database)
export const previewOrdersFromExcel = (
  rows: ExcelRow[],
  mapping: OrderColumnMapping
): ImportOrderResult => {
  const result: ImportOrderResult = {
    success: true,
    total: rows.length,
    created: 0,
    skipped: 0,
    errors: [],
    orders: [],
  };

  const existingOrders = getOrders();
  const orderNumberSet = new Set(existingOrders.map(o => o.orderNumber));

  rows.forEach((row, index) => {
    try {
      // Skip empty rows
      const hasData = Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).trim().length > 0;
      });
      
      if (!hasData) {
        result.skipped++;
        return;
      }

      const { order, error } = convertRowToOrder(row, mapping, index, existingOrders);

      if (error) {
        result.errors.push({ row: index + 2, error });
        result.skipped++;
        return;
      }

      if (!order) {
        result.errors.push({ 
          row: index + 2, 
          error: `Không thể tạo đơn hàng từ dòng này` 
        });
        result.skipped++;
        return;
      }

      // Kiểm tra duplicate order number
      if (orderNumberSet.has(order.orderNumber)) {
        result.errors.push({ 
          row: index + 2, 
          error: `Số đơn hàng "${order.orderNumber}" đã tồn tại` 
        });
        result.skipped++;
        return;
      }

      // Chỉ thêm vào preview, không lưu vào database
      orderNumberSet.add(order.orderNumber);
      result.created++;
      result.orders.push(order);
    } catch (error) {
      result.errors.push({ 
        row: index + 2, 
        error: `Lỗi xử lý: ${error instanceof Error ? error.message : 'Lỗi không xác định'}` 
      });
      result.skipped++;
    }
  });

  result.success = result.errors.length === 0 || result.created > 0;
  return result;
};

// Import orders từ Excel (lưu vào database)
export const importOrdersFromExcel = (
  rows: ExcelRow[],
  mapping: OrderColumnMapping
): ImportOrderResult => {
  const result: ImportOrderResult = {
    success: true,
    total: rows.length,
    created: 0,
    skipped: 0,
    errors: [],
    orders: [],
  };

  const existingOrders = getOrders();
  const orderNumberSet = new Set(existingOrders.map(o => o.orderNumber));

  rows.forEach((row, index) => {
    try {
      // Skip empty rows
      const hasData = Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).trim().length > 0;
      });
      
      if (!hasData) {
        result.skipped++;
        return;
      }

      const { order, error } = convertRowToOrder(row, mapping, index, existingOrders);

      if (error) {
        result.errors.push({ row: index + 2, error });
        result.skipped++;
        return;
      }

      if (!order) {
        result.errors.push({ 
          row: index + 2, 
          error: `Không thể tạo đơn hàng từ dòng này` 
        });
        result.skipped++;
        return;
      }

      // Kiểm tra duplicate order number
      if (orderNumberSet.has(order.orderNumber)) {
        result.errors.push({ 
          row: index + 2, 
          error: `Số đơn hàng "${order.orderNumber}" đã tồn tại` 
        });
        result.skipped++;
        return;
      }

      // Thêm đơn hàng vào database
      addOrder(order);
      orderNumberSet.add(order.orderNumber);
      result.created++;
      result.orders.push(order);
    } catch (error) {
      result.errors.push({ 
        row: index + 2, 
        error: `Lỗi xử lý: ${error instanceof Error ? error.message : 'Lỗi không xác định'}` 
      });
      result.skipped++;
    }
  });

  result.success = result.errors.length === 0 || result.created > 0;
  return result;
};

// Get available columns from Excel rows
export const getAvailableColumns = (rows: ExcelRow[]): string[] => {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
};

